"""
Wildlife Tracking and Species Classification via Camera Traps Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration (supports MySQL with SQLite fallback)
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()
DB_FILE = os.getenv("DB_FILE", str(BASE_DIR / "wildlife_tracking.db"))
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "wildlife_tracking")

# Model configuration
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.50"))
MODEL_STRATEGY = os.getenv("MODEL_STRATEGY", "auto") # 'auto', 'clip_zeroshot', or 'yolo_finetune'
YOLO_WEIGHTS_PATH = os.getenv("YOLO_WEIGHTS_PATH", str(BASE_DIR / "models" / "wildlife_yolo.pt"))
CLIP_MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B/32")

# Directories
UPLOADS_DIR = BASE_DIR / "uploads"
RESULTS_DIR = BASE_DIR / "results"
UPLOADS_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# EXACT 40 WILDLIFE CLASSES (Fixed order 0-39)
EXACT_40_CLASSES = [
    "Lion", "Tiger", "African Elephant", "Leopard", "Cheetah", "Rhinoceros",
    "Hippopotamus", "Giraffe", "Zebra", "Gorilla", "Brown Bear", "Polar Bear",
    "Gray Wolf", "Red Fox", "Jaguar", "Snow Leopard", "Giant Panda",
    "Orangutan", "Kangaroo", "Koala", "Moose", "American Bison",
    "Reindeer", "Sea Otter", "Sloth", "Wild Boar", "Nile Crocodile",
    "American Alligator", "Komodo Dragon", "King Cobra", "Bald Eagle",
    "Golden Eagle", "Great Horned Owl", "Flamingo", "Emperor Penguin",
    "Macaw", "Great White Shark", "Blue Whale", "Bottlenose Dolphin",
    "Giant Pacific Octopus"
]
