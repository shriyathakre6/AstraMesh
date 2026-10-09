"""
AstraMesh3D - Stage 1: Ingestion & Telemetry Parser
SIH Problem Statement SIH26158
Parses single-pass drone video, GPS tracks, and flight metadata.
Produces a validated FlightSession contract for downstream photogrammetry stages.
"""

import os
import sys
import json
import math
import csv
import time
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

# Support direct execution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline.common import FlightSession, GpsTrackPoint, CameraIntrinsics, StageResult

import cv2


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    r = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class Stage1Ingestor:
    def __init__(self, video_path: str, gps_path: Optional[str] = None, intrinsics_path: Optional[str] = None):
        self.video_path = os.path.abspath(video_path)
        self.gps_path = os.path.abspath(gps_path) if gps_path else None
        self.intrinsics_path = os.path.abspath(intrinsics_path) if intrinsics_path else None
        self.warnings: List[str] = []

    def validate_and_ingest(self) -> Tuple[FlightSession, StageResult]:
        start_time = time.time()
        
        # 1. Inspect Video
        if not os.path.isfile(self.video_path):
            raise FileNotFoundError(f"Drone video file not found at: {self.video_path}")

        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            raise ValueError(f"OpenCV could not open or read video file: {self.video_path}")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fourcc_int = int(cap.get(cv2.CAP_PROP_FOURCC))
        fourcc_str = "".join([chr((fourcc_int >> 8 * i) & 0xFF) for i in range(4)]).strip() or "UNKNOWN"

        # Verify readability of the first frame
        ret, test_frame = cap.read()
        cap.release()

        if not ret or test_frame is None:
            raise ValueError(f"Video opened, but failed reading the initial test frame from: {self.video_path}")

        if fps <= 0 or total_frames <= 0:
            raise ValueError(f"Invalid video metadata: fps={fps}, total_frames={total_frames}")

        duration_sec = total_frames / fps

        # Sanity warning for photogrammetry quality
        if width < 1280 or height < 720:
            self.warnings.append(f"Sub-HD video resolution detected ({width}x{height}). 1080p/4K recommended for dense photogrammetry.")

        # 2. Ingest & Validate GPS Telemetry
        gps_points: List[GpsTrackPoint] = []
        bounding_box = None
        has_altitude = False

        if self.gps_path and os.path.isfile(self.gps_path):
            gps_points, has_altitude = self._parse_gps_file(self.gps_path)
            if gps_points:
                bounding_box = self._calculate_bounding_box(gps_points)
                self._validate_gps_dynamics(gps_points)
            else:
                self.warnings.append("GPS file was provided but contained no valid geographic coordinates.")
        else:
            self.warnings.append("No external GPS telemetry file provided. Georeferencing will fall back to relative visual coordinates.")

        # 3. Check Camera Intrinsics
        intrinsics = None
        calib_status = "AUTO_ESTIMATION_REQUIRED_AT_SFM"

        if self.intrinsics_path and os.path.isfile(self.intrinsics_path):
            intrinsics = self._parse_intrinsics_file(self.intrinsics_path)
            if intrinsics and intrinsics.is_calibrated:
                calib_status = "PRE_CALIBRATED_PROVIDED"
        else:
            self.warnings.append("No pre-calibrated camera intrinsics file provided. COLMAP will estimate focal length and distortion parameters automatically.")

        session_id = f"SESSION_{int(time.time())}_{Path(self.video_path).stem}"

        session = FlightSession(
            session_id=session_id,
            video_path=self.video_path,
            resolution_width=width,
            resolution_height=height,
            fps=round(fps, 3),
            total_frames=total_frames,
            duration_sec=round(duration_sec, 2),
            fourcc=fourcc_str,
            has_gps=len(gps_points) > 0,
            gps_points=gps_points,
            has_altitude=has_altitude,
            has_imu=False,
            has_rtk=False,
            calibration_status=calib_status,
            intrinsics=intrinsics,
            bounding_box=bounding_box,
            warnings=self.warnings
        )

        exec_time = time.time() - start_time
        result = StageResult(
            stage_number=1,
            stage_name="Ingestion & Telemetry Validation",
            success=True,
            execution_time_sec=round(exec_time, 4),
            metrics={
                "resolution": f"{width}x{height}",
                "fps": round(fps, 2),
                "total_frames": total_frames,
                "duration_sec": round(duration_sec, 2),
                "gps_points_count": len(gps_points),
                "has_gps": len(gps_points) > 0,
                "has_altitude": has_altitude,
                "calibration_status": calib_status
            },
            warnings=self.warnings
        )

        return session, result

    def _parse_gps_file(self, filepath: str) -> Tuple[List[GpsTrackPoint], bool]:
        points: List[GpsTrackPoint] = []
        has_alt = False
        ext = Path(filepath).suffix.lower()

        if ext == ".json":
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("track", data) if isinstance(data, dict) else data
                if isinstance(items, list):
                    for idx, item in enumerate(items):
                        lat = float(item.get("lat") or item.get("latitude") or 0.0)
                        lon = float(item.get("lon") or item.get("lng") or item.get("longitude") or 0.0)
                        alt = item.get("alt") or item.get("altitude")
                        ts = item.get("timestamp") or item.get("time") or float(idx)

                        if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0 and not (lat == 0.0 and lon == 0.0):
                            alt_val = float(alt) if alt is not None else None
                            if alt_val is not None:
                                has_alt = True
                            points.append(GpsTrackPoint(
                                timestamp_sec=float(ts),
                                latitude=lat,
                                longitude=lon,
                                altitude_m=alt_val,
                                speed_mps=float(item.get("speed", 0.0)) if item.get("speed") is not None else None
                            ))

        elif ext in [".csv", ".txt", ".log"]:
            with open(filepath, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    row_clean = {k.strip().lower(): v.strip() for k, v in row.items() if k}
                    lat_key = next((k for k in row_clean if k in ["lat", "latitude", "gps_lat"]), None)
                    lon_key = next((k for k in row_clean if k in ["lon", "lng", "longitude", "gps_lon"]), None)
                    alt_key = next((k for k in row_clean if k in ["alt", "altitude", "height", "gps_alt"]), None)
                    ts_key = next((k for k in row_clean if k in ["time", "timestamp", "sec", "t"]), None)
                    speed_key = next((k for k in row_clean if k in ["speed", "vel", "velocity"]), None)

                    if lat_key and lon_key:
                        try:
                            lat = float(row_clean[lat_key])
                            lon = float(row_clean[lon_key])
                            alt = float(row_clean[alt_key]) if alt_key and row_clean[alt_key] else None
                            ts = float(row_clean[ts_key]) if ts_key and row_clean[ts_key] else float(idx)
                            spd = float(row_clean[speed_key]) if speed_key and row_clean[speed_key] else None

                            if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0 and not (lat == 0.0 and lon == 0.0):
                                if alt is not None:
                                    has_alt = True
                                points.append(GpsTrackPoint(
                                    timestamp_sec=ts,
                                    latitude=lat,
                                    longitude=lon,
                                    altitude_m=alt,
                                    speed_mps=spd
                                ))
                        except ValueError:
                            continue

        return points, has_alt

    def _calculate_bounding_box(self, points: List[GpsTrackPoint]) -> Dict[str, float]:
        lats = [p.latitude for p in points]
        lons = [p.longitude for p in points]
        alts = [p.altitude_m for p in points if p.altitude_m is not None]

        bbox = {
            "min_latitude": min(lats),
            "max_latitude": max(lats),
            "min_longitude": min(lons),
            "max_longitude": max(lons),
        }
        if alts:
            bbox["min_altitude_m"] = min(alts)
            bbox["max_altitude_m"] = max(alts)
        return bbox

    def _validate_gps_dynamics(self, points: List[GpsTrackPoint]) -> None:
        """Sanity-checks GPS path for unrealistic speed jumps (>50 m/s for drone passes)."""
        if len(points) < 2:
            return

        jump_count = 0
        for i in range(len(points) - 1):
            p1, p2 = points[i], points[i + 1]
            dt = abs(p2.timestamp_sec - p1.timestamp_sec)
            if dt > 0.001:
                dist = haversine_distance_m(p1.latitude, p1.longitude, p2.latitude, p2.longitude)
                implied_speed = dist / dt
                if implied_speed > 55.0:  # >200 km/h is impossible for standard drone survey pass
                    jump_count += 1

        if jump_count > 0:
            self.warnings.append(f"Detected {jump_count} anomalous GPS position jumps (>55 m/s). Outliers will be filtered during sensor fusion.")

    def _parse_intrinsics_file(self, filepath: str) -> Optional[CameraIntrinsics]:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return CameraIntrinsics(
                    focal_length_px=float(data.get("fx") or data.get("focal_length")),
                    cx=float(data.get("cx") or 0.0),
                    cy=float(data.get("cy") or 0.0),
                    distortion_k1=float(data.get("k1") or 0.0),
                    distortion_k2=float(data.get("k2") or 0.0),
                    is_calibrated=True,
                    source="CALIBRATION_FILE"
                )
        except Exception as e:
            self.warnings.append(f"Failed parsing intrinsics file: {str(e)}")
            return None


def main():
    parser = argparse.ArgumentParser(
        description="AstraMesh3D Stage 1: Drone Video & GPS Telemetry Ingestion (SIH26158)"
    )
    parser.add_argument("--video", "-v", required=True, help="Path to drone video file (.mp4, .mov)")
    parser.add_argument("--gps", "-g", default=None, help="Path to GPS telemetry file (.csv, .json)")
    parser.add_argument("--intrinsics", "-i", default=None, help="Optional camera calibration JSON")
    parser.add_argument("--output-session", "-o", default=None, help="Path to save output FlightSession JSON")
    parser.add_argument("--pretty", action="store_true", help="Print formatted summary table to console")

    args = parser.parse_args()

    ingestor = Stage1Ingestor(
        video_path=args.video,
        gps_path=args.gps,
        intrinsics_path=args.intrinsics
    )

    try:
        session, result = ingestor.validate_and_ingest()

        output_path = args.output_session or f"session_{Path(args.video).stem}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(session.model_dump_json(indent=2))

        print(f"\n=======================================================")
        print(f" ASTRAMESH3D STAGE 1: INGESTION COMPLETE")
        print(f" SIH26158 Single-Pass Drone Photogrammetry Pipeline")
        print(f"=======================================================")
        print(f" Session ID          : {session.session_id}")
        print(f" Video Path          : {session.video_path}")
        print(f" Resolution          : {session.resolution_width} x {session.resolution_height}")
        print(f" Frame Rate          : {session.fps} FPS")
        print(f" Total Frames        : {session.total_frames}")
        print(f" Duration            : {session.duration_sec}s")
        print(f" Codec FourCC        : {session.fourcc}")
        print(f" GPS Track Points    : {len(session.gps_points)}")
        print(f" Altitude Logged     : {'YES' if session.has_altitude else 'NO'}")
        print(f" Calibration Status  : {session.calibration_status}")
        print(f" Output Session JSON : {output_path}")

        if session.bounding_box:
            bb = session.bounding_box
            print(f" Bounding Box        : Lat [{bb['min_latitude']:.6f}, {bb['max_latitude']:.6f}], Lon [{bb['min_longitude']:.6f}, {bb['max_longitude']:.6f}]")

        if session.warnings:
            print(f"\n [DIAGNOSTIC WARNINGS]:")
            for w in session.warnings:
                print(f"  - {w}")
        print(f"=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Stage 1 Ingestion failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
