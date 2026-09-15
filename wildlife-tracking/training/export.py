"""
Model Export Pipeline (TorchScript / ONNX / TFLite)
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "wildlife_yolo.pt"

def export_model(format="onnx"):
    if not MODEL_PATH.exists():
        print(f"[STATUS] {MODEL_PATH} not found. Cannot export.")
        return

    from ultralytics import YOLO
    model = YOLO(str(MODEL_PATH))
    exported = model.export(format=format)
    print(f"[SUCCESS] Exported model to {format.upper()}: {exported}")

if __name__ == "__main__":
    export_model()
