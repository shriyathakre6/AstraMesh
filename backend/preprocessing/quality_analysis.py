"""
Frame Preprocessing & Quality Analysis Subsystem
AstraMesh3D SIH26158 Backend
"""

import cv2
import numpy as np
from typing import Dict, Any, List

class QualityAnalysis:
    """Calculates real image metrics (Laplacian blur variance, luminance, contrast)."""
    @staticmethod
    def analyze_frame(frame: np.ndarray) -> Dict[str, Any]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. Laplacian variance (motion blur metric)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = laplacian.var()
        blur_score = min(100, max(10, int(np.sqrt(max(0, variance)) * 5)))

        # 2. Mean luminance and contrast
        mean_lum = float(np.mean(gray))
        contrast = float(np.std(gray))

        # 3. Decision
        status = "selected"
        reason = None
        if blur_score < 45:
            status = "rejected"
            reason = "Motion blur"
        elif mean_lum < 35:
            status = "rejected"
            reason = "Too dark"
        elif mean_lum > 220:
            status = "rejected"
            reason = "Too bright"

        return {
            "blur_score": blur_score,
            "variance": round(variance, 2),
            "brightness": round((mean_lum / 255) * 100, 1),
            "contrast": round((contrast / 128) * 100, 1),
            "status": status,
            "rejection_reason": reason
        }

class DistortionCorrection:
    """Corrects lens distortion using camera intrinsics."""
    @staticmethod
    def undistort(frame: np.ndarray, camera_matrix: np.ndarray, dist_coeffs: np.ndarray) -> np.ndarray:
        h, w = frame.shape[:2]
        new_cam_matrix, roi = cv2.getOptimalNewCameraMatrix(camera_matrix, dist_coeffs, (w, h), 1, (w, h))
        return cv2.undistort(frame, camera_matrix, dist_coeffs, None, new_cam_matrix)
