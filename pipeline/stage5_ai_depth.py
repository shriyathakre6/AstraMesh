"""
AstraMesh3D - Stage 5: AI Monocular Depth Estimation
SIH Problem Statement SIH26158
Infers dense relative depth maps using Depth Anything V2 Small via ONNX Runtime on CPU,
back-projects depth pixels into 3D scene coordinates using COLMAP camera poses and intrinsics,
and exports colorized depth visualizers and an Open3D point cloud tagged as RELATIVE_SCALE_AMBIGUOUS.
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

import cv2
import numpy as np
import open3d as o3d
import onnxruntime as ort


def qvec2rotmat(qvec: List[float]) -> np.ndarray:
    """Converts quaternion [qw, qx, qy, qz] to a 3x3 rotation matrix."""
    w, x, y, z = qvec
    return np.array([
        [1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w],
        [2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w],
        [2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y]
    ], dtype=np.float64)


class DepthEstimator:
    def __init__(
        self,
        model_path: str,
        frames_dir: str,
        reconstruction_manifest_path: str,
        output_dir: str,
        sample_stride: int = 16,
        max_frames: Optional[int] = 15
    ):
        self.model_path = os.path.abspath(model_path)
        self.frames_dir = os.path.abspath(frames_dir)
        self.recon_manifest_path = os.path.abspath(reconstruction_manifest_path)
        self.output_dir = os.path.abspath(output_dir)
        self.sample_stride = max(4, sample_stride)
        self.max_frames = max_frames
        self.warnings: List[str] = []

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)
        viz_dir = os.path.join(self.output_dir, "depth_visualizations")
        os.makedirs(viz_dir, exist_ok=True)

        # 1. Load Camera Intrinsics and Poses from Stage 4
        if not os.path.isfile(self.recon_manifest_path):
            raise FileNotFoundError(f"Reconstruction manifest not found: {self.recon_manifest_path}")

        with open(self.recon_manifest_path, "r", encoding="utf-8") as f:
            recon_data = json.load(f)

        m = recon_data.get("metrics", {})
        traj = m.get("trajectory", [])
        intrinsics = m.get("self_calibrated_intrinsics", {})
        params = intrinsics.get("estimated_parameters", [])

        if len(params) >= 4:
            fx, fy, cx, cy = params[0], params[1], params[2], params[3]
        else:
            fx, fy, cx, cy = 2000.0, 2000.0, 540.0, 960.0
            self.warnings.append("Camera intrinsics missing from manifest; using standard nominal values.")

        # Map image names to camera poses
        pose_map = {item["image_name"]: item for item in traj}

        # 2. Select frames to process
        all_frames = sorted([
            f for f in os.listdir(self.frames_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png")) and f in pose_map
        ])

        if not all_frames:
            raise ValueError("No matching registered frames found between image directory and reconstruction manifest.")

        if self.max_frames and len(all_frames) > self.max_frames:
            # Uniformly sub-sample frames across the flight trajectory for efficiency
            step = len(all_frames) / float(self.max_frames)
            chosen_frames = [all_frames[int(i * step)] for i in range(self.max_frames)]
        else:
            chosen_frames = all_frames

        # 3. Initialize ONNX Runtime Session on CPU
        print(f"[STAGE 5] Loading Depth Anything V2 ONNX session on CPU...")
        session = ort.InferenceSession(self.model_path, providers=["CPUExecutionProvider"])
        input_name = session.get_inputs()[0].name
        target_h, target_w = 518, 518

        all_points_3d: List[np.ndarray] = []
        all_colors: List[np.ndarray] = []
        per_frame_stats: List[Dict[str, Any]] = []

        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

        print(f"[STAGE 5] Running dense monocular depth inference on {len(chosen_frames)} keyframes...")
        for idx, fname in enumerate(chosen_frames):
            fpath = os.path.join(self.frames_dir, fname)
            img_bgr = cv2.imread(fpath)
            if img_bgr is None:
                continue

            orig_h, orig_w = img_bgr.shape[:2]

            # Preprocess
            resized = cv2.resize(img_bgr, (target_w, target_h), interpolation=cv2.INTER_AREA)
            rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            norm = (rgb - mean) / std
            tensor = np.transpose(norm, (2, 0, 1))[np.newaxis, ...]

            # Inference
            raw_depth = session.run(None, {input_name: tensor})[0].squeeze()
            depth_map = cv2.resize(raw_depth, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)

            d_min, d_max = float(np.min(depth_map)), float(np.max(depth_map))
            d_mean = float(np.mean(depth_map))

            # Generate Colorized Depth Visualization
            norm_depth_viz = cv2.normalize(depth_map, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            color_depth = cv2.applyColorMap(norm_depth_viz, cv2.COLORMAP_INFERNO)
            viz_filename = f"depth_viz_{Path(fname).stem}.jpg"
            cv2.imwrite(os.path.join(viz_dir, viz_filename), color_depth)

            # 4. Back-Project into 3D Camera and World Coordinates
            pose = pose_map[fname]
            qvec = [pose["qw"], pose["qx"], pose["qy"], pose["qz"]]
            tvec = np.array([pose["tx"], pose["ty"], pose["tz"]], dtype=np.float64)
            R_world_to_cam = qvec2rotmat(qvec)
            R_cam_to_world = R_world_to_cam.T

            # Grid sampling across pixels
            u_coords = np.arange(0, orig_w, self.sample_stride)
            v_coords = np.arange(0, orig_h, self.sample_stride)
            uu, vv = np.meshgrid(u_coords, v_coords)

            depth_samples = depth_map[vv, uu]
            # Discard non-positive or extreme outlier depth values
            valid_mask = depth_samples > 0.05

            uu_valid = uu[valid_mask]
            vv_valid = vv[valid_mask]
            d_valid = depth_samples[valid_mask]

            # Invert disparity/depth to positive physical camera Z coordinate
            # Disparity from Depth Anything V2 is proportional to 1/distance
            # Transform disparity to relative depth: Z = (scale_factor / disparity)
            eps = 1e-4
            z_cam = 10.0 / (d_valid + eps)
            x_cam = (uu_valid - cx) * z_cam / fx
            y_cam = (vv_valid - cy) * z_cam / fy

            pts_cam = np.vstack([x_cam, y_cam, z_cam])  # (3, N)
            # Transform to world: P_w = R^T * (P_c - t)
            pts_world = R_cam_to_world @ (pts_cam - tvec[:, np.newaxis])  # (3, N)
            pts_world = pts_world.T  # (N, 3)

            # Extract corresponding RGB colors
            colors_bgr = img_bgr[vv_valid, uu_valid]  # (N, 3)
            colors_rgb = colors_bgr[:, ::-1] / 255.0  # Convert to [0, 1] RGB

            all_points_3d.append(pts_world)
            all_colors.append(colors_rgb)

            per_frame_stats.append({
                "frame_name": fname,
                "min_disparity": round(d_min, 4),
                "max_disparity": round(d_max, 4),
                "mean_disparity": round(d_mean, 4),
                "points_generated": int(len(pts_world)),
                "depth_viz_file": viz_filename
            })

        # 5. Build and Save Open3D Point Cloud
        if all_points_3d:
            merged_pts = np.vstack(all_points_3d)
            merged_cols = np.vstack(all_colors)
        else:
            merged_pts = np.zeros((0, 3))
            merged_cols = np.zeros((0, 3))

        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(merged_pts)
        pcd.colors = o3d.utility.Vector3dVector(merged_cols)

        # Statistical outlier removal on raw back-projected depth
        if len(pcd.points) > 100:
            pcd_clean, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
        else:
            pcd_clean = pcd

        ply_path = os.path.join(self.output_dir, "ai_dense_points.ply")
        o3d.io.write_point_cloud(ply_path, pcd_clean)

        elapsed_sec = time.time() - start_time

        manifest_path = os.path.join(self.output_dir, "depth_manifest.json")
        manifest_data = {
            "depth_model": "Depth-Anything-V2-Small (ONNX)",
            "execution_provider": "CPUExecutionProvider",
            "scale_mode": "RELATIVE_SCALE_AMBIGUOUS",
            "is_metric": False,
            "scale_ambiguity_note": "Monocular depth output is scale-ambiguous relative disparity. Physical metric scaling will be resolved during Stage 7 (Sensor Fusion) using GPS constraints.",
            "total_frames_processed": len(chosen_frames),
            "sample_stride_pixels": self.sample_stride,
            "total_backprojected_points": len(pcd_clean.points),
            "output_files": {
                "dense_points_ply": ply_path,
                "visualizations_dir": viz_dir
            },
            "frames": per_frame_stats
        }

        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)

        stage_result = StageResult(
            stage_number=5,
            stage_name="AI Monocular Depth Estimation",
            success=True,
            execution_time_sec=round(elapsed_sec, 3),
            metrics={
                "model_name": "Depth-Anything-V2-Small",
                "scale_mode": "RELATIVE_SCALE_AMBIGUOUS",
                "is_metric": False,
                "keyframes_processed": len(chosen_frames),
                "total_dense_points": len(pcd_clean.points),
                "sample_stride": self.sample_stride
            },
            warnings=self.warnings,
            output_files={
                "ai_dense_points": ply_path,
                "depth_manifest": manifest_path,
                "viz_dir": viz_dir
            }
        )

        return manifest_data, stage_result


def main():
    parser = argparse.ArgumentParser(
        description="AstraMesh3D Stage 5: AI Monocular Depth Estimation & Back-Projection (SIH26158)"
    )
    parser.add_argument("--reconstruction-manifest", "-r", required=True, help="Path to Stage 4 reconstruction_manifest.json")
    parser.add_argument("--frames-dir", "-f", required=True, help="Path to input quality frames directory")
    parser.add_argument("--model-path", default=os.path.join("models", "depth_anything_v2_small.onnx"), help="Path to ONNX model weights")
    parser.add_argument("--output-dir", "-o", default=None, help="Destination directory for depth outputs")
    parser.add_argument("--sample-stride", type=int, default=16, help="Pixel subsampling stride for 3D back-projection")
    parser.add_argument("--max-frames", type=int, default=15, help="Maximum keyframes to back-project")

    args = parser.parse_args()
    out_dir = args.output_dir or os.path.join("sample_data", "stage5_depth")

    estimator = DepthEstimator(
        model_path=args.model_path,
        frames_dir=args.frames_dir,
        reconstruction_manifest_path=args.reconstruction_manifest,
        output_dir=out_dir,
        sample_stride=args.sample_stride,
        max_frames=args.max_frames
    )

    try:
        manifest, result = estimator.run()
        m = result.metrics

        print("\n=======================================================")
        print(" ASTRAMESH3D STAGE 5: AI MONOCULAR DEPTH COMPLETE")
        print(" SIH26158 Single-Pass Drone Photogrammetry Pipeline")
        print("=======================================================")
        print(f" Model Engine         : {m['model_name']} (CPU)")
        print(f" Scale Mode           : {m['scale_mode']} (is_metric={m['is_metric']})")
        print(f" Keyframes Processed  : {m['keyframes_processed']}")
        print(f" Total Dense Points   : {m['total_dense_points']} 3D colored points")
        print(f" Sample Stride        : Every {m['sample_stride']}th pixel")
        print(f" Dense Point Cloud    : {result.output_files['ai_dense_points']}")
        print(f" Depth Visualizations : {result.output_files['viz_dir']}")
        print(f" Depth Manifest       : {result.output_files['depth_manifest']}")
        print(f" Execution Duration   : {result.execution_time_sec}s")
        print("=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Stage 5 Depth Estimation failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
