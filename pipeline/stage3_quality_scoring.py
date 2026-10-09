"""
AstraMesh3D - Stage 3: Frame Quality Scoring
SIH Problem Statement SIH26158
Computes per-frame blur (variance of Laplacian), exposure balance (histogram-based),
and contrast scores. Assigns composite quality weights in [0, 1], drops severely degraded
frames, and passes quality-weighted frames forward for visual SfM.
"""

import os
import sys
import json
import math
import shutil
import time
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline.common import StageResult

import cv2
import numpy as np


class QualityScorer:
    def __init__(
        self,
        input_manifest_or_dir: str,
        output_dir: str,
        drop_threshold: float = 0.30,
        blur_weight: float = 0.50,
        exposure_weight: float = 0.35,
        contrast_weight: float = 0.15
    ):
        self.input_source = os.path.abspath(input_manifest_or_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.drop_threshold = drop_threshold
        self.w_blur = blur_weight
        self.w_exposure = exposure_weight
        self.w_contrast = contrast_weight
        self.warnings: List[str] = []

    def evaluate(self) -> Tuple[List[Dict[str, Any]], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        frames_to_score = self._load_frame_list()
        if not frames_to_score:
            raise ValueError(f"No frames found for evaluation in: {self.input_source}")

        scored_frames: List[Dict[str, Any]] = []
        blur_variances: List[float] = []
        composite_weights: List[float] = []
        kept_count = 0
        dropped_count = 0

        for item in frames_to_score:
            frame_path = item.get("file_path")
            frame_id = item.get("frame_id") or Path(frame_path).stem

            if not os.path.isfile(frame_path):
                continue

            img = cv2.imread(frame_path)
            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 1. Blur Scoring (Variance of Laplacian)
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            blur_var = float(laplacian.var())
            blur_variances.append(blur_var)
            # Sigmoid normalization (centered around 150)
            blur_score = 1.0 / (1.0 + math.exp(-0.015 * (blur_var - 150.0)))

            # 2. Exposure Scoring (Histogram over/under exposure)
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
            total_pixels = float(gray.size)
            shadow_fraction = float(np.sum(hist[:15])) / total_pixels
            highlight_fraction = float(np.sum(hist[240:])) / total_pixels
            exposure_score = max(0.0, 1.0 - (shadow_fraction * 1.5 + highlight_fraction * 1.5))

            # 3. Contrast Scoring
            contrast_std = float(np.std(gray))
            contrast_score = min(1.0, contrast_std / 64.0)

            # Composite Quality Weight
            composite = (
                self.w_blur * blur_score +
                self.w_exposure * exposure_score +
                self.w_contrast * contrast_score
            )
            composite = max(0.0, min(1.0, composite))
            composite_weights.append(composite)

            is_kept = composite >= self.drop_threshold
            status = "KEPT" if is_kept else "DROPPED"

            dest_path = None
            if is_kept:
                kept_count += 1
                dest_filename = os.path.basename(frame_path)
                dest_path = os.path.join(self.output_dir, dest_filename)
                shutil.copy2(frame_path, dest_path)
            else:
                dropped_count += 1

            record = {
                "frame_id": frame_id,
                "file_name": os.path.basename(frame_path),
                "original_path": frame_path,
                "kept_path": dest_path,
                "blur_variance": round(blur_var, 2),
                "blur_score": round(blur_score, 4),
                "exposure_score": round(exposure_score, 4),
                "shadow_fraction": round(shadow_fraction, 4),
                "highlight_fraction": round(highlight_fraction, 4),
                "contrast_score": round(contrast_score, 4),
                "composite_weight": round(composite, 4),
                "status": status,
                "gps": item.get("gps")
            }
            scored_frames.append(record)

        if kept_count == 0:
            self.warnings.append("All frames fell below the quality threshold. Consider lowering --drop-threshold.")

        elapsed = time.time() - start_time
        mean_blur = float(np.mean(blur_variances)) if blur_variances else 0.0
        mean_quality = float(np.mean(composite_weights)) if composite_weights else 0.0

        manifest_path = os.path.join(self.output_dir, "quality_manifest.json")
        manifest_data = {
            "total_evaluated": len(scored_frames),
            "kept_count": kept_count,
            "dropped_count": dropped_count,
            "drop_threshold": self.drop_threshold,
            "mean_blur_variance": round(mean_blur, 2),
            "mean_quality_score": round(mean_quality, 4),
            "frames": scored_frames
        }

        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)

        stage_result = StageResult(
            stage_number=3,
            stage_name="Frame Quality Scoring",
            success=True,
            execution_time_sec=round(elapsed, 3),
            metrics={
                "total_evaluated_frames": len(scored_frames),
                "kept_frames_count": kept_count,
                "dropped_frames_count": dropped_count,
                "retention_rate": f"{round((kept_count / max(1, len(scored_frames))) * 100, 1)}%",
                "mean_blur_variance": round(mean_blur, 2),
                "mean_quality_score": round(mean_quality, 4),
                "drop_threshold": self.drop_threshold
            },
            warnings=self.warnings,
            output_files={
                "quality_frames_dir": self.output_dir,
                "quality_manifest": manifest_path
            }
        )

        return scored_frames, stage_result

    def _load_frame_list(self) -> List[Dict[str, Any]]:
        frames = []
        if os.path.isfile(self.input_source) and self.input_source.endswith(".json"):
            with open(self.input_source, "r", encoding="utf-8") as f:
                data = json.load(f)
                frames = data.get("frames", [])
        elif os.path.isdir(self.input_source):
            for fname in sorted(os.listdir(self.input_source)):
                if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    frames.append({
                        "frame_id": Path(fname).stem,
                        "file_path": os.path.join(self.input_source, fname),
                        "gps": None
                    })
        return frames


def main():
    parser = argparse.ArgumentParser(
        description="AstraMesh3D Stage 3: Frame Quality Scoring (SIH26158)"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--manifest", "-m", help="Path to Stage 2 frame_manifest.json")
    group.add_argument("--input-dir", "-i", help="Directory containing extracted frame images")

    parser.add_argument("--output-dir", "-o", default=None, help="Directory to store kept quality frames")
    parser.add_argument("--drop-threshold", "-t", type=float, default=0.30, help="Hard drop threshold for composite quality [0, 1]")

    args = parser.parse_args()

    input_src = args.manifest or args.input_dir
    out_dir = args.output_dir or os.path.join("sample_data", "stage3_quality_frames")

    scorer = QualityScorer(
        input_manifest_or_dir=input_src,
        output_dir=out_dir,
        drop_threshold=args.drop_threshold
    )

    try:
        scored, result = scorer.evaluate()

        print("\n=======================================================")
        print(" ASTRAMESH3D STAGE 3: FRAME QUALITY SCORING COMPLETE")
        print(" SIH26158 Single-Pass Drone Photogrammetry Pipeline")
        print("=======================================================")
        print(f" Frames Evaluated     : {result.metrics['total_evaluated_frames']}")
        print(f" Frames Kept          : {result.metrics['kept_frames_count']} ({result.metrics['retention_rate']})")
        print(f" Frames Dropped       : {result.metrics['dropped_frames_count']} (Below threshold {args.drop_threshold})")
        print(f" Mean Blur Variance   : {result.metrics['mean_blur_variance']} (Laplacian)")
        print(f" Mean Quality Weight  : {result.metrics['mean_quality_score']} in [0, 1]")
        print(f" Quality Frames Dir   : {result.output_files['quality_frames_dir']}")
        print(f" Quality Manifest     : {result.output_files['quality_manifest']}")
        print(f" Execution Duration   : {result.execution_time_sec}s")
        print("=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Stage 3 Quality Scoring failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
