"""
AstraMesh3D - Stage 4: Visual Reconstruction (COLMAP SfM / MVS)
SIH Problem Statement SIH26158
Orchestrates COLMAP Structure-from-Motion on quality-filtered frames:
feature extraction, sequential matching, incremental bundle adjustment mapping,
camera pose extraction, and registration rate evaluation.
"""

import os
import sys
import json
import shutil
import subprocess
import time
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline.common import StageResult


def find_colmap_binary() -> str:
    """Finds COLMAP executable or launcher batch script."""
    cand = shutil.which("colmap")
    if cand:
        return cand

    home_downloads = os.path.expanduser(r"~\Downloads\colmap-x64-windows-nocuda")
    locations = [
        os.path.join(home_downloads, "COLMAP.bat"),
        os.path.join(home_downloads, "bin", "colmap.exe"),
        r"C:\Program Files\COLMAP\bin\colmap.exe",
        r"C:\tools\colmap\colmap.exe"
    ]
    for loc in locations:
        if os.path.isfile(loc):
            return loc

    return "colmap"


def qvec2rotmat(qvec: List[float]) -> List[List[float]]:
    """Converts quaternion (qw, qx, qy, qz) to a 3x3 rotation matrix."""
    w, x, y, z = qvec
    return [
        [1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w],
        [2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w],
        [2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y]
    ]


