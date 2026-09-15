"""
Model Validation Pipeline (Reports per-class mAP)
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "wildlife_yolo.pt"
DATA_YAML = BASE_DIR / "dataset" / "data.yaml"

def validate_model():
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics package required.")
        return

    if not MODEL_PATH.exists():
        print(f"[STATUS] No fine-tuned YOLO model found at {MODEL_PATH}.")
        print("[STATUS] Production engine is running on Zero-Shot CLIP Vision classifier.")
        return

    model = YOLO(str(MODEL_PATH))
    metrics = model.val(data=str(DATA_YAML))
    print(f"Validation mAP50-95: {metrics.box.map}")
    print(f"Validation mAP50: {metrics.box.map50}")

if __name__ == "__main__":
    validate_model()
