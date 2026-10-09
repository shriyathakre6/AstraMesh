"""
AstraMesh3D - Stage 10: Georeferencing & Coordinate Transformation
SIH Problem Statement SIH26158
Anchors the 3D model into standard GIS coordinate reference systems:
Projected CRS: UTM Zone 43N (EPSG:32643) and Geographic CRS: WGS84 (EPSG:4326).
Exports a 32-bit floating-point Digital Surface Model (DSM) raster with ESRI World File (.tfw),
Projection File (.prj), colorized elevation relief visualizer, and a GeoJSON survey boundary polygon.
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
import pyproj
import tifffile
import cv2
from scipy.spatial import ConvexHull
from scipy.interpolate import griddata


class GeoreferencingEngine:
    def __init__(
        self,
        fusion_manifest_path: str,
        pointcloud_path: str,
        output_dir: str,
        mesh_path: Optional[str] = None,
        cell_size_m: float = 0.25,
        epsg_code: int = 32643
    ):
        self.fusion_manifest_path = os.path.abspath(fusion_manifest_path)
        self.pointcloud_path = os.path.abspath(pointcloud_path)
        self.output_dir = os.path.abspath(output_dir)
        self.mesh_path = os.path.abspath(mesh_path) if mesh_path else None
        self.cell_size_m = max(0.05, min(2.0, cell_size_m))
        self.epsg_code = epsg_code
        self.warnings: List[str] = []

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        # 1. Load Fusion Manifest to retrieve geodetic origin
        print(f"[Stage 10] Reading reference origin from {self.fusion_manifest_path}...")
        if not os.path.exists(self.fusion_manifest_path):
            raise FileNotFoundError(f"Fusion manifest not found: {self.fusion_manifest_path}")

        with open(self.fusion_manifest_path, "r", encoding="utf-8") as f:
            fusion_data = json.load(f)

        ref_origin = fusion_data.get("reference_origin_wgs84", {})
        lat0 = float(ref_origin.get("latitude", 28.6139592))
        lon0 = float(ref_origin.get("longitude", 77.2090215))
        alt0 = float(ref_origin.get("altitude_m", 45.05))

        print(f"[Stage 10] Geographic Anchor Origin: Lat={lat0:.7f}°, Lon={lon0:.7f}°, Alt={alt0:.2f}m")

        # 2. Set up CRS Transformers
        crs_wgs84 = pyproj.CRS.from_epsg(4326)
        crs_utm = pyproj.CRS.from_epsg(self.epsg_code)
        proj_to_utm = pyproj.Transformer.from_crs(crs_wgs84, crs_utm, always_xy=True)
        proj_to_wgs84 = pyproj.Transformer.from_crs(crs_utm, crs_wgs84, always_xy=True)

        utm_e0, utm_n0 = proj_to_utm.transform(lon0, lat0)
        print(f"[Stage 10] Projected UTM Zone {self.epsg_code % 100}N Origin: Easting={utm_e0:.3f}m, Northing={utm_n0:.3f}m")

        # 3. Ingest Metric Point Cloud
        print(f"[Stage 10] Ingesting metric point cloud from {self.pointcloud_path}...")
        if not os.path.exists(self.pointcloud_path):
            raise FileNotFoundError(f"Point cloud file not found: {self.pointcloud_path}")

        pcd = o3d.io.read_point_cloud(self.pointcloud_path)
        enu_pts = np.asarray(pcd.points) # [East_m, North_m, Up_m]
        n_points = len(enu_pts)
        if n_points < 3:
            raise ValueError(f"Insufficient points ({n_points}) for georeferencing")

        # 4. Transform to Absolute UTM and WGS84 Coordinates
        utm_e = utm_e0 + enu_pts[:, 0]
        utm_n = utm_n0 + enu_pts[:, 1]
        utm_h = alt0 + enu_pts[:, 2]

        wgs84_lons, wgs84_lats = proj_to_wgs84.transform(utm_e, utm_n)

        # Elevation Statistics
        elev_min = round(float(np.min(utm_h)), 2)
        elev_max = round(float(np.max(utm_h)), 2)
        elev_mean = round(float(np.mean(utm_h)), 2)
        print(f"[Stage 10] Elevation Profile: Min={elev_min}m, Max={elev_max}m, Mean={elev_mean}m")

        # 5. Generate 2D Convex Hull for GeoJSON Survey Boundary
        hull_pts = np.column_stack([wgs84_lons, wgs84_lats])
        hull = ConvexHull(hull_pts)
        hull_coords = [[round(float(hull_pts[v, 0]), 7), round(float(hull_pts[v, 1]), 7)] for v in hull.vertices]
        hull_coords.append(hull_coords[0])  # Close the polygon

        geojson_boundary = {
            "type": "FeatureCollection",
            "name": "AstraMesh3D_Survey_Boundary",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
            },
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "project": "AstraMesh3D",
                        "survey_crs": f"EPSG:{self.epsg_code}",
                        "elevation_min_m": elev_min,
                        "elevation_max_m": elev_max,
                        "elevation_mean_m": elev_mean,
                        "point_count": n_points,
                        "hull_vertices": len(hull.vertices)
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [hull_coords]
                    }
                }
            ]
        }

        geojson_path = os.path.join(self.output_dir, "survey_boundary.geojson")
        with open(geojson_path, "w", encoding="utf-8") as f:
            json.dump(geojson_boundary, f, indent=2)
        print(f"[Stage 10] Exported survey footprint to {geojson_path}")

        # 6. Generate Digital Surface Model (DSM / DEM) Raster Grid
        e_min = float(np.min(utm_e))
        e_max = float(np.max(utm_e))
        n_min = float(np.min(utm_n))
        n_max = float(np.max(utm_n))

        # Margin
        margin = self.cell_size_m * 2.0
        grid_e_min = e_min - margin
        grid_e_max = e_max + margin
        grid_n_min = n_min - margin
        grid_n_max = n_max + margin

        grid_w = int(np.ceil((grid_e_max - grid_e_min) / self.cell_size_m))
        grid_h = int(np.ceil((grid_n_max - grid_n_min) / self.cell_size_m))

        print(f"[Stage 10] Generating DSM Elevation Raster ({grid_w}x{grid_h} pixels at {self.cell_size_m}m/pixel)...")

        # Interpolate heights onto regular grid
        grid_x = np.linspace(grid_e_min, grid_e_max, grid_w)
        grid_y = np.linspace(grid_n_max, grid_n_min, grid_h) # Top to bottom (North down)
        grid_xx, grid_yy = np.meshgrid(grid_x, grid_y)

        # Linear interpolation with nearest fallback for borders
        dsm_linear = griddata(
            (utm_e, utm_n), utm_h,
            (grid_xx, grid_yy),
            method="linear"
        )
        dsm_nearest = griddata(
            (utm_e, utm_n), utm_h,
            (grid_xx, grid_yy),
            method="nearest"
        )
        dsm_elevation = np.where(np.isnan(dsm_linear), dsm_nearest, dsm_linear).astype(np.float32)

        # 7. Export DSM Raster Files (.tif, .tfw, .prj)
        tif_path = os.path.join(self.output_dir, "dsm_elevation.tif")
        tifffile.imwrite(tif_path, dsm_elevation)

        # World File (.tfw)
        tfw_path = os.path.join(self.output_dir, "dsm_elevation.tfw")
        with open(tfw_path, "w", encoding="utf-8") as f:
            f.write(f"{self.cell_size_m:.6f}\n")
            f.write("0.000000\n")
            f.write("0.000000\n")
            f.write(f"{-self.cell_size_m:.6f}\n")
            f.write(f"{grid_e_min + self.cell_size_m / 2.0:.6f}\n")
            f.write(f"{grid_n_max - self.cell_size_m / 2.0:.6f}\n")

        # Projection File (.prj)
        prj_path = os.path.join(self.output_dir, "dsm_elevation.prj")
        with open(prj_path, "w", encoding="utf-8") as f:
            f.write(crs_utm.to_wkt())

        print(f"[Stage 10] Saved DSM GeoTIFF: {tif_path}, TFW: {tfw_path}, PRJ: {prj_path}")

        # 8. Export Colorized Relief Preview Visualizer
        preview_path = os.path.join(self.output_dir, "dsm_relief_preview.jpg")
        norm_elev = cv2.normalize(dsm_elevation, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        color_relief = cv2.applyColorMap(norm_elev, cv2.COLORMAP_TURBO)
        cv2.imwrite(preview_path, color_relief, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(f"[Stage 10] Saved colorized relief visualizer to {preview_path}")

        elapsed = time.time() - start_time

        # 9. Compile Manifest
        manifest = {
            "scale_mode": "METRIC_GEOREFERENCED_SCALE",
            "is_metric": True,
            "crs": {
                "projected_crs": f"UTM Zone {self.epsg_code % 100}N",
                "projected_epsg": self.epsg_code,
                "geographic_crs": "WGS84",
                "geographic_epsg": 4326
            },
            "reference_origin": {
                "latitude": lat0,
                "longitude": lon0,
                "altitude_m": alt0,
                "utm_easting_m": round(utm_e0, 3),
                "utm_northing_m": round(utm_n0, 3)
            },
            "bounding_box_utm_m": {
                "easting_min": round(e_min, 3),
                "easting_max": round(e_max, 3),
                "northing_min": round(n_min, 3),
                "northing_max": round(n_max, 3),
                "span_easting_m": round(e_max - e_min, 3),
                "span_northing_m": round(n_max - n_min, 3)
            },
            "bounding_box_wgs84_deg": {
                "lon_min": round(float(np.min(wgs84_lons)), 7),
                "lon_max": round(float(np.max(wgs84_lons)), 7),
                "lat_min": round(float(np.min(wgs84_lats)), 7),
                "lat_max": round(float(np.max(wgs84_lats)), 7)
            },
            "elevation_statistics_m": {
                "min": elev_min,
                "max": elev_max,
                "mean": elev_mean,
                "relief_span_m": round(elev_max - elev_min, 2)
            },
            "dsm_raster": {
                "grid_width_pixels": grid_w,
                "grid_height_pixels": grid_h,
                "pixel_size_m": self.cell_size_m,
                "cell_area_m2": round(self.cell_size_m * self.cell_size_m, 4)
            },
            "output_files": {
                "dsm_elevation_tif": tif_path,
                "dsm_world_file_tfw": tfw_path,
                "dsm_projection_prj": prj_path,
                "dsm_relief_preview": preview_path,
                "survey_boundary_geojson": geojson_path
            }
        }

        manifest_path = os.path.join(self.output_dir, "georeference_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        stage_result = StageResult(
            stage_number=10,
            stage_name="Georeferencing & Coordinate Transformation",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "projected_epsg": self.epsg_code,
                "geographic_epsg": 4326,
                "dsm_resolution_m": self.cell_size_m,
                "dsm_pixels": f"{grid_w}x{grid_h}",
                "elevation_min_m": elev_min,
                "elevation_max_m": elev_max,
                "elevation_mean_m": elev_mean,
                "relief_span_m": round(elev_max - elev_min, 2),
                "convex_hull_vertices": len(hull.vertices)
            },
            warnings=self.warnings,
            output_files={
                "georeference_manifest": manifest_path,
                "dsm_elevation_tif": tif_path,
                "survey_boundary_geojson": geojson_path,
                "dsm_relief_preview": preview_path
            }
        )

        return manifest, stage_result


def run_stage(
    fusion_manifest_path: str,
    pointcloud_path: str,
    output_dir: str,
    cell_size_m: float = 0.25,
    **kwargs
) -> StageResult:
    engine = GeoreferencingEngine(
        fusion_manifest_path=fusion_manifest_path,
        pointcloud_path=pointcloud_path,
        output_dir=output_dir,
        cell_size_m=cell_size_m,
        **kwargs
    )
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 10: Georeferencing & Coordinate Transformation (SIH26158)")
    parser.add_argument("--fusion-manifest", "-f", required=True, help="Stage 7 fusion_manifest.json")
    parser.add_argument("--pointcloud-path", "-p", required=True, help="Stage 8 fused_clean_points.ply")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage10_georeferencing", help="Output directory")
    parser.add_argument("--cell-size", type=float, default=0.25, help="DSM grid cell size in meters")
    parser.add_argument("--epsg", type=int, default=32643, help="UTM projected EPSG code (default: 32643 for Zone 43N)")
    args = parser.parse_args()

    engine = GeoreferencingEngine(
        fusion_manifest_path=args.fusion_manifest,
        pointcloud_path=args.pointcloud_path,
        output_dir=args.output_dir,
        cell_size_m=args.cell_size,
        epsg_code=args.epsg
    )

    manifest, result = engine.run()
    print(f"\n[AstraMesh3D Stage 10 Complete]")
    print(f"Projected CRS: EPSG:{result.metrics['projected_epsg']}")
    print(f"DSM Grid: {result.metrics['dsm_pixels']} @ {result.metrics['dsm_resolution_m']}m/pixel")
    print(f"Elevation Range: {result.metrics['elevation_min_m']}m to {result.metrics['elevation_max_m']}m (Relief: {result.metrics['relief_span_m']}m)")
    print(f"DSM GeoTIFF: {result.output_files['dsm_elevation_tif']}")
    print(f"Survey GeoJSON: {result.output_files['survey_boundary_geojson']}")
    print(f"Manifest: {result.output_files['georeference_manifest']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