class ColmapReconstructor:
    def __init__(
        self,
        input_frames_dir: str,
        output_dir: str,
        camera_model: str = "OPENCV",
        single_camera: bool = True,
        overlap: int = 10,
        num_threads: int = 4
    ):
        self.input_frames_dir = os.path.abspath(input_frames_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.camera_model = camera_model
        self.single_camera = 1 if single_camera else 0
        self.overlap = overlap
        self.num_threads = num_threads
        self.colmap_bin = find_colmap_binary()
        self.warnings: List[str] = []

    def run_reconstruction(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        if not os.path.isdir(self.input_frames_dir):
            raise FileNotFoundError(f"Input frames directory does not exist: {self.input_frames_dir}")

        input_images = [
            f for f in os.listdir(self.input_frames_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ]
        total_input_count = len(input_images)
        if total_input_count < 2:
            raise ValueError(f"Need at least 2 frames for Structure-from-Motion, found: {total_input_count}")

        # Set up working environment
        database_path = os.path.join(self.output_dir, "colmap.db")
        if os.path.exists(database_path):
            os.remove(database_path)

        sparse_dir = os.path.join(self.output_dir, "sparse")
        if os.path.exists(sparse_dir):
            shutil.rmtree(sparse_dir)
        os.makedirs(sparse_dir, exist_ok=True)

        env = os.environ.copy()
        colmap_dir = os.path.dirname(os.path.abspath(self.colmap_bin))
        env["PATH"] = colmap_dir + os.pathsep + env.get("PATH", "")

        # 1. Feature Extraction
        print(f"[COLMAP] 1/4: Running feature extraction on {total_input_count} frames...")
        cmd_extract = [
            self.colmap_bin, "feature_extractor",
            "--database_path", database_path,
            "--image_path", self.input_frames_dir,
            "--ImageReader.camera_model", self.camera_model,
            "--ImageReader.single_camera", str(self.single_camera),
            "--FeatureExtraction.use_gpu", "0",
            "--FeatureExtraction.num_threads", str(self.num_threads)
        ]
        res_extract = subprocess.run(cmd_extract, env=env, capture_output=True, text=True)
        if res_extract.returncode != 0:
            raise RuntimeError(f"COLMAP feature_extractor failed:\n{res_extract.stderr or res_extract.stdout}")

        # 2. Sequential Matching
        print(f"[COLMAP] 2/4: Running sequential feature matching (overlap={self.overlap})...")
        cmd_match = [
            self.colmap_bin, "sequential_matcher",
            "--database_path", database_path,
            "--SequentialMatching.overlap", str(self.overlap),
            "--SequentialMatching.quadratic_overlap", "1",
            "--FeatureMatching.use_gpu", "0",
            "--FeatureMatching.num_threads", str(self.num_threads)
        ]
        res_match = subprocess.run(cmd_match, env=env, capture_output=True, text=True)
        if res_match.returncode != 0:
            raise RuntimeError(f"COLMAP sequential_matcher failed:\n{res_match.stderr or res_match.stdout}")

        # 3. Incremental Mapping
        print(f"[COLMAP] 3/4: Running incremental bundle adjustment mapper...")
        cmd_map = [
            self.colmap_bin, "mapper",
            "--database_path", database_path,
            "--image_path", self.input_frames_dir,
            "--output_path", sparse_dir,
            "--Mapper.num_threads", str(self.num_threads)
        ]
        res_map = subprocess.run(cmd_map, env=env, capture_output=True, text=True)
        if res_map.returncode != 0:
            raise RuntimeError(f"COLMAP mapper failed:\n{res_map.stderr or res_map.stdout}")

        # Model index 0 holds the primary reconstructed component
        model_0_dir = os.path.join(sparse_dir, "0")
        if not os.path.isdir(model_0_dir):
            raise RuntimeError("COLMAP mapper did not produce a primary reconstruction model ('sparse/0'). Scene may have insufficient visual overlap or texture.")

        # 4. Export to PLY and TXT for downstream analysis
        print(f"[COLMAP] 4/4: Exporting point cloud and camera trajectory...")
        ply_output_path = os.path.join(self.output_dir, "sparse_points.ply")
        cmd_conv_ply = [
            self.colmap_bin, "model_converter",
            "--input_path", model_0_dir,
            "--output_path", ply_output_path,
            "--output_type", "PLY"
        ]
        subprocess.run(cmd_conv_ply, env=env, capture_output=True, text=True)

        txt_output_dir = os.path.join(self.output_dir, "sparse_txt")
        os.makedirs(txt_output_dir, exist_ok=True)
        cmd_conv_txt = [
            self.colmap_bin, "model_converter",
            "--input_path", model_0_dir,
            "--output_path", txt_output_dir,
            "--output_type", "TXT"
        ]
        subprocess.run(cmd_conv_txt, env=env, capture_output=True, text=True)

        # 5. Parse Ground-Truth Metrics from Model Text Files
        metrics = self._parse_model_metrics(txt_output_dir, total_input_count)
        elapsed_sec = time.time() - start_time

        manifest_path = os.path.join(self.output_dir, "reconstruction_manifest.json")
        manifest_data = {
            "colmap_binary": self.colmap_bin,
            "total_input_frames": total_input_count,
            "metrics": metrics,
            "output_files": {
                "sparse_cloud_ply": ply_output_path,
                "sparse_model_dir": model_0_dir,
                "sparse_txt_dir": txt_output_dir,
                "database_path": database_path
            }
        }
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)

        stage_result = StageResult(
            stage_number=4,
            stage_name="Visual Reconstruction (SfM)",
            success=True,
            execution_time_sec=round(elapsed_sec, 3),
            metrics=metrics,
            warnings=self.warnings,
            output_files={
                "sparse_cloud": ply_output_path,
                "reconstruction_manifest": manifest_path,
                "sparse_dir": model_0_dir
            }
        )

        return manifest_data, stage_result

    def _parse_model_metrics(self, txt_dir: str, total_input_count: int) -> Dict[str, Any]:
        images_txt = os.path.join(txt_dir, "images.txt")
        cameras_txt = os.path.join(txt_dir, "cameras.txt")
        points3d_txt = os.path.join(txt_dir, "points3D.txt")

        registered_count = 0
        camera_trajectory = []
        if os.path.isfile(images_txt):
            with open(images_txt, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.strip().split()
                # Image definition lines: IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
                if len(parts) >= 10 and not parts[0].startswith("#"):
                    try:
                        image_id = int(parts[0])
                        qw, qx, qy, qz = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                        tx, ty, tz = float(parts[5]), float(parts[6]), float(parts[7])
                        camera_id = int(parts[8])
                        img_name = parts[9]

                        # Compute optical center in world coords: C = -R^T * T
                        R = qvec2rotmat([qw, qx, qy, qz])
                        cx = -(R[0][0] * tx + R[1][0] * ty + R[2][0] * tz)
                        cy = -(R[0][1] * tx + R[1][1] * ty + R[2][1] * tz)
                        cz = -(R[0][2] * tx + R[1][2] * ty + R[2][2] * tz)

                        camera_trajectory.append({
                            "image_id": image_id,
                            "image_name": img_name,
                            "qw": qw, "qx": qx, "qy": qy, "qz": qz,
                            "tx": tx, "ty": ty, "tz": tz,
                            "center_x": round(cx, 4),
                            "center_y": round(cy, 4),
                            "center_z": round(cz, 4)
                        })
                        registered_count += 1
                    except (ValueError, IndexError):
                        continue

        reg_rate = (registered_count / max(1, total_input_count)) * 100.0

        # Parse Points3D
        point_count = 0
        errors = []
        if os.path.isfile(points3d_txt):
            with open(points3d_txt, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("#") or not line.strip():
                        continue
                    parts = line.strip().split()
                    if len(parts) >= 8:
                        point_count += 1
                        try:
                            errors.append(float(parts[7]))
                        except ValueError:
                            pass

        mean_error = float(sum(errors) / len(errors)) if errors else 0.0

        # Parse Self-Calibrated Intrinsics
        intrinsics_data = {}
        if os.path.isfile(cameras_txt):
            with open(cameras_txt, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("#") or not line.strip():
                        continue
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        model = parts[1]
                        w, h = int(parts[2]), int(parts[3])
                        params = [float(p) for p in parts[4:]]
                        intrinsics_data = {
                            "camera_model": model,
                            "width": w,
                            "height": h,
                            "estimated_parameters": params
                        }
                        break

        return {
            "total_input_frames": total_input_count,
            "registered_frames": registered_count,
            "registration_rate_percent": round(reg_rate, 2),
            "sparse_points_3d": point_count,
            "mean_reprojection_error_px": round(mean_error, 4),
            "self_calibrated_intrinsics": intrinsics_data,
            "trajectory": camera_trajectory
        }


def main():
    parser = argparse.ArgumentParser(
        description="AstraMesh3D Stage 4: Visual Reconstruction with COLMAP SfM (SIH26158)"
    )
    parser.add_argument("--input", "-i", required=True, help="Directory of quality-scored frames from Stage 3")
    parser.add_argument("--output-dir", "-o", default=None, help="Destination directory for COLMAP outputs")
    parser.add_argument("--camera-model", default="OPENCV", help="Camera projection model (e.g. OPENCV, SIMPLE_RADIAL)")
    parser.add_argument("--overlap", type=int, default=10, help="Sequential matching window overlap")
    parser.add_argument("--threads", type=int, default=4, help="CPU worker threads")

    args = parser.parse_args()

    out_dir = args.output_dir or os.path.join("sample_data", "stage4_reconstruction")

    reconstructor = ColmapReconstructor(
        input_frames_dir=args.input,
        output_dir=out_dir,
        camera_model=args.camera_model,
        overlap=args.overlap,
        num_threads=args.threads
    )

    try:
        manifest, result = reconstructor.run_reconstruction()
        m = result.metrics

        print("\n=======================================================")
        print(" ASTRAMESH3D STAGE 4: VISUAL RECONSTRUCTION COMPLETE")
        print(" SIH26158 Single-Pass Drone Photogrammetry Pipeline")
        print("=======================================================")
        print(f" Input Frames Evaluated : {m['total_input_frames']}")
        print(f" Registered Frames      : {m['registered_frames']} / {m['total_input_frames']}")
        print(f" Registration Rate      : {m['registration_rate_percent']}%")
        print(f" Sparse 3D Points       : {m['sparse_points_3d']} triangulated points")
        print(f" Mean Reprojection Err  : {m['mean_reprojection_error_px']} px")
        print(f" Camera Intrinsics      : {m['self_calibrated_intrinsics'].get('camera_model')} {m['self_calibrated_intrinsics'].get('estimated_parameters')}")
        print(f" Point Cloud Output     : {result.output_files['sparse_cloud']}")
        print(f" Reconstruction Manifest: {result.output_files['reconstruction_manifest']}")
        print(f" Execution Duration     : {result.execution_time_sec}s")
        print("=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Stage 4 Visual Reconstruction failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
