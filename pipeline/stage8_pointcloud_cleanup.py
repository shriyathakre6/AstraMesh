"""
AstraMesh3D - Stage 8: Point Cloud Cleanup & Fusion
SIH Problem Statement SIH26158
Merges georeferenced metric SfM sparse points and scaled AI monocular depth points,
applies multi-stage noise filtering (Statistical Outlier Removal and Radius Outlier Removal),
voxel grid downsampling for uniform spatial point density, and computes oriented surface normals.
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


class PointCloudCleanupEngine:
    def __init__(
        self,
        sparse_ply_path: str,
        dense_ply_path: str,
        output_dir: str,
        voxel_size: float = 0.15,
        nb_neighbors: int = 30,
        std_ratio: float = 1.5,
        radius_nb: int = 16,
        radius_m: float = 0.8
    ):
        self.sparse_ply_path = os.path.abspath(sparse_ply_path)
        self.dense_ply_path = os.path.abspath(dense_ply_path)
        self.output_dir = os.path.abspath(output_dir)
        self.voxel_size = max(0.01, voxel_size)
        self.nb_neighbors = max(5, nb_neighbors)
        self.std_ratio = max(0.1, std_ratio)
        self.radius_nb = max(4, radius_nb)
        self.radius_m = max(0.05, radius_m)
        self.warnings: List[str] = []

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        # 1. Load Input Point Clouds
        print(f"[Stage 8] Loading scaled point clouds...")
        if not os.path.exists(self.sparse_ply_path):
            raise FileNotFoundError(f"Sparse point cloud not found: {self.sparse_ply_path}")
        if not os.path.exists(self.dense_ply_path):
            raise FileNotFoundError(f"Dense point cloud not found: {self.dense_ply_path}")

        pcd_sparse = o3d.io.read_point_cloud(self.sparse_ply_path)
        pcd_dense = o3d.io.read_point_cloud(self.dense_ply_path)

        n_sparse = len(pcd_sparse.points)
        n_dense = len(pcd_dense.points)
        print(f"[Stage 8] Ingested {n_sparse} sparse SfM points and {n_dense} AI dense points.")

        # 2. Geometry Fusion (Multi-Modal Merge)
        pts_merged = np.vstack([np.asarray(pcd_sparse.points), np.asarray(pcd_dense.points)])
        colors_merged = np.vstack([np.asarray(pcd_sparse.colors), np.asarray(pcd_dense.colors)])

        merged_pcd = o3d.geometry.PointCloud()
        merged_pcd.points = o3d.utility.Vector3dVector(pts_merged)
        merged_pcd.colors = o3d.utility.Vector3dVector(colors_merged)
        total_uncleaned = len(merged_pcd.points)
        print(f"[Stage 8] Unified point cloud assembled: {total_uncleaned} points.")

        # 3. Statistical Outlier Removal (SOR)
        print(f"[Stage 8] Applying Statistical Outlier Removal (k={self.nb_neighbors}, std_ratio={self.std_ratio})...")
        pcd_sor, inliers_sor = merged_pcd.remove_statistical_outlier(
            nb_neighbors=self.nb_neighbors,
            std_ratio=self.std_ratio
        )
        n_after_sor = len(pcd_sor.points)
        sor_removed = total_uncleaned - n_after_sor
        print(f"[Stage 8] SOR removed {sor_removed} outlier points ({n_after_sor} remaining).")

        # 4. Radius Outlier Removal (ROR)
        print(f"[Stage 8] Applying Radius Outlier Removal (radius={self.radius_m}m, min_nb={self.radius_nb})...")
        pcd_ror, inliers_ror = pcd_sor.remove_radius_outlier(
            nb_points=self.radius_nb,
            radius=self.radius_m
        )
        n_after_ror = len(pcd_ror.points)
        ror_removed = n_after_sor - n_after_ror
        print(f"[Stage 8] ROR removed {ror_removed} isolated points ({n_after_ror} remaining).")

        # 5. Uniform Voxel Grid Downsampling
        print(f"[Stage 8] Downsampling point cloud with uniform {self.voxel_size}m voxel grid...")
        pcd_clean = pcd_ror.voxel_down_sample(voxel_size=self.voxel_size)
        final_points_count = len(pcd_clean.points)
        print(f"[Stage 8] Voxel downsampling complete: {final_points_count} uniform points.")

        # 6. Oriented Surface Normal Estimation
        print(f"[Stage 8] Estimating oriented surface normals (radius={self.voxel_size * 3.0:.2f}m)...")
        pcd_clean.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(
                radius=self.voxel_size * 3.0,
                max_nn=30
            )
        )
        pcd_clean.orient_normals_consistent_tangent_plane(k=15)

        # Ensure normals generally align with scene orientation (upward +Z for terrain/roofs)
        normals = np.asarray(pcd_clean.normals)
        if np.mean(normals[:, 2]) < 0:
            normals = -normals
            pcd_clean.normals = o3d.utility.Vector3dVector(normals)
        print(f"[Stage 8] Surface normals oriented (100% unit normals established).")

        # 7. Compute Metric Spatial Bounds & Density
        clean_pts = np.asarray(pcd_clean.points)
        bbox_min = clean_pts.min(axis=0).tolist()
        bbox_max = clean_pts.max(axis=0).tolist()
        bbox_span = (clean_pts.max(axis=0) - clean_pts.min(axis=0)).tolist()

        footprint_area_m2 = max(1.0, float(bbox_span[0] * bbox_span[1]))
        density_pts_per_m2 = round(final_points_count / footprint_area_m2, 2)
        bounding_volume_m3 = max(1.0, float(bbox_span[0] * bbox_span[1] * bbox_span[2]))
        density_pts_per_m3 = round(final_points_count / bounding_volume_m3, 2)

        # 8. Export Cleaned Point Cloud
        output_ply_path = os.path.join(self.output_dir, "fused_clean_points.ply")
        o3d.io.write_point_cloud(output_ply_path, pcd_clean, write_ascii=False)
        print(f"[Stage 8] Exported clean metric point cloud to {output_ply_path}")

        elapsed = time.time() - start_time

        # 9. Compile Manifest
        manifest = {
            "scale_mode": "METRIC_GEOREFERENCED_SCALE",
            "is_metric": True,
            "filter_parameters": {
                "voxel_size_m": self.voxel_size,
                "sor_nb_neighbors": self.nb_neighbors,
                "sor_std_ratio": self.std_ratio,
                "ror_min_neighbors": self.radius_nb,
                "ror_radius_m": self.radius_m
            },
            "point_counts": {
                "input_sparse_points": n_sparse,
                "input_ai_dense_points": n_dense,
                "total_unfiltered_points": total_uncleaned,
                "sor_outliers_removed": sor_removed,
                "ror_isolated_removed": ror_removed,
                "final_clean_points": final_points_count,
                "noise_reduction_percent": round((1.0 - final_points_count / total_uncleaned) * 100.0, 2)
            },
            "metric_spatial_bounds_enu_m": {
                "min": [round(v, 3) for v in bbox_min],
                "max": [round(v, 3) for v in bbox_max],
                "span": [round(v, 3) for v in bbox_span]
            },
            "point_density": {
                "footprint_area_m2": round(footprint_area_m2, 2),
                "points_per_m2": density_pts_per_m2,
                "bounding_volume_m3": round(bounding_volume_m3, 2),
                "points_per_m3": density_pts_per_m3
            },
            "surface_normals": {
                "estimated": True,
                "oriented": True,
                "has_normals": pcd_clean.has_normals()
            },
            "output_files": {
                "fused_clean_ply": output_ply_path
            }
        }

        manifest_path = os.path.join(self.output_dir, "cleanup_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        stage_result = StageResult(
            stage_number=8,
            stage_name="Point Cloud Cleanup & Fusion",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "input_sparse_points": n_sparse,
                "input_ai_dense_points": n_dense,
                "total_unfiltered_points": total_uncleaned,
                "sor_outliers_removed": sor_removed,
                "ror_isolated_removed": ror_removed,
                "final_clean_points": final_points_count,
                "noise_reduction_percent": round((1.0 - final_points_count / total_uncleaned) * 100.0, 2),
                "voxel_size_m": self.voxel_size,
                "has_normals": pcd_clean.has_normals(),
                "density_pts_per_m2": density_pts_per_m2
            },
            warnings=self.warnings,
            output_files={
                "fused_clean_ply": output_ply_path,
                "cleanup_manifest": manifest_path
            }
        )

        return manifest, stage_result


def run_stage(
    sparse_ply_path: str,
    dense_ply_path: str,
    output_dir: str,
    voxel_size: float = 0.15,
    **kwargs
) -> StageResult:
    engine = PointCloudCleanupEngine(
        sparse_ply_path=sparse_ply_path,
        dense_ply_path=dense_ply_path,
        output_dir=output_dir,
        voxel_size=voxel_size,
        **kwargs
    )
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 8: Point Cloud Cleanup & Fusion (SIH26158)")
    parser.add_argument("--sparse-ply", "-s", required=True, help="Stage 7 scaled_sparse_points.ply")
    parser.add_argument("--dense-ply", "-d", required=True, help="Stage 7 scaled_ai_dense_points.ply")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage8_cleanup", help="Output directory")
    parser.add_argument("--voxel-size", type=float, default=0.15, help="Voxel downsample grid size in meters")
    parser.add_argument("--nb-neighbors", type=int, default=30, help="SOR k-neighbors")
    parser.add_argument("--std-ratio", type=float, default=1.5, help="SOR standard deviation ratio")
    parser.add_argument("--radius-nb", type=int, default=16, help="ROR minimum neighbors")
    parser.add_argument("--radius-m", type=float, default=0.8, help="ROR radius in meters")
    args = parser.parse_args()

    engine = PointCloudCleanupEngine(
        sparse_ply_path=args.sparse_ply,
        dense_ply_path=args.dense_ply,
        output_dir=args.output_dir,
        voxel_size=args.voxel_size,
        nb_neighbors=args.nb_neighbors,
        std_ratio=args.std_ratio,
        radius_nb=args.radius_nb,
        radius_m=args.radius_m
    )

    manifest, result = engine.run()
    print(f"\n[AstraMesh3D Stage 8 Complete]")
    print(f"Total Input Points: {result.metrics['total_unfiltered_points']}")
    print(f"SOR Outliers Removed: {result.metrics['sor_outliers_removed']}")
    print(f"ROR Isolated Points Removed: {result.metrics['ror_isolated_removed']}")
    print(f"Final Clean Points: {result.metrics['final_clean_points']}")
    print(f"Noise Reduction: {result.metrics['noise_reduction_percent']}%")
    print(f"Point Density: {result.metrics['density_pts_per_m2']} pts/m²")
    print(f"Clean PLY: {result.output_files['fused_clean_ply']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
