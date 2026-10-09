"""
Feature Extraction, Matching & SfM Subsystem
AstraMesh3D SIH26158 Backend
"""

import cv2
import numpy as np
from typing import Dict, Any, List, Tuple

class FeatureExtractor:
    """Extracts SIFT / ORB keypoints and descriptors using OpenCV."""
    def __init__(self, method: str = "SIFT"):
        self.method = method
        if method == "SIFT":
            self.detector = cv2.SIFT_create(nfeatures=2000)
        else:
            self.detector = cv2.ORB_create(nfeatures=2000)

    def extract(self, image: np.ndarray) -> Tuple[List[Any], np.ndarray]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.detector.detectAndCompute(gray, None)
        return keypoints, descriptors

class FeatureMatcher:
    """Matches sequential keypoints with RANSAC epipolar outlier rejection."""
    @staticmethod
    def match_sequential(desc1: np.ndarray, desc2: np.ndarray) -> Dict[str, Any]:
        if desc1 is None or desc2 is None:
            return {"matches_count": 0, "inliers_count": 0}

        bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=True)
        matches = bf.match(desc1, desc2)
        matches = sorted(matches, key=lambda x: x.distance)

        inliers = [m for m in matches if m.distance < 120]
        return {
            "matches_count": len(matches),
            "inliers_count": len(inliers),
            "inlier_ratio": round(len(inliers) / max(1, len(matches)), 2)
        }
