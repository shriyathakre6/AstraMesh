# AstraMesh3D (SIH26158)
## Single-Pass Drone Video to Accurate 3D Model Generation System
**Organization:** National Technical Research Organisation (NTRO)  
**Category:** Software | **Theme:** Robotics and Drones  
**Problem Statement ID:** SIH26158  

---

## 1. System Vision & Objective
AstraMesh3D converts a **single continuous moving-UAV video pass** (plus GPS/flight metadata) into an accurate, georeferenced, and measurable 3D scene model.

The system combines:
- **Visual Geometry:** Structure-from-Motion (SfM) and Multi-View Stereo (MVS) via COLMAP.
- **AI Monocular Depth:** Metric and relative depth prediction via monocular foundation models.
- **Sensor Fusion:** Least-squares similarity alignment (scale, rotation, translation) of camera trajectory to real-world GPS coordinates via `pyproj`/`utm`.
- **Dynamic Object Masking:** AI object detection/segmentation filtering out vehicles and pedestrians so dynamic objects do not distort static 3D geometry.
- **Surface Generation & Texturing:** Open3D Poisson & Ball-Pivoting reconstruction with high-quality source frame texture projection.
- **Uncertainty & QA Layer:** Transparent, un-fabricated accuracy metrics (registration rate, point density, completeness) and visual confidence heatmap overlays.
- **Interactive Web Platform:** React 18 + Three.js viewer with real-time measurement tools (distance, elevation, area).

---

## 2. Target 12-Stage Architecture

```
[Drone Video (MP4/MOV) + GPS/Flight Log]
                     │
                     ▼
  STAGE 1: Ingestion & Telemetry Validation  ──────► [FlightSession JSON]
                     │
                     ▼
  STAGE 2: Adaptive Motion-Based Frame Extraction
                     │
                     ▼
  STAGE 3: Blur (Laplacian) & Exposure Scoring
                     │
                     ▼
  STAGE 4: COLMAP Visual SfM / MVS Reconstruction
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  STAGE 5: AI Monocular Depth  STAGE 6: Dynamic Object Masking
         └───────────┬───────────┘
                     │
                     ▼
  STAGE 7: Sensor Fusion & Trajectory Alignment (Scale + Georeferencing)
                     │
                     ▼
  STAGE 8: Open3D Point Cloud Cleanup (Outlier Filtering & Downsampling)
                     │
                     ▼
  STAGE 9: Surface (Mesh) Generation & Texture Projection
                     │
                     ▼
  STAGE 10: Georeferencing & CRS Transformation (UTM / WGS84)
                     │
                     ▼
  STAGE 11: QA, Accuracy & Uncertainty Evaluation
                     │
                     ▼
  STAGE 12: Delivery (.PLY, .LAS, .GLB, .OBJ + QA Manifest)
```

---

## 3. Repository Structure

```
astramesh3d/
├── pipeline/                         # 12 Independent, CLI-testable pipeline modules
│   ├── __init__.py
│   ├── common.py                     # Pydantic contracts (FlightSession, StageResult)
│   ├── stage1_ingestion.py           # [Active] Video & GPS parser, validator, session builder
│   ├── stage2_frame_extraction.py    # [Scaffold] Adaptive frame sampling
│   ├── stage3_quality_scoring.py     # [Scaffold] Laplacian blur & histogram exposure
│   ├── stage4_visual_reconstruction.py # [Scaffold] COLMAP SfM/MVS wrapper
│   ├── stage5_ai_depth.py            # [Scaffold] Monocular depth estimation & fusion
│   ├── stage6_dynamic_masking.py     # [Scaffold] Dynamic object exclusion masks
│   ├── stage7_sensor_fusion.py       # [Scaffold] Least-squares trajectory alignment
│   ├── stage8_pointcloud_cleanup.py  # [Scaffold] Outlier removal & voxel filtering
│   ├── stage9_mesh_generation.py     # [Scaffold] Poisson surface meshing & texturing
│   ├── stage10_georeferencing.py     # [Scaffold] WGS84/UTM transformation
│   ├── stage11_qa_uncertainty.py     # [Scaffold] Registration rate & confidence overlay
│   └── stage12_delivery.py           # [Scaffold] Progressive export packaging
├── backend/                          # FastAPI microservice wrapping async reconstruction jobs
│   ├── main.py
│   ├── requirements.txt
│   └── modules/
├── frontend/                         # Frontend documentation and architecture overview
│   └── README.md
├── src/                              # Production React 18 + Three.js application
├── sample_data/                      # Verified sample drone flight logs & fixtures
│   ├── sample_flight_log.csv
│   ├── sample_flight_log.json
│   └── test_flight_session.json
├── package.json                      # Vite frontend package configuration
└── README.md
```

---

## 4. Environment & Dependencies

- **Python:** 3.11 (via isolated virtual environment `astramesh-env`)
- **Key Python Libraries:**
  - `open3d==0.19.0` (3D Point Cloud, Normal Estimation, Meshing)
  - `opencv-python==5.0.0` (Video I/O, Blur Variance, Color Filtering)
  - `numpy==2.4.6`, `scipy==1.17.1` (Linear Algebra, Transform Optimization)
  - `fastapi`, `uvicorn`, `pydantic` (Backend API & Async Engine)
- **External Tooling:**
  - `COLMAP 4.2.0` (Structure-from-Motion / Multi-View Stereo)
  - `Node.js 18+` / `Vite` (Interactive Web Viewer)

---

## 5. Running Stage 1 (Ingestion) CLI

Stage 1 can be tested independently on any drone video and GPS telemetry file:

```powershell
# Activate Python 3.11 virtual environment
C:\Users\shriy\astramesh-env\Scripts\Activate.ps1

# Run Stage 1 CLI
python pipeline/stage1_ingestion.py `
  --video "path/to/drone_video.mp4" `
  --gps "sample_data/sample_flight_log.csv" `
  --output-session "sample_data/my_flight_session.json"
```

### Stage 1 Validation Features:
- **Stream Integrity:** Verifies OpenCV can read frames, confirms valid FPS and non-zero duration.
- **Geographic Bounding:** Validates latitude $\in [-90, 90]$ and longitude $\in [-180, 180]$.
- **Flight Dynamics Check:** Calculates haversine distance and inter-frame implied velocity. Flags impossible velocity jumps (>55 m/s) without crashing.
- **Calibration Transparency:** Flags missing camera calibration for automatic COLMAP self-calibration.
