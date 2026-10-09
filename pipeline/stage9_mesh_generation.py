"""
AstraMesh3D - Stage 9: Surface Reconstruction & Texturing
SIH Problem Statement SIH26158
Reconstructs a continuous, metric 3D polygonal surface mesh from clean normal-oriented points
using Screened Poisson Surface Reconstruction, trims low-density extrapolation bubbles,
cleans mesh topology (degenerate triangles, non-manifold edges), transfers photorealistic RGB colors
via KDTree nearest-neighbor interpolation, and exports standard .ply and .obj models.
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


class MeshGenerationEngine:
    def __init__(
        self,
        pointcloud_path: str,
        output_dir: str,
        poisson_depth: int = 9,
        trim_quantile: float = 0.05
    ):
        self.pointcloud_path = os.path.abspath(pointcloud_path)
        self.output_dir = os.path.abspath(output_dir)
        self.poisson_depth = max(6, min(12, poisson_depth))
        self.trim_quantile = max(0.0, min(0.3, trim_quantile))
        self.warnings: List[str] = []

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        # 1. Ingest Clean Point Cloud
        print(f"[Stage 9] Ingesting clean point cloud from {self.pointcloud_path}...")
        if not os.path.exists(self.pointcloud_path):
            raise FileNotFoundError(f"Point cloud file not found: {self.pointcloud_path}")

        pcd = o3d.io.read_point_cloud(self.pointcloud_path)
        n_points = len(pcd.points)
        if n_points < 10:
            raise ValueError(f"Insufficient points ({n_points}) for surface reconstruction")

        if not pcd.has_normals():
            print(f"[Stage 9] Point cloud lacks normals, estimating normals...")
            pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.5, max_nn=30))
            pcd.orient_normals_consistent_tangent_plane(k=15)

        print(f"[Stage 9] Ingested {n_points} normal-oriented points.")

        # 2. Screened Poisson Surface Reconstruction
        print(f"[Stage 9] Running Screened Poisson Reconstruction (octree depth={self.poisson_depth})...")
        mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
            pcd,
            depth=self.poisson_depth,
            scale=1.1,
            linear_fit=False
        )

        raw_vertices = len(mesh.vertices)
        raw_triangles = len(mesh.triangles)
        print(f"[Stage 9] Raw Poisson Mesh generated: {raw_vertices} vertices, {raw_triangles} triangles.")

        # 3. Density-Based Extrapolation Trimming
        densities_arr = np.asarray(densities)
        if self.trim_quantile > 0.0 and len(densities_arr) > 0:
            density_threshold = float(np.quantile(densities_arr, self.trim_quantile))
            vertices_to_remove = densities_arr < density_threshold
            removed_count = int(np.count_nonzero(vertices_to_remove))
            mesh.remove_vertices_by_mask(vertices_to_remove)
            print(f"[Stage 9] Trimmed {removed_count} low-density extrapolation vertices (quantile {self.trim_quantile:.2f}, threshold {density_threshold:.3f}).")
        else:
            density_threshold = 0.0
            removed_count = 0

        # 4. Topological Mesh Cleaning
        mesh.remove_degenerate_triangles()
        mesh.remove_duplicated_triangles()
        mesh.remove_duplicated_vertices()
        mesh.remove_non_manifold_edges()

        clean_vertices = len(mesh.vertices)
        clean_triangles = len(mesh.triangles)
        print(f"[Stage 9] Cleaned Mesh Topology: {clean_vertices} vertices, {clean_triangles} triangles.")

        # 5. Compute Smooth Surface Normals
        mesh.compute_vertex_normals()
        mesh.compute_triangle_normals()

        # 6. KDTree Vertex Color Mapping
        if pcd.has_colors():
            print(f"[Stage 9] Mapping photorealistic vertex colors via KDTree nearest-neighbor...")
            pcd_tree = o3d.geometry.KDTreeFlann(pcd)
            pcd_colors = np.asarray(pcd.colors)
            mesh_verts = np.asarray(mesh.vertices)

            mesh_colors = np.zeros_like(mesh_verts)
            for i, v in enumerate(mesh_verts):
                _, idx, _ = pcd_tree.search_knn_vector_3d(v, 1)
                mesh_colors[i] = pcd_colors[idx[0]]

            mesh.vertex_colors = o3d.utility.Vector3dVector(mesh_colors)
            print(f"[Stage 9] Vertex color transfer complete.")

        # 7. Compute Geometric Properties
        surface_area_m2 = round(float(mesh.get_surface_area()), 2)
        mesh_verts_arr = np.asarray(mesh.vertices)
        bbox_min = [round(float(v), 3) for v in mesh_verts_arr.min(axis=0)]
        bbox_max = [round(float(v), 3) for v in mesh_verts_arr.max(axis=0)]
        bbox_span = [round(float(v), 3) for v in (mesh_verts_arr.max(axis=0) - mesh_verts_arr.min(axis=0))]

        # 8. Export Mesh in Multiple Formats (.ply and .obj)
        ply_out = os.path.join(self.output_dir, "surface_mesh.ply")
        obj_out = os.path.join(self.output_dir, "surface_mesh.obj")

        print(f"[Stage 9] Saving surface mesh to PLY: {ply_out}...")
        o3d.io.write_triangle_mesh(ply_out, mesh, write_ascii=False)

        print(f"[Stage 9] Saving surface mesh to OBJ: {obj_out}...")
        o3d.io.write_triangle_mesh(obj_out, mesh)

        elapsed = time.time() - start_time

        # 9. Compile Manifest
        manifest = {
            "scale_mode": "METRIC_GEOREFERENCED_SCALE",
            "is_metric": True,
            "reconstruction_method": "Screened Poisson Surface Reconstruction",
            "poisson_octree_depth": self.poisson_depth,
            "trim_quantile": self.trim_quantile,
            "density_threshold": round(density_threshold, 4),
            "input_points": n_points,
            "raw_poisson_vertices": raw_vertices,
            "raw_poisson_triangles": raw_triangles,
            "trimmed_vertices_removed": removed_count,
            "final_vertices": clean_vertices,
            "final_triangles": clean_triangles,
            "surface_area_m2": surface_area_m2,
            "metric_spatial_bounds_enu_m": {
                "min": bbox_min,
                "max": bbox_max,
                "span": bbox_span
            },
            "output_files": {
                "mesh_ply": ply_out,
                "mesh_obj": obj_out
            }
        }

        manifest_path = os.path.join(self.output_dir, "mesh_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        stage_result = StageResult(
            stage_number=9,
            stage_name="Surface Reconstruction & Texturing",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "reconstruction_method": "Screened Poisson",
                "poisson_octree_depth": self.poisson_depth,
                "input_points": n_points,
                "final_vertices": clean_vertices,
                "final_triangles": clean_triangles,
                "surface_area_m2": surface_area_m2,
                "has_vertex_colors": mesh.has_vertex_colors(),
                "has_normals": mesh.has_vertex_normals()
            },
            warnings=self.warnings,
            output_files={
                "mesh_manifest": manifest_path,
                "surface_mesh_ply": ply_out,
                "surface_mesh_obj": obj_out
            }
        )

        return manifest, stage_result


def run_stage(
    pointcloud_path: str,
    output_dir: str,
    poisson_depth: int = 9,
    trim_quantile: float = 0.05,
    **kwargs
) -> StageResult:
    engine = MeshGenerationEngine(
        pointcloud_path=pointcloud_path,
        output_dir=output_dir,
        poisson_depth=poisson_depth,
        trim_quantile=trim_quantile
    )
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 9: Surface Reconstruction & Texturing (SIH26158)")
    parser.add_argument("--pointcloud-path", "-p", required=True, help="Stage 8 fused_clean_points.ply")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage9_mesh", help="Output directory")
    parser.add_argument("--poisson-depth", type=int, default=9, help="Poisson reconstruction octree depth")
    parser.add_argument("--trim-quantile", type=float, default=0.05, help="Density quantile to trim extrapolation vertices")
    args = parser.parse_args()

    engine = MeshGenerationEngine(
        pointcloud_path=args.pointcloud_path,
        output_dir=args.output_dir,
        poisson_depth=args.poisson_depth,
        trim_quantile=args.trim_quantile
    )

    manifest, result = engine.run()
    print(f"\n[AstraMesh3D Stage 9 Complete]")
    print(f"Method: {result.metrics['reconstruction_method']} (depth={result.metrics['poisson_octree_depth']})")
    print(f"Final Vertices: {result.metrics['final_vertices']}")
    print(f"Final Triangles: {result.metrics['final_triangles']}")
    print(f"Surface Area: {result.metrics['surface_area_m2']} m²")
    print(f"Vertex Colors: {result.metrics['has_vertex_colors']}")
    print(f"PLY Mesh: {result.output_files['surface_mesh_ply']}")
    print(f"OBJ Mesh: {result.output_files['surface_mesh_obj']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
