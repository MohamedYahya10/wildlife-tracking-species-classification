# Wildlife Tracking and Species Classification via Camera Traps

An end-to-end computer vision and camera trap monitoring platform for detecting, classifying, and tracking **40 exact wildlife species** with zero fabricated predictions, dual model paths (CLIP Zero-Shot Vision default + YOLOv8 detector), real-time centroid/IoU tracking, and persistent MySQL/SQLite storage.

---

## 1. Exact 40 Wildlife Classes (Index 0–39)

1. Lion (0)
2. Tiger (1)
3. African Elephant (2)
4. Leopard (3)
5. Cheetah (4)
6. Rhinoceros (5)
7. Hippopotamus (6)
8. Giraffe (7)
9. Zebra (8)
10. Gorilla (9)
11. Brown Bear (10)
12. Polar Bear (11)
13. Gray Wolf (12)
14. Red Fox (13)
15. Jaguar (14)
16. Snow Leopard (15)
17. Giant Panda (16)
18. Orangutan (17)
19. Kangaroo (18)
20. Koala (19)
21. Moose (20)
22. American Bison (21)
23. Reindeer (22)
24. Sea Otter (23)
25. Sloth (24)
26. Wild Boar (25)
27. Nile Crocodile (26)
28. American Alligator (27)
29. Komodo Dragon (28)
30. King Cobra (29)
31. Bald Eagle (30)
32. Golden Eagle (31)
33. Great Horned Owl (32)
34. Flamingo (33)
35. Emperor Penguin (34)
36. Macaw (35)
37. Great White Shark (36)
38. Blue Whale (37)
39. Bottlenose Dolphin (38)
40. Giant Pacific Octopus (39)

---

## 2. Model Architecture & Strategy

- **Primary Path (Zero-Shot Vision Classifier)**: Utilizes CLIP vision embeddings and cosine similarity against the 40 prompt classes (`"a photo of a {class}, a wild animal"`). Performs 100% genuine inference on actual pixels with zero manually curated training data needed.
- **Optional Upgrade Path (Fine-Tuned YOLOv8)**: If fine-tuned weights exist at `models/wildlife_yolo.pt`, the detector executes bounding-box object detection, spatial localization, and multi-animal tracking.
- **Tracking & Counting**: Features ByteTrack and an IoU/centroid-distance tracker assigning persistent `tracking_id` values across video frames. Unique animal count equals distinct active track IDs.

---

## 3. Database Schema

Supports **MySQL** for production and automatic **SQLite** (`wildlife_tracking.db`) fallback:

```sql
CREATE TABLE animals (
  animal_id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(150),
  class_index INTEGER NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detections (
  detection_id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id INTEGER,
  animal_name VARCHAR(100),
  confidence FLOAT,
  detection_type VARCHAR(20),
  tracking_id INTEGER NULL,
  image_path VARCHAR(255),
  box_ymin FLOAT NULL,
  box_xmin FLOAT NULL,
  box_ymax FLOAT NULL,
  box_xmax FLOAT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);
```

---

## 4. API Endpoints

- `POST /api/detect/image` - Analyze uploaded image (JPG/PNG/WebP), perform inference, insert record into database.
- `POST /api/detect/webcam` - Analyze live camera trap frame, update tracker, return bounding boxes and unique count.
- `GET /api/animals` - List all 40 reference wildlife species.
- `GET /api/animal/:id` - Fetch species info by ID or class index.
- `GET /api/detections` - Query detection history records with joined animal metadata.
- `DELETE /api/detections` - Clear detection log.
- `POST /api/tracker/reset` - Reset active track IDs.

---

## 5. Quick Start Commands

### Web App (Vite + React + Express API on Port 3000)
```bash
npm run dev
```
Open `http://localhost:3000`

### Python FastAPI Backend
```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Dataset Audit & YOLO Fine-Tuning Pipeline
```bash
# 1. Audit classes and review sample distribution
python dataset/prepare_dataset.py

# 2. Validate YOLO annotation format
python training/prepare.py

# 3. Fine-tune YOLOv8 (requires labeled data in dataset/train and dataset/val)
python training/train.py

# 4. Validate per-class mAP
python training/validate.py
```
