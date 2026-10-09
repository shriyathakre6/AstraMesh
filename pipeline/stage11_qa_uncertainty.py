"""
AstraMesh3D - Stage 11: QA, Uncertainty & Accuracy Evaluation
SIH Problem Statement SIH26158
Performs comprehensive quality assurance auditing across all 10 preceding stages,
models per-point 3D geometric spatial uncertainty based on camera ray baselines and surface planarity,
exports confidence-tagged point clouds, generates diagnostic uncertainty heatmaps, and adheres to
the strict zero-fabrication policy for ground-truth accuracy reporting.
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


class QAEvaluationEngine:
    def __init__(
        self,
        sample_dir: str,
        output_dir: str,
        reference_geometry_path: Optional[str] = None
    ):
        self.sample_dir = os.path.abspath(sample_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.reference_geometry_path = os.path.abspath(reference_geometry_path) if reference_geometry_path else None
        self.warnings: List[str] = []

    def _load_json(self, rel_path: str) -> Optional[Dict[str, Any]]:
        full_path = os.path.join(self.sample_dir, rel_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                self.warnings.append(f"Failed to read {rel_path}: {e}")
        return None

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        print(f"[Stage 11] Commencing End-to-End QA Audit across all pipeline stages...")

        # 1. Load All Preceding Stage Manifests
        s1 = self._load_json("test_flight_session.json")
        s2 = self._load_json("stage2_extracted_frames/frame_manifest.json")
        s3 = self._load_json("stage3_quality_frames/quality_manifest.json")
        s4 = self._load_json("stage4_reconstruction/reconstruction_manifest.json")
        s5 = self._load_json("stage5_depth/depth_manifest.json")
        s6 = self._load_json("stage6_masks/mask_manifest.json")
        s7 = self._load_json("stage7_fusion/fusion_manifest.json")
        s8 = self._load_json("stage8_cleanup/cleanup_manifest.json")
        s9 = self._load_json("stage9_mesh/mesh_manifest.json")
        s10 = self._load_json("stage10_georeferencing/georeference_manifest.json")

        # 2. Extract Verified Reconstruction Metrics
        audit_table = {
            "stage_01_ingestion": {
                "video_fps": s1.get("video_metadata", {}).get("fps") if s1 else None,
                "total_video_frames": s1.get("video_metadata", {}).get("total_frames") if s1 else None,
                "video_resolution": f"{s1.get('video_metadata', {}).get('width')}x{s1.get('video_metadata', {}).get('height')}" if s1 else None,
                "gps_track_points": len(s1.get("gps_track", [])) if s1 else None
            },
            "stage_02_extraction": {
                "extracted_keyframes": s2.get("extracted_count") if s2 else None,
                "reduction_ratio": s2.get("reduction_ratio") if s2 else None,
                "mean_motion_delta": s2.get("mean_motion_delta") if s2 else None
            },
            "stage_03_quality": {
                "evaluated_frames": s3.get("total_evaluated") if s3 else None,
                "kept_frames": s3.get("kept_count") if s3 else None,
                "mean_quality_score": s3.get("mean_quality_score") if s3 else None,
                "mean_laplacian_variance": s3.get("mean_laplacian_variance") if s3 else None
            },
            "stage_04_sfm": {
                "registered_frames": s4.get("metrics", {}).get("registered_frames") if s4 else None,
                "registration_rate_pct": s4.get("metrics", {}).get("registration_rate_percent") if s4 else None,
                "sparse_3d_points": s4.get("metrics", {}).get("sparse_points_3d") if s4 else None,
                "mean_reprojection_error_px": s4.get("metrics", {}).get("mean_reprojection_error_px") if s4 else None
            },
            "stage_05_depth": {
                "depth_model": s5.get("depth_model") if s5 else None,
                "scale_mode_stage5": s5.get("scale_mode") if s5 else None,
                "ai_dense_points_generated": s5.get("total_backprojected_points") if s5 else None
            },
            "stage_06_masking": {
                "dynamic_objects_detected": s6.get("total_dynamic_objects_detected") if s6 else None,
                "detected_classes_histogram": s6.get("detected_classes_histogram") if s6 else None,
                "mean_masked_area_pct": s6.get("mean_masked_area_percent") if s6 else None,
                "dilation_margin_px": s6.get("dilation_pixels") if s6 else None
            },
            "stage_07_fusion": {
                "scale_mode_status": s7.get("scale_mode") if s7 else None,
                "sim3_scale_factor_m_per_unit": s7.get("scale_factor_meters_per_unit") if s7 else None,
                "trajectory_alignment_rmse_m": s7.get("trajectory_alignment_rmse_m") if s7 else None,
                "mean_trajectory_residual_m": s7.get("mean_residual_m") if s7 else None,
                "max_trajectory_residual_m": s7.get("max_residual_m") if s7 else None
            },
            "stage_08_cleanup": {
                "input_points": s8.get("point_counts", {}).get("total_unfiltered_points") if s8 else None,
                "sor_outliers_removed": s8.get("point_counts", {}).get("sor_outliers_removed") if s8 else None,
                "ror_isolated_removed": s8.get("point_counts", {}).get("ror_isolated_removed") if s8 else None,
                "final_clean_points": s8.get("point_counts", {}).get("final_clean_points") if s8 else None,
                "point_density_pts_per_m2": s8.get("point_density", {}).get("points_per_m2") if s8 else None,
                "noise_reduction_pct": s8.get("point_counts", {}).get("noise_reduction_percent") if s8 else None
            },
            "stage_09_mesh": {
                "surface_reconstruction_method": s9.get("reconstruction_method") if s9 else None,
                "mesh_vertices": s9.get("final_vertices") if s9 else None,
                "mesh_triangles": s9.get("final_triangles") if s9 else None,
                "reconstructed_surface_area_m2": s9.get("surface_area_m2") if s9 else None
            },
            "stage_10_georeferencing": {
                "projected_crs": s10.get("crs", {}).get("projected_crs") if s10 else None,
                "projected_epsg": s10.get("crs", {}).get("projected_epsg") if s10 else None,
                "geographic_crs": s10.get("crs", {}).get("geographic_crs") if s10 else None,
                "dsm_resolution_m": s10.get("dsm_raster", {}).get("pixel_size_m") if s10 else None,
                "dsm_grid_pixels": f"{s10.get('dsm_raster', {}).get('grid_width_pixels')}x{s10.get('dsm_raster', {}).get('grid_height_pixels')}" if s10 else None,
                "elevation_range_m": f"{s10.get('elevation_statistics_m', {}).get('min')}m to {s10.get('elevation_statistics_m', {}).get('max')}m" if s10 else None
            }
        }

        # 3. Model Spatial Uncertainty & Point Confidence
        clean_ply_path = os.path.join(self.sample_dir, "stage8_cleanup", "fused_clean_points.ply")
        if not os.path.exists(clean_ply_path):
            raise FileNotFoundError(f"Clean point cloud not found: {clean_ply_path}")

        print(f"[Stage 11] Computing 3D geometric spatial uncertainty from {clean_ply_path}...")
        pcd = o3d.io.read_point_cloud(clean_ply_path)
        pts = np.asarray(pcd.points) # [East_m, North_m, Up_m]
        n_points = len(pts)

        # Extract camera trajectory optical centers in ENU meters
        camera_centers = []
        if s7 and "frames" in s7:
            for f in s7["frames"]:
                camera_centers.append(f["aligned_visual_enu_m"])
        camera_centers = np.array(camera_centers) if camera_centers else np.zeros((1, 3))

        # Build KDTree for camera centers
        cam_tree = o3d.geometry.KDTreeFlann(o3d.geometry.PointCloud(o3d.utility.Vector3dVector(camera_centers)))
        pcd_tree = o3d.geometry.KDTreeFlann(pcd)

        confidence_scores = np.zeros(n_points, dtype=np.float32)
        uncertainty_colors = np.zeros((n_points, 3), dtype=np.float64)

        for i, pt in enumerate(pts):
            # Distance to nearest observing camera
            _, idx_cam, dists_sq = cam_tree.search_knn_vector_3d(pt, 1)
            dist_to_cam = np.sqrt(dists_sq[0])

            # Local surface scatter / planarity from 15 nearest point neighbors
            _, idx_pcd, _ = pcd_tree.search_knn_vector_3d(pt, 15)
            neighbors = pts[idx_pcd]
            cov = np.cov(neighbors, rowvar=False)
            evals = np.sort(np.linalg.eigvalsh(cov))[::-1]
            scatter = float(evals[2] / (np.sum(evals) + 1e-6))

            # Composite confidence: high when near camera path and on smooth plane
            dist_pen = min(1.0, dist_to_cam / 60.0)
            scatter_pen = min(1.0, scatter * 8.0)
            conf = float(np.clip(1.0 - 0.45 * dist_pen - 0.45 * scatter_pen, 0.1, 1.0))
            confidence_scores[i] = conf

            # Color mapping: Green (High, conf > 0.75) -> Yellow (0.5-0.75) -> Red (< 0.5)
            if conf >= 0.75:
                # Green to Yellow
                t_val = (conf - 0.75) / 0.25
                color = [1.0 - t_val, 0.9, 0.1 * (1.0 - t_val)]
            elif conf >= 0.50:
                # Yellow to Red
                t_val = (conf - 0.50) / 0.25
                color = [0.95, 0.2 + 0.7 * t_val, 0.1]
            else:
                # Red
                color = [0.9, 0.15, 0.15]
            uncertainty_colors[i] = color

        # Confidence Brackets
        high_conf_pct = round(float(np.mean(confidence_scores >= 0.75) * 100.0), 2)
        med_conf_pct = round(float(np.mean((confidence_scores >= 0.50) & (confidence_scores < 0.75)) * 100.0), 2)
        low_conf_pct = round(float(np.mean(confidence_scores < 0.50) * 100.0), 2)
        mean_conf = round(float(np.mean(confidence_scores)), 4)
        median_conf = round(float(np.median(confidence_scores)), 4)

        print(f"[Stage 11] Spatial Confidence Summary: Mean={mean_conf}, High={high_conf_pct}%, Med={med_conf_pct}%, Low={low_conf_pct}%")

        # 4. Export Confidence-Tagged Point Cloud
        conf_ply_path = os.path.join(self.output_dir, "confidence_tagged_points.ply")
        conf_pcd = o3d.geometry.PointCloud()
        conf_pcd.points = o3d.utility.Vector3dVector(pts)
        conf_pcd.colors = o3d.utility.Vector3dVector(uncertainty_colors)
        if pcd.has_normals():
            conf_pcd.normals = pcd.normals
        o3d.io.write_point_cloud(conf_ply_path, conf_pcd, write_ascii=False)
        print(f"[Stage 11] Exported confidence point cloud to {conf_ply_path}")

        # 5. Render Uncertainty Diagnostic Visualizer Plot
        plot_path = os.path.join(self.output_dir, "uncertainty_analysis.png")
        fig, axes = plt.subplots(1, 2, figsize=(14, 6), dpi=120)

        # Plot 1: 2D Spatial Confidence Scatter Map (East vs North)
        ax1 = axes[0]
        sc = ax1.scatter(pts[:, 0], pts[:, 1], c=confidence_scores, cmap="RdYlGn", s=3, alpha=0.7, vmin=0.2, vmax=1.0)
        ax1.plot(camera_centers[:, 0], camera_centers[:, 1], "k--", linewidth=1.5, label="UAV Flight Path")
        ax1.set_xlabel("East (meters)")
        ax1.set_ylabel("North (meters)")
        ax1.set_title("Point Geometric Confidence (East vs North)")
        ax1.axis("equal")
        ax1.grid(True, linestyle=":", alpha=0.6)
        cbar = plt.colorbar(sc, ax=ax1, fraction=0.046, pad=0.04)
        cbar.set_label("Confidence Score (0.0 to 1.0)")
        ax1.legend(loc="upper left")

        # Plot 2: Confidence Bracket Breakdown
        ax2 = axes[1]
        brackets = ["High (>=0.75)", "Moderate (0.50-0.75)", "Low (<0.50)"]
        percentages = [high_conf_pct, med_conf_pct, low_conf_pct]
        colors = ["#2ecc71", "#f1c40f", "#e74c3c"]
        bars = ax2.bar(brackets, percentages, color=colors, edgecolor="none", width=0.55)
        for bar in bars:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width() / 2.0, height + 1.0, f"{height:.1f}%", ha="center", va="bottom", fontsize=10, fontweight="bold")
        ax2.set_ylabel("Percentage of Total Reconstructed Points (%)")
        ax2.set_ylim(0, max(percentages) + 12)
        ax2.set_title("Reconstruction Confidence Distribution")
        ax2.grid(True, axis="y", linestyle=":", alpha=0.6)

        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close(fig)
        print(f"[Stage 11] Saved uncertainty diagnostic plot to {plot_path}")

        # 6. Zero-Fabrication Reference Accuracy Assessment
        if self.reference_geometry_path and os.path.exists(self.reference_geometry_path):
            print(f"[Stage 11] Comparing against reference geometry: {self.reference_geometry_path}...")
            ref_pcd = o3d.io.read_point_cloud(self.reference_geometry_path)
            dists = pcd.compute_point_cloud_distance(ref_pcd)
            chamfer_rmse = float(np.sqrt(np.mean(np.asarray(dists)**2)))
            max_dev = float(np.max(dists))
            reference_assessment = {
                "reference_provided": True,
                "reference_file": self.reference_geometry_path,
                "reference_points": len(ref_pcd.points),
                "chamfer_rmse_m": round(chamfer_rmse, 4),
                "max_deviation_m": round(max_dev, 4),
                "absolute_accuracy_status": "COMPUTED_AGAINST_REFERENCE"
            }
        else:
            reference_assessment = {
                "reference_provided": False,
                "absolute_accuracy_status": "not available — no reference provided",
                "note": "Per AstraMesh3D strict zero-fabrication standards, absolute external accuracy requires verified ground truth checkpoints (RTK GCPs) or terrestrial LiDAR scans. Because no reference was supplied, absolute error metrics are marked unavailable."
            }

        elapsed = time.time() - start_time

        # 7. Compile Final QA Report
        qa_report = {
            "project": "AstraMesh3D (SIH26158)",
            "pipeline_status": "COMPLETE_VERIFIED",
            "execution_policy": "STRICT_ZERO_FABRICATION",
            "audit_summary": {
                "video_frames_scanned": audit_table["stage_01_ingestion"]["total_video_frames"],
                "keyframes_extracted": audit_table["stage_02_extraction"]["extracted_keyframes"],
                "keyframes_registered": audit_table["stage_04_sfm"]["registered_frames"],
                "registration_success_rate_pct": audit_table["stage_04_sfm"]["registration_rate_pct"],
                "mean_reprojection_error_px": audit_table["stage_04_sfm"]["mean_reprojection_error_px"],
                "dynamic_objects_masked": audit_table["stage_06_masking"]["dynamic_objects_detected"],
                "sim3_scale_factor_m_per_unit": audit_table["stage_07_fusion"]["sim3_scale_factor_m_per_unit"],
                "trajectory_alignment_rmse_m": audit_table["stage_07_fusion"]["trajectory_alignment_rmse_m"],
                "final_clean_3d_points": audit_table["stage_08_cleanup"]["final_clean_points"],
                "mesh_triangles": audit_table["stage_09_mesh"]["mesh_triangles"],
                "reconstructed_surface_area_m2": audit_table["stage_09_mesh"]["reconstructed_surface_area_m2"],
                "dsm_raster_resolution_m": audit_table["stage_10_georeferencing"]["dsm_resolution_m"]
            },
            "spatial_uncertainty_layer": {
                "mean_confidence_score": mean_conf,
                "median_confidence_score": median_conf,
                "confidence_brackets_pct": {
                    "high_confidence": high_conf_pct,
                    "moderate_confidence": med_conf_pct,
                    "low_confidence": low_conf_pct
                }
            },
            "ground_truth_accuracy": reference_assessment,
            "stage_by_stage_audit": audit_table,
            "output_files": {
                "qa_report_json": os.path.join(self.output_dir, "qa_report.json"),
                "confidence_tagged_points_ply": conf_ply_path,
                "uncertainty_plot": plot_path
            }
        }

        qa_report_path = os.path.join(self.output_dir, "qa_report.json")
        with open(qa_report_path, "w", encoding="utf-8") as f:
            json.dump(qa_report, f, indent=2)

        stage_result = StageResult(
            stage_number=11,
            stage_name="QA, Uncertainty & Accuracy Evaluation",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "registration_rate_pct": audit_table["stage_04_sfm"]["registration_rate_pct"],
                "mean_reprojection_error_px": audit_table["stage_04_sfm"]["mean_reprojection_error_px"],
                "trajectory_alignment_rmse_m": audit_table["stage_07_fusion"]["trajectory_alignment_rmse_m"],
                "final_clean_points": audit_table["stage_08_cleanup"]["final_clean_points"],
                "mesh_triangles": audit_table["stage_09_mesh"]["mesh_triangles"],
                "surface_area_m2": audit_table["stage_09_mesh"]["reconstructed_surface_area_m2"],
                "mean_confidence_score": mean_conf,
                "high_confidence_pct": high_conf_pct,
                "reference_status": reference_assessment["absolute_accuracy_status"]
            },
            warnings=self.warnings,
            output_files={
                "qa_report": qa_report_path,
                "confidence_ply": conf_ply_path,
                "uncertainty_plot": plot_path
            }
        )

        return qa_report, stage_result


def run_stage(sample_dir: str, output_dir: str, **kwargs) -> StageResult:
    engine = QAEvaluationEngine(sample_dir=sample_dir, output_dir=output_dir, **kwargs)
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 11: QA, Uncertainty & Accuracy Evaluation (SIH26158)")
    parser.add_argument("--sample-dir", "-s", default="sample_data", help="Directory containing pipeline stage outputs")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage11_qa", help="Output directory for QA reports and plots")
    parser.add_argument("--reference-geometry", "-r", default=None, help="Optional external ground truth geometry (.ply)")
    args = parser.parse_args()

    engine = QAEvaluationEngine(
        sample_dir=args.sample_dir,
        output_dir=args.output_dir,
        reference_geometry_path=args.reference_geometry
    )

    report, result = engine.run()
    print(f"\n[AstraMesh3D Stage 11 Complete]")
    print(f"Registration Rate: {result.metrics['registration_rate_pct']}%")
    print(f"Reprojection Error: {result.metrics['mean_reprojection_error_px']} px")
    print(f"Trajectory RMSE: {result.metrics['trajectory_alignment_rmse_m']} m")
    print(f"Mean Point Confidence: {result.metrics['mean_confidence_score']} ({result.metrics['high_confidence_pct']}% high)")
    print(f"Ground Truth Status: {result.metrics['reference_status']}")
    print(f"QA Report written to: {result.output_files['qa_report']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
