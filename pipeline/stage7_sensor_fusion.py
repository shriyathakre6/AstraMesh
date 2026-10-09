"""
AstraMesh3D - Stage 7: Sensor Fusion & Trajectory Alignment
SIH Problem Statement SIH26158
Fuses visual camera poses (COLMAP) with UAV GPS/altimeter telemetry by solving
a 7-DoF Sim(3) similarity transformation (scale s, rotation R, translation t) in local
Cartesian ENU meters via the Umeyama algorithm.
Resolves the metric scale ambiguity of both SfM and AI monocular depth point clouds,
upgrading the scale status to METRIC_GEOREFERENCED_SCALE.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline.common import StageResult

import numpy as np
import open3d as o3d
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


# WGS84 Ellipsoid constants
WGS84_A = 6378137.0          # Semi-major axis in meters
WGS84_F = 1.0 / 298.257223563 # Flattening
WGS84_E2 = 2.0 * WGS84_F - WGS84_F * WGS84_F # Eccentricity squared


def geodetic_to_ecef(lat_deg: np.ndarray, lon_deg: np.ndarray, alt_m: np.ndarray) -> np.ndarray:
    """Converts WGS84 geodetic coordinates (lat, lon, alt) to Earth-Centered Earth-Fixed (ECEF) in meters."""
    phi = np.radians(lat_deg)
    lam = np.radians(lon_deg)
    N = WGS84_A / np.sqrt(1.0 - WGS84_E2 * np.sin(phi)**2)
    x = (N + alt_m) * np.cos(phi) * np.cos(lam)
    y = (N + alt_m) * np.cos(phi) * np.sin(lam)
    z = (N * (1.0 - WGS84_E2) + alt_m) * np.sin(phi)
    return np.column_stack([x, y, z])


def ecef_to_enu(ecef_points: np.ndarray, lat0_deg: float, lon0_deg: float, ecef_origin: np.ndarray) -> np.ndarray:
    """Converts ECEF coordinates to local tangent plane East-North-Up (ENU) coordinates in meters."""
    delta = ecef_points - ecef_origin
    phi0 = np.radians(lat0_deg)
    lam0 = np.radians(lon0_deg)
    R_ecef2enu = np.array([
        [-np.sin(lam0), np.cos(lam0), 0.0],
        [-np.sin(phi0) * np.cos(lam0), -np.sin(phi0) * np.sin(lam0), np.cos(phi0)],
        [np.cos(phi0) * np.cos(lam0), np.cos(phi0) * np.sin(lam0), np.sin(phi0)]
    ])
    return (R_ecef2enu @ delta.T).T


def solve_umeyama_sim3(X: np.ndarray, Y: np.ndarray) -> Tuple[float, np.ndarray, np.ndarray]:
    """
    Solves the 7-DoF Sim(3) similarity transformation Y ~ s * R * X + t
    using the closed-form Umeyama algorithm.
    Guarantees det(R) = +1 (proper SO(3) rotation without reflection).
    """
    n, m = X.shape
    if n < 3:
        raise ValueError(f"At least 3 matched points required for Sim(3) alignment, got {n}")

    mu_x = X.mean(axis=0)
    mu_y = Y.mean(axis=0)

    X0 = X - mu_x
    Y0 = Y - mu_y

    sigma_x2 = np.mean(np.sum(X0**2, axis=1))
    if sigma_x2 < 1e-12:
        raise ValueError("Degenerate visual trajectory (zero spatial variance)")

    cov = (Y0.T @ X0) / n
    U, D, Vt = np.linalg.svd(cov)

    S = np.eye(m)
    if np.linalg.det(U) * np.linalg.det(Vt) < 0:
        S[-1, -1] = -1.0

    R = U @ S @ Vt
    scale = float(np.trace(np.diag(D) @ S) / sigma_x2)
    t = mu_y - scale * (R @ mu_x)

    return scale, R, t


class SensorFusionEngine:
    def __init__(
        self,
        reconstruction_manifest_path: str,
        frame_manifest_path: str,
        output_dir: str,
        sparse_ply_path: Optional[str] = None,
        dense_ply_path: Optional[str] = None
    ):
        self.recon_manifest_path = os.path.abspath(reconstruction_manifest_path)
        self.frame_manifest_path = os.path.abspath(frame_manifest_path)
        self.output_dir = os.path.abspath(output_dir)
        self.sparse_ply_path = os.path.abspath(sparse_ply_path) if sparse_ply_path else None
        self.dense_ply_path = os.path.abspath(dense_ply_path) if dense_ply_path else None
        self.warnings: List[str] = []

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        # 1. Load COLMAP Reconstruction Manifest
        print(f"[Stage 7] Loading visual trajectory from {self.recon_manifest_path}...")
        with open(self.recon_manifest_path, "r", encoding="utf-8") as f:
            recon_data = json.load(f)

        trajectory_poses = recon_data.get("metrics", {}).get("trajectory", [])
        if not trajectory_poses:
            raise ValueError("No camera trajectory found in reconstruction manifest")

        # 2. Load GPS Data from Frame Manifest
        print(f"[Stage 7] Loading GPS telemetry from {self.frame_manifest_path}...")
        with open(self.frame_manifest_path, "r", encoding="utf-8") as f:
            frame_data = json.load(f)

        frame_gps_map = {f["file_name"]: f.get("gps") for f in frame_data.get("frames", []) if "gps" in f}

        # 3. Associate Visual Centers with GPS
        visual_coords: List[List[float]] = []
        gps_lat_lon_alt: List[List[float]] = []
        matched_image_names: List[str] = []

        for pose in trajectory_poses:
            img_name = pose.get("image_name")
            if img_name in frame_gps_map and frame_gps_map[img_name] is not None:
                g = frame_gps_map[img_name]
                visual_coords.append([pose["center_x"], pose["center_y"], pose["center_z"]])
                gps_lat_lon_alt.append([g["latitude"], g["longitude"], g["altitude_m"]])
                matched_image_names.append(img_name)

        if len(visual_coords) < 3:
            raise ValueError(f"Insufficient matched frames between visual poses and GPS ({len(visual_coords)} matched)")

        X_visual = np.array(visual_coords, dtype=np.float64)
        gps_arr = np.array(gps_lat_lon_alt, dtype=np.float64)
        print(f"[Stage 7] Successfully matched {len(matched_image_names)} frames with visual poses and GPS.")

        # 4. Geodetic WGS84 -> Local Cartesian ENU (meters)
        lat0, lon0, alt0 = gps_arr[0]
        ecef_all = geodetic_to_ecef(gps_arr[:, 0], gps_arr[:, 1], gps_arr[:, 2])
        ecef_ref = geodetic_to_ecef(np.array([lat0]), np.array([lon0]), np.array([alt0]))[0]
        Y_gps_enu = ecef_to_enu(ecef_all, lat0, lon0, ecef_ref)

        print(f"[Stage 7] Local ENU origin anchored at: Lat={lat0:.7f}°, Lon={lon0:.7f}°, Alt={alt0:.2f}m")
        gps_span_e = float(np.ptp(Y_gps_enu[:, 0]))
        gps_span_n = float(np.ptp(Y_gps_enu[:, 1]))
        gps_span_u = float(np.ptp(Y_gps_enu[:, 2]))
        print(f"[Stage 7] GPS ENU Trajectory Span: East={gps_span_e:.2f}m, North={gps_span_n:.2f}m, Up={gps_span_u:.2f}m")

        # 5. Solve Umeyama 7-DoF Sim(3) Alignment
        scale_s, R_sim, t_sim = solve_umeyama_sim3(X_visual, Y_gps_enu)
        print(f"[Stage 7] Solved Sim(3) Metric Scale: {scale_s:.6f} meters / visual unit")
        print(f"[Stage 7] Solved Rotation Det: {np.linalg.det(R_sim):.6f}")
        print(f"[Stage 7] Solved Translation: [{t_sim[0]:.4f}, {t_sim[1]:.4f}, {t_sim[2]:.4f}] m")

        # 6. Compute Alignment Residuals
        aligned_visual = scale_s * (R_sim @ X_visual.T).T + t_sim
        residuals_m = np.linalg.norm(aligned_visual - Y_gps_enu, axis=1)
        rmse_m = float(np.sqrt(np.mean(residuals_m**2)))
        mean_res_m = float(np.mean(residuals_m))
        max_res_m = float(np.max(residuals_m))
        print(f"[Stage 7] Trajectory Alignment RMSE: {rmse_m:.4f} m (Mean: {mean_res_m:.4f} m, Max: {max_res_m:.4f} m)")

        # 7. Transform Point Clouds to Metric Coordinates
        aligned_pointclouds: Dict[str, Any] = {}

        def transform_ply(input_ply: str, output_name: str) -> Optional[Dict[str, Any]]:
            if not input_ply or not os.path.exists(input_ply):
                return None
            print(f"[Stage 7] Scaling point cloud: {os.path.basename(input_ply)}...")
            pcd = o3d.io.read_point_cloud(input_ply)
            pts = np.asarray(pcd.points)
            if len(pts) == 0:
                self.warnings.append(f"Point cloud {input_ply} has 0 points.")
                return None

            pts_metric = scale_s * (R_sim @ pts.T).T + t_sim
            pcd.points = o3d.utility.Vector3dVector(pts_metric)

            out_path = os.path.join(self.output_dir, output_name)
            o3d.io.write_point_cloud(out_path, pcd, write_ascii=False)

            bbox_min = pts_metric.min(axis=0).tolist()
            bbox_max = pts_metric.max(axis=0).tolist()
            bbox_span = (pts_metric.max(axis=0) - pts_metric.min(axis=0)).tolist()

            return {
                "file_path": out_path,
                "point_count": len(pts),
                "metric_bounding_box_min_enu_m": [round(v, 3) for v in bbox_min],
                "metric_bounding_box_max_enu_m": [round(v, 3) for v in bbox_max],
                "metric_dimensions_m": [round(v, 3) for v in bbox_span]
            }

        if self.sparse_ply_path:
            sparse_meta = transform_ply(self.sparse_ply_path, "scaled_sparse_points.ply")
            if sparse_meta:
                aligned_pointclouds["scaled_sparse_points"] = sparse_meta

        if self.dense_ply_path:
            dense_meta = transform_ply(self.dense_ply_path, "scaled_ai_dense_points.ply")
            if dense_meta:
                aligned_pointclouds["scaled_ai_dense_points"] = dense_meta

        # 8. Render Trajectory Alignment Diagnostic Visualizer Plot
        plot_path = os.path.join(self.output_dir, "trajectory_alignment.png")
        fig, axes = plt.subplots(1, 2, figsize=(14, 6), dpi=120)

        # Plot 1: Overhead 2D Top-Down View (East vs North)
        ax1 = axes[0]
        ax1.plot(Y_gps_enu[:, 0], Y_gps_enu[:, 1], "c-o", markersize=4, label="GPS Telemetry (ENU)", alpha=0.8)
        ax1.plot(aligned_visual[:, 0], aligned_visual[:, 1], "r-s", markersize=3, label="Aligned Visual Trajectory", alpha=0.8)
        for i in range(len(aligned_visual)):
            ax1.plot([Y_gps_enu[i, 0], aligned_visual[i, 0]],
                     [Y_gps_enu[i, 1], aligned_visual[i, 1]], "gray", linestyle="--", linewidth=0.7, alpha=0.6)
        ax1.set_xlabel("East (meters)")
        ax1.set_ylabel("North (meters)")
        ax1.set_title(f"Overhead Trajectory Alignment (RMSE = {rmse_m:.2f}m)")
        ax1.grid(True, linestyle=":", alpha=0.6)
        ax1.legend()
        ax1.axis("equal")

        # Plot 2: Per-Frame Alignment Residuals
        ax2 = axes[1]
        frame_idx = np.arange(len(residuals_m))
        ax2.bar(frame_idx, residuals_m, color="steelblue", alpha=0.8, edgecolor="none")
        ax2.axhline(rmse_m, color="crimson", linestyle="--", linewidth=1.5, label=f"RMSE: {rmse_m:.2f}m")
        ax2.axhline(mean_res_m, color="goldenrod", linestyle=":", linewidth=1.5, label=f"Mean Error: {mean_res_m:.2f}m")
        ax2.set_xlabel("Reconstructed Keyframe Index")
        ax2.set_ylabel("Position Residual (meters)")
        ax2.set_title("Per-Frame Alignment Residuals (m)")
        ax2.grid(True, linestyle=":", alpha=0.6)
        ax2.legend()

        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close(fig)
        print(f"[Stage 7] Saved trajectory diagnostic plot to {plot_path}")

        # 9. Compile Manifest
        per_frame_residuals = []
        for i, name in enumerate(matched_image_names):
            per_frame_residuals.append({
                "image_name": name,
                "residual_meters": round(float(residuals_m[i]), 4),
                "gps_enu_m": [round(float(v), 3) for v in Y_gps_enu[i]],
                "aligned_visual_enu_m": [round(float(v), 3) for v in aligned_visual[i]]
            })

        manifest = {
            "scale_mode": "METRIC_GEOREFERENCED_SCALE",
            "is_metric": True,
            "scale_factor_meters_per_unit": round(scale_s, 6),
            "sim3_rotation_matrix": [[round(float(v), 6) for v in row] for row in R_sim],
            "sim3_translation_vector_m": [round(float(v), 4) for v in t_sim],
            "trajectory_alignment_rmse_m": round(rmse_m, 4),
            "mean_residual_m": round(mean_res_m, 4),
            "max_residual_m": round(max_res_m, 4),
            "reference_origin_wgs84": {
                "latitude": lat0,
                "longitude": lon0,
                "altitude_m": alt0
            },
            "aligned_pointclouds": aligned_pointclouds,
            "output_files": {
                "diagnostic_plot": plot_path,
                "scaled_sparse_points": aligned_pointclouds.get("scaled_sparse_points", {}).get("file_path"),
                "scaled_ai_dense_points": aligned_pointclouds.get("scaled_ai_dense_points", {}).get("file_path")
            },
            "frames": per_frame_residuals
        }

        manifest_path = os.path.join(self.output_dir, "fusion_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        elapsed = time.time() - start_time

        stage_result = StageResult(
            stage_number=7,
            stage_name="Sensor Fusion & Trajectory Alignment",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "scale_mode": "METRIC_GEOREFERENCED_SCALE",
                "is_metric": True,
                "scale_factor_m_per_unit": round(scale_s, 6),
                "trajectory_alignment_rmse_m": round(rmse_m, 4),
                "mean_residual_m": round(mean_res_m, 4),
                "max_residual_m": round(max_res_m, 4),
                "matched_frames": len(matched_image_names),
                "scaled_sparse_points_count": aligned_pointclouds.get("scaled_sparse_points", {}).get("point_count", 0),
                "scaled_ai_dense_points_count": aligned_pointclouds.get("scaled_ai_dense_points", {}).get("point_count", 0)
            },
            warnings=self.warnings,
            output_files={
                "fusion_manifest": manifest_path,
                "trajectory_alignment_plot": plot_path,
                "scaled_sparse_ply": aligned_pointclouds.get("scaled_sparse_points", {}).get("file_path"),
                "scaled_ai_dense_ply": aligned_pointclouds.get("scaled_ai_dense_points", {}).get("file_path")
            }
        )

        return manifest, stage_result


def run_stage(
    reconstruction_manifest_path: str,
    frame_manifest_path: str,
    output_dir: str,
    sparse_ply_path: Optional[str] = None,
    dense_ply_path: Optional[str] = None,
    **kwargs
) -> StageResult:
    engine = SensorFusionEngine(
        reconstruction_manifest_path=reconstruction_manifest_path,
        frame_manifest_path=frame_manifest_path,
        output_dir=output_dir,
        sparse_ply_path=sparse_ply_path,
        dense_ply_path=dense_ply_path
    )
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 7: Sensor Fusion & Trajectory Alignment (SIH26158)")
    parser.add_argument("--reconstruction-manifest", "-r", required=True, help="Stage 4 reconstruction_manifest.json")
    parser.add_argument("--frame-manifest", "-f", required=True, help="Stage 2 frame_manifest.json with GPS tags")
    parser.add_argument("--sparse-ply", "-s", default=None, help="Stage 4 sparse_points.ply to scale")
    parser.add_argument("--dense-ply", "-d", default=None, help="Stage 5 ai_dense_points.ply to scale")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage7_fusion", help="Output directory")
    args = parser.parse_args()

    engine = SensorFusionEngine(
        reconstruction_manifest_path=args.reconstruction_manifest,
        frame_manifest_path=args.frame_manifest,
        output_dir=args.output_dir,
        sparse_ply_path=args.sparse_ply,
        dense_ply_path=args.dense_ply
    )

    manifest, result = engine.run()
    print(f"\n[AstraMesh3D Stage 7 Complete]")
    print(f"Scale Factor: {result.metrics['scale_factor_m_per_unit']} meters/unit")
    print(f"Trajectory RMSE: {result.metrics['trajectory_alignment_rmse_m']} m")
    print(f"Mean Residual: {result.metrics['mean_residual_m']} m")
    print(f"Scaled Sparse Points: {result.metrics['scaled_sparse_points_count']}")
    print(f"Scaled AI Dense Points: {result.metrics['scaled_ai_dense_points_count']}")
    print(f"Manifest written to: {result.output_files['fusion_manifest']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
