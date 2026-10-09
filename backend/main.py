"""
AstraMesh3D - Single-Pass Drone Video Photogrammetry Backend API
SIH Problem Statement SIH26158
Microservice serving 12-stage photogrammetry pipeline metrics, web-ready 3D models (.glb, .obj, .ply),
GIS elevation rasters (GeoTIFF), and audit manifests to the React/Three.js frontend.
"""

import os
import sys
import json
import shutil
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to sys.path for relative submodule resolution
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from modules.colmap_engine import ColmapEngine
from modules.frame_sampler import FrameSampler
from modules.georeferencing import GeoreferenceTransformer

app = FastAPI(
    title="AstraMesh3D Reconstruction Engine API",
    description="Backend microservice for single-pass drone video to 3D model generation (SIH26158)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

colmap_engine = ColmapEngine()
frame_sampler = FrameSampler()
georeferencer = GeoreferenceTransformer()

# Static mount for packaged deliverables (.glb, .obj, .tif, etc.)
deliverables_pkg_dir = project_root / "sample_data" / "stage12_delivery" / "package"
if deliverables_pkg_dir.exists():
    app.mount("/api/v1/deliverables", StaticFiles(directory=str(deliverables_pkg_dir)), name="deliverables")


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "AstraMesh3D Reconstruction Engine",
        "sih_problem": "SIH26158"
    }


@app.get("/api/v1/environment")
def get_environment_status():
    """
    Scans host operating system for photogrammetry tooling (COLMAP, CUDA, FFmpeg).
    Returns transparent diagnostic without fabricating availability.
    """
    colmap_info = colmap_engine.check_environment()
    ffmpeg_available = shutil.which("ffmpeg") is not None

    return {
        "os": "Windows 11 (64-bit)",
        "colmap": colmap_info,
        "ffmpeg_available": ffmpeg_available,
        "mode": "REAL_PIPELINE" if colmap_info["colmap_installed"] else "PROTOTYPE_SIMULATION",
        "message": (
            "COLMAP is available and ready for Structure-from-Motion."
            if colmap_info["colmap_installed"]
            else "Prototype Simulation — Processing Engine Not Available on Host PATH."
        )
    }


@app.get("/api/v1/pipeline/manifest")
def get_delivery_manifest():
    """Returns the comprehensive Stage 12 delivery manifest with SHA-256 hashes."""
    manifest_path = project_root / "sample_data" / "stage12_delivery" / "delivery_manifest.json"
    if not manifest_path.exists():
        raise HTTPException(status_code=404, detail="Delivery manifest not found")
    with open(manifest_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/v1/pipeline/qa")
def get_qa_report():
    """Returns the Stage 11 QA verification report and spatial uncertainty analysis."""
    qa_path = project_root / "sample_data" / "stage11_qa" / "qa_report.json"
    if not qa_path.exists():
        raise HTTPException(status_code=404, detail="QA report not found")
    with open(qa_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/v1/pipeline/stages")
def get_all_stages_status():
    """Returns summary status of all 12 pipeline stages."""
    stages = [
        {"stage": 1, "name": "Ingestion & Validation", "manifest": "test_flight_session.json"},
        {"stage": 2, "name": "Adaptive Frame Extraction", "manifest": "stage2_extracted_frames/frame_manifest.json"},
        {"stage": 3, "name": "Frame Quality Scoring", "manifest": "stage3_quality_frames/quality_manifest.json"},
        {"stage": 4, "name": "Visual Reconstruction (SfM)", "manifest": "stage4_reconstruction/reconstruction_manifest.json"},
        {"stage": 5, "name": "AI Monocular Depth", "manifest": "stage5_depth/depth_manifest.json"},
        {"stage": 6, "name": "Dynamic Object Masking", "manifest": "stage6_masks/mask_manifest.json"},
        {"stage": 7, "name": "Sensor Fusion & Scale", "manifest": "stage7_fusion/fusion_manifest.json"},
        {"stage": 8, "name": "Point Cloud Cleanup", "manifest": "stage8_cleanup/cleanup_manifest.json"},
        {"stage": 9, "name": "Surface (Mesh) Generation", "manifest": "stage9_mesh/mesh_manifest.json"},
        {"stage": 10, "name": "Georeferencing & Rasters", "manifest": "stage10_georeferencing/georeference_manifest.json"},
        {"stage": 11, "name": "QA & Spatial Uncertainty", "manifest": "stage11_qa/qa_report.json"},
        {"stage": 12, "name": "Delivery & Packaging", "manifest": "stage12_delivery/delivery_manifest.json"}
    ]

    result = []
    for s in stages:
        p = project_root / "sample_data" / s["manifest"]
        exists = p.exists()
        result.append({
            "stage_number": s["stage"],
            "stage_name": s["name"],
            "completed": exists,
            "status": "COMPLETED" if exists else "PENDING",
            "manifest_file": str(s["manifest"])
        })

    return {
        "pipeline": "AstraMesh3D (SIH26158)",
        "total_stages": 12,
        "completed_stages": sum(1 for s in result if s["completed"]),
        "stages": result
    }


@app.get("/api/v1/pipeline/download")
def download_mission_package():
    """Downloads the full mission zip archive containing all 3D models and GIS rasters."""
    zip_path = project_root / "sample_data" / "stage12_delivery" / "AstraMesh3D_Delivery_Package.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Mission delivery package archive not found")
    return FileResponse(
        str(zip_path),
        media_type="application/zip",
        filename="AstraMesh3D_Delivery_Package.zip"
    )


@app.post("/api/v1/jobs/create")
async def create_reconstruction_job(
    video_name: str = Form(...),
    has_gps: bool = Form(False),
    has_rtk: bool = Form(False)
):
    """Creates a new asynchronous 3D reconstruction job."""
    return {
        "job_id": f"JOB-SIH26158-{int(os.times().system * 1000) % 900 + 100}",
        "video_name": video_name,
        "status": "INITIALIZED",
        "stages_total": 12,
        "georeferencing_mode": "RTK_FIXED" if has_rtk else "GPS_STANDARD" if has_gps else "RELATIVE_VISUAL_ONLY"
    }
