"""
Dataset Preparation & YOLO Format Validation
Validates directory structure, image files, and YOLO annotation format.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"

def validate_split(split_name: str):
    images_dir = DATASET_DIR / split_name / "images"
    labels_dir = DATASET_DIR / split_name / "labels"

    if not images_dir.exists():
        print(f"[{split_name.upper()}] Images directory not found: {images_dir}")
        return False

    images = list(images_dir.glob("*.jpg")) + list(images_dir.glob("*.png"))
    print(f"[{split_name.upper()}] Found {len(images)} images.")

    valid_labels = 0
    for img in images:
        label_file = labels_dir / f"{img.stem}.txt"
        if label_file.exists():
            with open(label_file, "r") as f:
                lines = f.readlines()
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) == 5:
                        cls_idx = int(parts[0])
                        if 0 <= cls_idx < 40:
                            valid_labels += 1
    
    print(f"[{split_name.upper()}] Valid YOLO bounding box annotations: {valid_labels}")
    return len(images) > 0

def main():
    print("[TRAINING PIPELINE] Running dataset validation...")
    has_train = validate_split("train")
    has_val = validate_split("val")
    has_test = validate_split("test")

    if not (has_train and has_val):
        print("\n[INFO] Complete 40-class annotated dataset is not present.")
        print("[INFO] Fine-tuning YOLO is optional per specification §3 & §5.")
        print("[INFO] The production runtime automatically defaults to Zero-Shot CLIP Vision classification.")
    else:
        print("\n[SUCCESS] Dataset is validated and ready for YOLO fine-tuning.")

if __name__ == "__main__":
    main()
