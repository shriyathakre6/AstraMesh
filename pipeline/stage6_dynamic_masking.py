"""
AstraMesh3D - Stage 6: Dynamic Object Masking
SIH Problem Statement SIH26158
Detects dynamic and transient scene elements (vehicles, pedestrians, dynamic road users, animals)
using a lightweight YOLOv8n ONNX model on CPU, generates morphological dilated binary exclusion masks
(.png) and diagnostic previews to prevent moving objects from corrupting SfM matching and depth back-projection.
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

import cv2
import numpy as np
import onnxruntime as ort
import requests

# Standard COCO 80 class labels
COCO_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
    "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
    "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
    "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
    "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
    "hair drier", "toothbrush"
]

# Indices of classes considered dynamic in aerial / ground UAV photogrammetry
DYNAMIC_CLASS_IDS = {
    0,   # person
    1,   # bicycle
    2,   # car
    3,   # motorcycle
    4,   # airplane
    5,   # bus
    6,   # train
    7,   # truck
    8,   # boat
    14,  # bird
    15,  # cat
    16,  # dog
    17,  # horse
    18,  # sheep
    19,  # cow
    20,  # elephant
    21,  # bear
    22,  # zebra
    23   # giraffe
}

DEFAULT_MODEL_URL = "https://huggingface.co/Kalray/yolov8/resolve/main/yolov8n.onnx"


class DynamicMaskingEngine:
    def __init__(
        self,
        frames_dir: str,
        output_dir: str,
        model_path: Optional[str] = None,
        conf_thresh: float = 0.25,
        nms_thresh: float = 0.45,
        dilate_px: int = 20,
        max_frames: Optional[int] = None
    ):
        self.frames_dir = os.path.abspath(frames_dir)
        self.output_dir = os.path.abspath(output_dir)
        self.model_path = os.path.abspath(model_path) if model_path else os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "models", "yolov8n.onnx"
        )
        self.conf_thresh = conf_thresh
        self.nms_thresh = nms_thresh
        self.dilate_px = dilate_px
        self.max_frames = max_frames
        self.warnings: List[str] = []

    def ensure_model(self) -> str:
        """Ensures the YOLOv8n ONNX model exists locally."""
        if os.path.exists(self.model_path) and os.path.getsize(self.model_path) > 1000000:
            return self.model_path

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        print(f"[Stage 6] Downloading YOLOv8n ONNX model to {self.model_path}...")
        with requests.get(DEFAULT_MODEL_URL, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(self.model_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
        print(f"[Stage 6] Downloaded {os.path.getsize(self.model_path)} bytes.")
        return self.model_path

    def run(self) -> Tuple[Dict[str, Any], StageResult]:
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)
        masks_dir = os.path.join(self.output_dir, "masks")
        previews_dir = os.path.join(self.output_dir, "previews")
        os.makedirs(masks_dir, exist_ok=True)
        os.makedirs(previews_dir, exist_ok=True)

        model_path = self.ensure_model()
        print(f"[Stage 6] Initializing YOLOv8n ONNX inference session on CPU...")
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = min(8, os.cpu_count() or 4)
        session = ort.InferenceSession(model_path, sess_options, providers=["CPUExecutionProvider"])

        # Discover input frames
        valid_exts = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
        frame_files = sorted([
            f for f in os.listdir(self.frames_dir)
            if os.path.splitext(f.lower())[1] in valid_exts
        ])

        if not frame_files:
            raise FileNotFoundError(f"No image frames found in {self.frames_dir}")

        if self.max_frames and self.max_frames < len(frame_files):
            step = len(frame_files) / self.max_frames
            selected_indices = [int(i * step) for i in range(self.max_frames)]
            frame_files = [frame_files[i] for i in selected_indices]

        total_frames = len(frame_files)
        print(f"[Stage 6] Processing {total_frames} frames for dynamic object masking...")

        frame_results: List[Dict[str, Any]] = []
        class_histogram: Dict[str, int] = {}
        frames_with_dynamic = 0
        total_dynamic_detected = 0
        masked_area_percentages: List[float] = []

        # Elliptical dilation kernel
        dilation_kernel = None
        if self.dilate_px > 0:
            ksize = 2 * self.dilate_px + 1
            dilation_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))

        for idx, filename in enumerate(frame_files):
            frame_path = os.path.join(self.frames_dir, filename)
            frame_stem = os.path.splitext(filename)[0]
            img = cv2.imread(frame_path)
            if img is None:
                self.warnings.append(f"Could not read frame: {filename}")
                continue

            orig_h, orig_w = img.shape[:2]

            # 1. Letterbox resize to 640x640
            scale = min(640.0 / orig_h, 640.0 / orig_w)
            nw = int(round(orig_w * scale))
            nh = int(round(orig_h * scale))
            dw = (640.0 - nw) / 2.0
            dh = (640.0 - nh) / 2.0

            resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)
            top = int(round(dh - 0.1))
            bottom = int(round(dh + 0.1))
            left = int(round(dw - 0.1))
            right = int(round(dw + 0.1))
            padded = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))

            # 2. Preprocess blob
            blob = padded[:, :, ::-1].transpose(2, 0, 1).astype(np.float32) / 255.0
            blob = np.expand_dims(blob, axis=0)

            # 3. ONNX Inference
            pred = session.run(None, {"images": blob})[0][0]  # Shape: [84, 8400]
            pred = pred.T  # Shape: [8400, 84]

            # 4. Filter predictions
            boxes_raw = pred[:, :4]
            scores_raw = pred[:, 4:]
            class_ids = np.argmax(scores_raw, axis=1)
            confidences = np.max(scores_raw, axis=1)

            conf_mask = confidences >= self.conf_thresh
            boxes_filtered = boxes_raw[conf_mask]
            confidences_filtered = confidences[conf_mask]
            class_ids_filtered = class_ids[conf_mask]

            # Convert to [x1, y1, w, h] in original image coordinates
            candidate_boxes: List[List[int]] = []
            candidate_confs: List[float] = []
            candidate_cids: List[int] = []

            for b, conf, cid in zip(boxes_filtered, confidences_filtered, class_ids_filtered):
                if int(cid) not in DYNAMIC_CLASS_IDS:
                    continue  # Only consider dynamic classes

                xc, yc, bw, bh = b
                x1 = int(round((xc - bw / 2.0 - dw) / scale))
                y1 = int(round((yc - bh / 2.0 - dh) / scale))
                box_w = int(round(bw / scale))
                box_h = int(round(bh / scale))

                # Clip bounds
                x1 = max(0, min(orig_w - 1, x1))
                y1 = max(0, min(orig_h - 1, y1))
                box_w = max(1, min(orig_w - x1, box_w))
                box_h = max(1, min(orig_h - y1, box_h))

                candidate_boxes.append([x1, y1, box_w, box_h])
                candidate_confs.append(float(conf))
                candidate_cids.append(int(cid))

            # 5. Non-Maximum Suppression
            final_detections: List[Dict[str, Any]] = []
            binary_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)

            if candidate_boxes:
                indices = cv2.dnn.NMSBoxes(candidate_boxes, candidate_confs, self.conf_thresh, self.nms_thresh)
                if len(indices) > 0:
                    indices = np.array(indices).flatten()
                    for i in indices:
                        x1, y1, bw, bh = candidate_boxes[i]
                        x2 = min(orig_w, x1 + bw)
                        y2 = min(orig_h, y1 + bh)
                        cid = candidate_cids[i]
                        conf = candidate_confs[i]
                        cname = COCO_CLASSES[cid] if cid < len(COCO_CLASSES) else f"class_{cid}"

                        # Mark box in binary mask
                        binary_mask[y1:y2, x1:x2] = 255

                        final_detections.append({
                            "class_id": cid,
                            "class_name": cname,
                            "confidence": round(conf, 4),
                            "bbox": [x1, y1, bw, bh]
                        })

                        class_histogram[cname] = class_histogram.get(cname, 0) + 1

            # 6. Morphological Dilation to enclose boundary shadows & motion blur
            if dilation_kernel is not None and len(final_detections) > 0:
                binary_mask = cv2.dilate(binary_mask, dilation_kernel, iterations=1)

            # Mask metrics
            masked_pixels = int(np.count_nonzero(binary_mask))
            total_pixels = orig_h * orig_w
            masked_pct = round((masked_pixels / total_pixels) * 100.0, 4)
            masked_area_percentages.append(masked_pct)

            if len(final_detections) > 0:
                frames_with_dynamic += 1
                total_dynamic_detected += len(final_detections)

            # 7. Export binary mask
            mask_filename = f"mask_{frame_stem}.png"
            mask_path = os.path.join(masks_dir, mask_filename)
            cv2.imwrite(mask_path, binary_mask)

            # 8. Export diagnostic visualizer preview
            preview_filename = f"preview_{frame_stem}.jpg"
            preview_path = os.path.join(previews_dir, preview_filename)
            preview_img = img.copy()

            if masked_pixels > 0:
                # Semi-transparent red highlight over dynamic areas
                red_tint = np.full_like(img, (0, 0, 220), dtype=np.uint8)
                mask_bool = binary_mask == 255
                preview_img[mask_bool] = cv2.addWeighted(
                    img[mask_bool], 0.45, red_tint[mask_bool], 0.55, 0
                )

            # Draw bounding boxes and text labels
            for det in final_detections:
                x1, y1, bw, bh = det["bbox"]
                x2 = x1 + bw
                y2 = y1 + bh
                cv2.rectangle(preview_img, (x1, y1), (x2, y2), (0, 255, 255), 2)
                label = f"{det['class_name']} {det['confidence']:.2f}"
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
                cv2.rectangle(preview_img, (x1, max(0, y1 - th - 6)), (x1 + tw + 4, y1), (0, 255, 255), -1)
                cv2.putText(preview_img, label, (x1 + 2, max(12, y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA)

            # Header info overlay
            cv2.putText(preview_img, f"Dynamic Masking: {len(final_detections)} objects, {masked_pct:.2f}% area masked",
                        (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            cv2.imwrite(preview_path, preview_img, [cv2.IMWRITE_JPEG_QUALITY, 90])

            frame_results.append({
                "frame_name": filename,
                "mask_file": mask_filename,
                "preview_file": preview_filename,
                "dynamic_objects_count": len(final_detections),
                "masked_pixel_percent": masked_pct,
                "detections": final_detections
            })

            if (idx + 1) % 10 == 0 or (idx + 1) == total_frames:
                print(f"[Stage 6] Completed {idx + 1}/{total_frames} frames ({total_dynamic_detected} dynamic objects found so far)")

        elapsed = time.time() - start_time
        mean_masked_pct = round(float(np.mean(masked_area_percentages)), 4) if masked_area_percentages else 0.0
        max_masked_pct = round(float(np.max(masked_area_percentages)), 4) if masked_area_percentages else 0.0

        manifest = {
            "model_name": "YOLOv8n (ONNX)",
            "execution_provider": "CPUExecutionProvider",
            "confidence_threshold": self.conf_thresh,
            "nms_threshold": self.nms_thresh,
            "dilation_pixels": self.dilate_px,
            "total_frames_evaluated": total_frames,
            "frames_with_dynamic_objects": frames_with_dynamic,
            "total_dynamic_objects_detected": total_dynamic_detected,
            "detected_classes_histogram": class_histogram,
            "mean_masked_area_percent": mean_masked_pct,
            "max_masked_area_percent": max_masked_pct,
            "output_directories": {
                "masks_dir": masks_dir,
                "previews_dir": previews_dir
            },
            "frames": frame_results
        }

        manifest_path = os.path.join(self.output_dir, "mask_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        stage_result = StageResult(
            stage_number=6,
            stage_name="Dynamic Object Masking",
            success=True,
            execution_time_sec=round(elapsed, 4),
            metrics={
                "model_name": "YOLOv8n (ONNX)",
                "execution_provider": "CPUExecutionProvider",
                "total_frames_evaluated": total_frames,
                "frames_with_dynamic_objects": frames_with_dynamic,
                "total_dynamic_objects_detected": total_dynamic_detected,
                "detected_classes_histogram": class_histogram,
                "mean_masked_area_percent": mean_masked_pct,
                "max_masked_area_percent": max_masked_pct,
                "dilation_pixels": self.dilate_px
            },
            warnings=self.warnings,
            output_files={
                "mask_manifest": manifest_path,
                "masks_dir": masks_dir,
                "previews_dir": previews_dir
            }
        )

        return manifest, stage_result


def run_stage(frames_dir: str, output_dir: str, **kwargs) -> StageResult:
    engine = DynamicMaskingEngine(frames_dir=frames_dir, output_dir=output_dir, **kwargs)
    _, result = engine.run()
    return result


def main():
    parser = argparse.ArgumentParser(description="AstraMesh3D Stage 6: Dynamic Object Masking (SIH26158)")
    parser.add_argument("--frames-dir", "-f", required=True, help="Path to directory containing input frames")
    parser.add_argument("--output-dir", "-o", default="sample_data/stage6_masks", help="Output directory for masks and manifest")
    parser.add_argument("--model-path", "-m", default=None, help="Optional path to custom YOLOv8n ONNX model")
    parser.add_argument("--conf-thresh", type=float, default=0.25, help="Confidence threshold for object detection")
    parser.add_argument("--nms-thresh", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--dilate-px", type=int, default=20, help="Dilation pixels for shadow & edge padding")
    parser.add_argument("--max-frames", type=int, default=None, help="Optional limit on number of frames to process")
    args = parser.parse_args()

    engine = DynamicMaskingEngine(
        frames_dir=args.frames_dir,
        output_dir=args.output_dir,
        model_path=args.model_path,
        conf_thresh=args.conf_thresh,
        nms_thresh=args.nms_thresh,
        dilate_px=args.dilate_px,
        max_frames=args.max_frames
    )

    manifest, result = engine.run()
    print(f"\n[AstraMesh3D Stage 6 Complete]")
    print(f"Frames evaluated: {result.metrics['total_frames_evaluated']}")
    print(f"Frames with dynamic objects: {result.metrics['frames_with_dynamic_objects']}")
    print(f"Total dynamic objects detected: {result.metrics['total_dynamic_objects_detected']}")
    print(f"Classes detected: {result.metrics['detected_classes_histogram']}")
    print(f"Mean masked area: {result.metrics['mean_masked_area_percent']}%")
    print(f"Manifest written to: {result.output_files['mask_manifest']}")
    print(f"Time: {result.execution_time_sec}s")


if __name__ == "__main__":
    main()
