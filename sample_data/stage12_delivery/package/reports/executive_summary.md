# AstraMesh3D: Drone Reconstruction Executive Mission Summary
**System**: AstraMesh3D — Single-Pass Drone Video to 3D Digital Twin (SIH26158)  
**Execution Standard**: Strict Zero-Fabrication Accuracy Protocol  
**Date Generated**: 2026-09-05 02:53:43 UTC

---

## 1. Flight & Sensor Telemetry
- **Video Input**: 888 frames @ 60.0 FPS (1080x1920)
- **Photogrammetry Keyframes**: 70 frames vetted (92.1% motion pruning efficiency)
- **Mean Frame Quality**: Q = 0.9811 (Laplacian variance mu = 1536.34)
- **Dynamic Objects Filtered**: 417 moving objects (YOLOv8n + 20px dilation)
- **GPS Coordinates Anchor**: Lat 28.6139592 deg N, Lon 77.2090215 deg E, Alt 45.05m
- **Projected CRS**: UTM Zone 43N (EPSG:32643)

---

## 2. Geometric Reconstruction Metrics
- **Visual Camera Registration**: 100.0% (70 / 70 frames registered)
- **Mean Reprojection Error**: 0.6194 px
- **Sim(3) Metric Scale Factor**: 5.938539 meters / visual unit
- **Trajectory Alignment RMSE**: 1.1569 meters (Mean: 0.9821m)
- **Final Clean Point Cloud**: 34,143 points (13.98 pts/m2 across 2,442.05 m2 ground footprint)
- **Triangular Surface Mesh**: 86,477 vertices, 171,325 triangles
- **Reconstructed Surface Area**: 2,670.98 m2
- **Digital Surface Model (DSM)**: 0.25m / pixel (127 x 324 pixels)

---

## 3. Spatial Uncertainty & Ground-Truth Disclosure
- **Mean Point Confidence**: 0.6989 (48.0% High, 33.1% Moderate, 18.9% Low)
- **Ground Truth Assessment**: not available — no reference provided
- **Provenance Note**: All metrics are calculated directly from physical video inputs and sensor logs.

---

## 4. Deliverable File Inventory
- `models_3d/scene_mesh.glb` (Native WebGL / Three.js binary model)
- `models_3d/scene_mesh.obj` (Universal CAD / Blender mesh)
- `models_3d/scene_mesh.ply` (Colorized polygonal surface mesh)
- `models_3d/pointcloud_metric_clean.ply` (Clean normal-oriented point cloud)
- `models_3d/pointcloud_confidence_tagged.ply` (Uncertainty-colored point cloud)
- `gis_rasters/dsm_elevation.tif` (32-bit Float GeoTIFF DSM elevation raster)
- `gis_rasters/survey_boundary.geojson` (Standard GIS survey polygon)
- `reports/qa_report.json` (Full 12-stage audit trail)
