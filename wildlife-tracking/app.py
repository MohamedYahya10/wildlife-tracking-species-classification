"""
Wildlife Tracking and Species Classification via Camera Traps
FastAPI Application implementing all 5 API endpoints and dual model pipeline.
"""
import os
import io
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from PIL import Image

from config.config import CONFIDENCE_THRESHOLD, EXACT_40_CLASSES
from database.db import (
    init_db,
    get_all_animals,
    get_animal_by_id,
    get_animal_by_class_index,
    record_detection,
    get_all_detections
)
from detection.detector import WildlifeDetectionEngine

app = FastAPI(
    title="Wildlife Tracking and Species Classification via Camera Traps",
    description="Zero-Shot CLIP classification and YOLOv8 tracking for 40 wildlife classes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and model engine
init_db()
engine = WildlifeDetectionEngine()

@app.get("/api/animals")
def api_get_animals():
    animals = get_all_animals()
    return {"success": True, "count": len(animals), "animals": animals}

@app.get("/api/animal/{animal_id}")
def api_get_animal(animal_id: int):
    animal = get_animal_by_id(animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return {"success": True, "animal": animal}

@app.get("/api/detections")
def api_get_detections(limit: int = 100):
    detections = get_all_detections(limit=limit)
    return {"success": True, "count": len(detections), "detections": detections}

@app.post("/api/detect/image")
async def api_detect_image(
    file: UploadFile = File(...),
    threshold: float = Form(CONFIDENCE_THRESHOLD)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image format (JPG/JPEG/PNG/WebP required).")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    result = engine.detect(image, is_webcam=False, threshold=threshold)
    predictions = result.get("predictions", [])

    if not predictions:
        return {
            "success": True,
            "has_detection": False,
            "status": "no_detection",
            "message": "No supported animal detected.",
            "count": 0,
            "detections": []
        }

    valid_predictions = [p for p in predictions if p["confidence"] >= threshold]
    
    formatted_detections = []
    for pred in predictions:
        animal_info = get_animal_by_class_index(pred["class_index"])
        is_valid = pred["confidence"] >= threshold
        det_id = None
        if is_valid:
            det_id = record_detection(
                animal_id=animal_info["animal_id"] if animal_info else None,
                animal_name=pred["animal_name"],
                confidence=pred["confidence"],
                detection_type="image",
                tracking_id=None,
                image_path=file.filename,
                bbox=pred.get("bbox")
            )
        
        formatted_detections.append({
            "detection_id": det_id,
            "animal_id": animal_info["animal_id"] if animal_info else None,
            "animal_name": pred["animal_name"],
            "scientific_name": animal_info["scientific_name"] if animal_info else "",
            "class_index": pred["class_index"],
            "description": animal_info["description"] if animal_info else "",
            "confidence": pred["confidence"],
            "confidence_display": f"{pred['confidence'] * 100:.1f}%",
            "bbox": pred.get("bbox")
        })

    if not valid_predictions:
        return {
            "success": True,
            "has_detection": True,
            "status": "low_confidence",
            "message": "Animal detected, but species could not be identified with sufficient confidence.",
            "count": 0,
            "detections": formatted_detections
        }

    return {
        "success": True,
        "has_detection": True,
        "status": "identified",
        "message": f"Successfully classified {len(valid_predictions)} wildlife specimen(s)",
        "count": len(valid_predictions),
        "model_type": result.get("model_type"),
        "detections": formatted_detections
    }

@app.post("/api/detect/webcam")
async def api_detect_webcam(
    file: UploadFile = File(...),
    threshold: float = Form(CONFIDENCE_THRESHOLD)
):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    result = engine.detect(image, is_webcam=True, threshold=threshold)
    predictions = result.get("predictions", [])

    if not predictions:
        return {
            "success": True,
            "has_detection": False,
            "status": "no_detection",
            "message": "No supported animal detected.",
            "count": 0,
            "unique_count": result.get("unique_count", 0),
            "detections": []
        }

    formatted = []
    for pred in predictions:
        animal_info = get_animal_by_class_index(pred["class_index"])
        det_id = record_detection(
            animal_id=animal_info["animal_id"] if animal_info else None,
            animal_name=pred["animal_name"],
            confidence=pred["confidence"],
            detection_type="webcam",
            tracking_id=pred.get("tracking_id"),
            image_path="webcam_stream",
            bbox=pred.get("bbox")
        )
        formatted.append({
            "detection_id": det_id,
            "animal_id": animal_info["animal_id"] if animal_info else None,
            "animal_name": pred["animal_name"],
            "scientific_name": animal_info["scientific_name"] if animal_info else "",
            "class_index": pred["class_index"],
            "description": animal_info["description"] if animal_info else "",
            "confidence": pred["confidence"],
            "confidence_display": f"{pred['confidence'] * 100:.1f}%",
            "tracking_id": pred.get("tracking_id"),
            "bbox": pred.get("bbox")
        })

    return {
        "success": True,
        "has_detection": True,
        "status": "identified",
        "count": len(formatted),
        "unique_count": result.get("unique_count", len(formatted)),
        "model_type": result.get("model_type"),
        "detections": formatted
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.py:app", host="0.0.0.0", port=8000, reload=True)
