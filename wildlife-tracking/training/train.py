"""
YOLOv8 Fine-Tuning Pipeline for 40 Wildlife Classes
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_YAML = BASE_DIR / "dataset" / "data.yaml"
OUTPUT_MODELS_DIR = BASE_DIR / "models"
OUTPUT_MODELS_DIR.mkdir(exist_ok=True)

def train_yolo(epochs=50, imgsz=640, batch=16, base_model="yolov8n.pt"):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics package not installed. Run: pip install ultralytics")
        return False

    if not DATA_YAML.exists():
        print(f"[ERROR] data.yaml not found at {DATA_YAML}")
        return False

    print("=" * 60)
    print(f"STARTING YOLOV8 FINE-TUNING ON 40 WILDLIFE CLASSES")
    print(f"Data config: {DATA_YAML}")
    print(f"Base architecture: {base_model} | Epochs: {epochs} | ImgSz: {imgsz}")
    print("=" * 60)

    model = YOLO(base_model)
    results = model.train(
        data=str(DATA_YAML),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        project=str(OUTPUT_MODELS_DIR),
        name="wildlife_run",
        save=True
    )
    
    export_path = OUTPUT_MODELS_DIR / "wildlife_yolo.pt"
    best_weights = OUTPUT_MODELS_DIR / "wildlife_run" / "weights" / "best.pt"
    if best_weights.exists():
        import shutil
        shutil.copy(best_weights, export_path)
        print(f"[SUCCESS] Fine-tuned model saved to: {export_path}")
    
    return True

if __name__ == "__main__":
    train_yolo()
