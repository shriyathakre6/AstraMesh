"""
AstraMesh3D - Common Data Models & Pipeline Schemas
SIH26158 Standardized Inter-Stage Contracts
"""

import time
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field

class GpsTrackPoint(BaseModel):
    timestamp_sec: float
    latitude: float
    longitude: float
    altitude_m: Optional[float] = None
    speed_mps: Optional[float] = None
    heading_deg: Optional[float] = None
    accuracy_m: Optional[float] = None

class CameraIntrinsics(BaseModel):
    focal_length_px: Optional[float] = None
    cx: Optional[float] = None
    cy: Optional[float] = None
    distortion_k1: Optional[float] = None
    distortion_k2: Optional[float] = None
    is_calibrated: bool = False
    source: str = "AUTO_ESTIMATION"

class FlightSession(BaseModel):
    session_id: str
    video_path: str
    resolution_width: int
    resolution_height: int
    fps: float
    total_frames: int
    duration_sec: float
    fourcc: str
    has_gps: bool = False
    gps_points: List[GpsTrackPoint] = Field(default_factory=list)
    has_altitude: bool = False
    has_imu: bool = False
    has_rtk: bool = False
    calibration_status: str = "AUTO_ESTIMATION_REQUIRED_AT_SFM"
    intrinsics: Optional[CameraIntrinsics] = None
    bounding_box: Optional[Dict[str, float]] = None
    warnings: List[str] = Field(default_factory=list)
    created_at_iso: str = Field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))

class StageResult(BaseModel):
    stage_number: int
    stage_name: str
    success: bool
    execution_time_sec: float
    metrics: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    output_files: Dict[str, str] = Field(default_factory=dict)
    completed_at: str = Field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
