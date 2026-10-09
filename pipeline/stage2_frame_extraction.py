"""
AstraMesh3D - Stage 2: Adaptive Frame Extraction
SIH Problem Statement SIH26158
Samples video frames at motion-adaptive intervals to maintain photogrammetric overlap (70-80%)
while avoiding redundant frames during hovering or slow passes.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline.common import FlightSession, GpsTrackPoint, StageResult

import cv2
import numpy as np


def interpolate_gps(points: List[GpsTrackPoint], target_time_sec: float) -> Optional[Dict[str, float]]:
    """Linearly interpolates GPS coordinates for an exact video frame timestamp."""
    if not points:
        return None

    if target_time_sec <= points[0].timestamp_sec:
        p = points[0]
        return {"latitude": p.latitude, "longitude": p.longitude, "altitude_m": p.altitude_m, "speed_mps": p.speed_mps}

    if target_time_sec >= points[-1].timestamp_sec:
        p = points[-1]
        return {"latitude": p.latitude, "longitude": p.longitude, "altitude_m": p.altitude_m, "speed_mps": p.speed_mps}

    for i in range(len(points) - 1):
        p1, p2 = points[i], points[i + 1]
        if p1.timestamp_sec <= target_time_sec <= p2.timestamp_sec:
            dt = p2.timestamp_sec - p1.timestamp_sec
            if dt <= 0:
                alpha = 0.0
            else:
                alpha = (target_time_sec - p1.timestamp_sec) / dt

            lat = p1.latitude + alpha * (p2.latitude - p1.latitude)
            lon = p1.longitude + alpha * (p2.longitude - p1.longitude)
            alt = None
            if p1.altitude_m is not None and p2.altitude_m is not None:
                alt = p1.altitude_m + alpha * (p2.altitude_m - p1.altitude_m)
            spd = None
            if p1.speed_mps is not None and p2.speed_mps is not None:
                spd = p1.speed_mps + alpha * (p2.speed_mps - p1.speed_mps)

            return {
                "latitude": round(lat, 7),
                "longitude": round(lon, 7),
                "altitude_m": round(alt, 2) if alt is not None else None,
                "speed_mps": round(spd, 2) if spd is not None else None
            }
    return None


class AdaptiveFrameExtractor:
    def __init__(
        self,
        video_path: str,
        output_dir: str,
        gps_points: Optional[List[GpsTrackPoint]] = None,
        mode: str = "adaptive",
        motion_threshold: float = 12.0,
        min_interval_sec: float = 0.15,
        max_interval_sec: float = 1.2,
        uniform_fps: float = 2.0,
        jpeg_quality: int = 95
    ):
        self.video_path = os.path.abspath(video_path)
        self.output_dir = os.path.abspath(output_dir)
        self.gps_points = gps_points or []
        self.mode = mode.lower()
        self.motion_threshold = motion_threshold
        self.min_interval_sec = min_interval_sec
        self.max_interval_sec = max_interval_sec
        self.uniform_fps = uniform_fps
        self.jpeg_quality = jpeg_quality
        self.warnings: List[str] = []

    def extract(self) -> Tuple[List[Dict[str, Any]], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        if not os.path.isfile(self.video_path):
            raise FileNotFoundError(f"Video file does not exist: {self.video_path}")

        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {self.video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            total_frames = 1

        extracted_manifest: List[Dict[str, Any]] = []
        frame_idx = 0
        extracted_count = 0

        prev_eval_gray = None
        last_extracted_time = -999.0
        cumulative_displacement = 0.0
        motion_scores: List[float] = []

        # Downscale factor for real-time motion estimation
        eval_width, eval_height = 320, 240

        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            current_time = frame_idx / fps
            time_since_last = current_time - last_extracted_time

            # Pre-process downsized thumbnail for optical motion estimation
            thumb = cv2.resize(frame, (eval_width, eval_height), interpolation=cv2.INTER_AREA)
            curr_eval_gray = cv2.cvtColor(thumb, cv2.COLOR_BGR2GRAY)

            should_extract = False
            instantaneous_motion = 0.0

            if self.mode == "adaptive":
                if prev_eval_gray is None:
                    # Always capture the first valid frame
                    should_extract = True
                    instantaneous_motion = 0.0
                else:
                    # Calculate optical flow displacement magnitude
                    flow = cv2.calcOpticalFlowFarneback(
                        prev_eval_gray, curr_eval_gray, None,
                        pyr_scale=0.5, levels=2, winsize=11, iterations=2, poly_n=5, poly_sigma=1.1, flags=0
                    )
                    mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
                    instantaneous_motion = float(np.mean(mag))
                    cumulative_displacement += instantaneous_motion

                    # Trigger condition: threshold met or safety max-interval reached
                    if time_since_last >= self.min_interval_sec:
                        if cumulative_displacement >= self.motion_threshold or time_since_last >= self.max_interval_sec:
                            should_extract = True

            elif self.mode == "uniform":
                uniform_interval = 1.0 / max(0.1, self.uniform_fps)
                if prev_eval_gray is None or time_since_last >= uniform_interval:
                    should_extract = True

            if should_extract:
                frame_filename = f"frame_{extracted_count:06d}.jpg"
                frame_path = os.path.join(self.output_dir, frame_filename)

                # Save frame at high photogrammetry quality
                cv2.imwrite(
                    frame_path,
                    frame,
                    [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality]
                )

                gps_data = interpolate_gps(self.gps_points, current_time)

                record = {
                    "frame_id": f"frame_{extracted_count:06d}",
                    "frame_index": frame_idx,
                    "timestamp_sec": round(current_time, 3),
                    "motion_score": round(cumulative_displacement if self.mode == "adaptive" else instantaneous_motion, 2),
                    "file_name": frame_filename,
                    "file_path": frame_path,
                    "gps": gps_data
                }
                extracted_manifest.append(record)
                motion_scores.append(record["motion_score"])

                # Reset state for next interval
                prev_eval_gray = curr_eval_gray
                last_extracted_time = current_time
                cumulative_displacement = 0.0
                extracted_count += 1

            frame_idx += 1

        cap.release()

        if extracted_count == 0:
            raise RuntimeError("No frames could be extracted from the video stream.")

        elapsed_sec = time.time() - start_time
        reduction_ratio = total_frames / extracted_count
        mean_motion = float(np.mean(motion_scores)) if motion_scores else 0.0
        mean_interval = (total_frames / fps) / extracted_count if extracted_count > 0 else 0.0

        manifest_path = os.path.join(self.output_dir, "frame_manifest.json")
        manifest_data = {
            "video_path": self.video_path,
            "extraction_mode": self.mode,
            "total_video_frames": total_frames,
            "extracted_count": extracted_count,
            "reduction_ratio": round(reduction_ratio, 2),
            "mean_motion_delta": round(mean_motion, 2),
            "mean_interval_sec": round(mean_interval, 3),
            "frames": extracted_manifest
        }
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)

        stage_result = StageResult(
            stage_number=2,
            stage_name="Adaptive Frame Extraction",
            success=True,
            execution_time_sec=round(elapsed_sec, 3),
            metrics={
                "extraction_mode": self.mode,
                "total_video_frames": total_frames,
                "extracted_frames_count": extracted_count,
                "sampling_ratio": f"1:{round(reduction_ratio, 1)}",
                "reduction_percent": f"{round((1.0 - (extracted_count / total_frames)) * 100, 1)}%",
                "mean_motion_delta": round(mean_motion, 2),
                "mean_interval_sec": round(mean_interval, 3),
                "gps_synced_frames": sum(1 for f in extracted_manifest if f.get("gps"))
            },
            warnings=self.warnings,
            output_files={
                "frames_dir": self.output_dir,
                "manifest_path": manifest_path
            }
        )

        return extracted_manifest, stage_result


def main():
    parser = argparse.ArgumentParser(
        description="AstraMesh3D Stage 2: Adaptive Motion-Based Frame Extraction (SIH26158)"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--session", "-s", help="Path to FlightSession JSON from Stage 1")
    group.add_argument("--video", "-v", help="Direct path to drone video file (.mp4, .mov)")

    parser.add_argument("--output-dir", "-o", default=None, help="Destination directory for extracted frame images")
    parser.add_argument("--mode", "-m", choices=["adaptive", "uniform"], default="adaptive", help="Extraction strategy")
    parser.add_argument("--motion-threshold", type=float, default=12.0, help="Cumulative optical motion threshold")
    parser.add_argument("--min-interval", type=float, default=0.15, help="Minimum interval in seconds between frames")
    parser.add_argument("--max-interval", type=float, default=1.2, help="Maximum interval in seconds between frames")
    parser.add_argument("--uniform-fps", type=float, default=2.0, help="Sampling FPS when using uniform mode")

    args = parser.parse_args()

    video_path = None
    gps_points = []

    if args.session:
        with open(args.session, "r", encoding="utf-8") as f:
            session_dict = json.load(f)
            video_path = session_dict.get("video_path")
            gps_raw = session_dict.get("gps_points", [])
            gps_points = [GpsTrackPoint(**p) for p in gps_raw]
    else:
        video_path = args.video

    if not video_path:
        print("[ERROR] No valid video path provided.", file=sys.stderr)
        sys.exit(1)

    out_dir = args.output_dir or os.path.join("sample_data", "extracted_frames")

    extractor = AdaptiveFrameExtractor(
        video_path=video_path,
        output_dir=out_dir,
        gps_points=gps_points,
        mode=args.mode,
        motion_threshold=args.motion_threshold,
        min_interval_sec=args.min_interval,
        max_interval_sec=args.max_interval,
        uniform_fps=args.uniform_fps
    )

    try:
        manifest, result = extractor.extract()

        print("\n=======================================================")
        print(" ASTRAMESH3D STAGE 2: ADAPTIVE FRAME EXTRACTION COMPLETE")
        print(" SIH26158 Single-Pass Drone Photogrammetry Pipeline")
        print("=======================================================")
        print(f" Source Video         : {video_path}")
        print(f" Extraction Mode      : {result.metrics['extraction_mode'].upper()}")
        print(f" Total Video Frames   : {result.metrics['total_video_frames']}")
        print(f" Frames Extracted     : {result.metrics['extracted_frames_count']}")
        print(f" Reduction Efficiency : {result.metrics['reduction_percent']} frames pruned (Ratio {result.metrics['sampling_ratio']})")
        print(f" Mean Inter-Frame     : {result.metrics['mean_interval_sec']}s")
        print(f" GPS Synced Frames    : {result.metrics['gps_synced_frames']}")
        print(f" Output Directory     : {result.output_files['frames_dir']}")
        print(f" Output Manifest      : {result.output_files['manifest_path']}")
        print(f" Execution Duration   : {result.execution_time_sec}s")
        print("=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Stage 2 Frame Extraction failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
