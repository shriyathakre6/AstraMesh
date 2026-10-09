"""
COLMAP Structure-from-Motion Engine Wrapper
AstraMesh3D SIH26158 Photogrammetry Subsystem
"""

import os
import shutil
import subprocess
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("AstraMesh3D.ColmapEngine")

class ColmapEngine:
    def __init__(self, colmap_bin: Optional[str] = None):
        candidate = colmap_bin or shutil.which("colmap")
        if not candidate:
            potential_paths = [
                os.path.expanduser(r"~\Downloads\colmap-x64-windows-nocuda\bin\colmap.exe"),
                r"C:\Program Files\COLMAP\bin\colmap.exe",
                r"C:\Program Files\COLMAP\colmap.exe",
                r"C:\tools\colmap\colmap.exe",
            ]
            for p in potential_paths:
                if os.path.isfile(p):
                    candidate = p
                    break
        self.colmap_bin = candidate or "colmap"
        self.is_available = shutil.which(self.colmap_bin) is not None or os.path.isfile(self.colmap_bin)

    def check_environment(self) -> Dict[str, Any]:
        """Detects if COLMAP and CUDA are available on the operating system."""
        colmap_path = shutil.which(self.colmap_bin) or (self.colmap_bin if os.path.isfile(self.colmap_bin) else None)
        cuda_available = False
        version_str = "Unavailable"

        if colmap_path:
            try:
                out = subprocess.check_output([colmap_path, "-h"], text=True, stderr=subprocess.STDOUT)
                version_str = "COLMAP Detected"
                cuda_available = "CUDA" in out
                for line in out.splitlines():
                    if "COLMAP" in line and ("Commit" in line or "Version" in line or "Release" in line):
                        version_str = line.strip()
                        break
            except Exception as e:
                version_str = f"Execution error: {str(e)}"

        return {
            "colmap_installed": colmap_path is not None,
            "colmap_path": colmap_path,
            "colmap_version": version_str,
            "cuda_enabled": cuda_available,
            "recommendation": "Install COLMAP binary from https://demuc.de/colmap/ and add to PATH" if not colmap_path else "Ready"
        }

    def run_feature_extraction(self, database_path: str, image_dir: str) -> bool:
        """Runs COLMAP feature_extractor."""
        if not self.is_available:
            logger.warning("COLMAP executable not found. Running in simulation mode.")
            return False

        cmd = [
            self.colmap_bin, "feature_extractor",
            "--database_path", database_path,
            "--image_path", image_dir,
            "--ImageReader.camera_model", "OPENCV",
            "--ImageReader.single_camera", "1"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0

    def run_matcher(self, database_path: str) -> bool:
        """Runs COLMAP sequential_matcher (ideal for continuous single-pass drone video)."""
        if not self.is_available:
            return False

        cmd = [
            self.colmap_bin, "sequential_matcher",
            "--database_path", database_path,
            "--SequentialMatching.overlap", "10",
            "--SequentialMatching.quadratic_overlap", "1"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0

    def run_mapper(self, database_path: str, image_dir: str, output_dir: str) -> bool:
        """Runs COLMAP incremental Structure-from-Motion mapper."""
        if not self.is_available:
            return False

        os.makedirs(output_dir, exist_ok=True)
        cmd = [
            self.colmap_bin, "mapper",
            "--database_path", database_path,
            "--image_path", image_dir,
            "--output_path", output_dir
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0
