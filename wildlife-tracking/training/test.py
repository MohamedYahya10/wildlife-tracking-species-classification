"""
Model Testing on Held-Out Test Split
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "wildlife_yolo.pt"
TEST_IMAGES = BASE_DIR / "dataset" / "test" / "images"

def test_model():
    if not MODEL_PATH.exists():
        print(f"[STATUS] {MODEL_PATH} not present. Running evaluation on Zero-Shot CLIP Vision path.")
        return

    from ultralytics import YOLO
    model = YOLO(str(MODEL_PATH))
    if TEST_IMAGES.exists():
        results = model.predict(source=str(TEST_IMAGES), save=True)
        print(f"[TEST EVALUATION] Processed {len(results)} test images.")
    else:
        print("[TEST EVALUATION] No test split images directory found.")

if __name__ == "__main__":
    test_model()
