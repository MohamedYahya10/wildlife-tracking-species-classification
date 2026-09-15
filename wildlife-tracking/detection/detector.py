"""
Unified Wildlife Detector & Pipeline Selector
Routes dynamically between fine-tuned YOLO (if weights present) and CLIP Zero-Shot Classifier.
"""
import os
from pathlib import Path
from typing import List, Dict, Any
from config.config import EXACT_40_CLASSES, YOLO_WEIGHTS_PATH, CONFIDENCE_THRESHOLD
from detection.classifier import ZeroShotCLIPClassifier
from detection.tracker import get_tracker

class WildlifeDetectionEngine:
    def __init__(self):
        self.yolo_model = None
        self.clip_classifier = ZeroShotCLIPClassifier()
        self.tracker = get_tracker()
        self._check_models()

    def _check_models(self):
        if os.path.exists(YOLO_WEIGHTS_PATH):
            try:
                from ultralytics import YOLO
                self.yolo_model = YOLO(YOLO_WEIGHTS_PATH)
                print(f"[Detector] Loaded fine-tuned YOLO model from {YOLO_WEIGHTS_PATH}")
            except Exception as e:
                print(f"[Detector] Could not load YOLO model: {e}")
        else:
            print(f"[Detector] No custom YOLO model at {YOLO_WEIGHTS_PATH}. Operating on CLIP Zero-Shot Vision path.")

    @property
    def active_model_type(self) -> str:
        return "YOLOv8 Wildlife Detector" if self.yolo_model is not None else "CLIP Zero-Shot Vision"

    def detect(self, image, is_webcam: bool = False, threshold: float = CONFIDENCE_THRESHOLD) -> Dict[str, Any]:
        """
        Runs real model inference on provided image/frame.
        """
        raw_predictions = []

        if self.yolo_model is not None:
            results = self.yolo_model.predict(image, conf=threshold, verbose=False)
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    xyxy = box.xyxy[0].tolist()
                    if 0 <= cls_id < len(EXACT_40_CLASSES):
                        raw_predictions.append({
                            "class_index": cls_id,
                            "animal_name": EXACT_40_CLASSES[cls_id],
                            "confidence": conf,
                            "bbox": xyxy
                        })
        else:
            # CLIP Zero-Shot Path
            raw_predictions = self.clip_classifier.classify_image(image)

        # Update tracker for webcam feeds or localized tracking
        if is_webcam and hasattr(self.tracker, "update"):
            valid_preds = [p for p in raw_predictions if p["confidence"] >= threshold]
            tracked_predictions = self.tracker.update(valid_preds)
            return {
                "model_type": self.active_model_type,
                "predictions": tracked_predictions,
                "unique_count": self.tracker.get_unique_count() if hasattr(self.tracker, "get_unique_count") else len(tracked_predictions)
            }

        return {
            "model_type": self.active_model_type,
            "predictions": raw_predictions,
            "unique_count": len(raw_predictions)
        }
