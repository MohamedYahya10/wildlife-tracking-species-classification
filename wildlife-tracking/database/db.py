import os
import sqlite3
from typing import List, Dict, Any, Optional

try:
    import mysql.connector
except ImportError:
    mysql = None

DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()
DB_FILE = os.getenv("DB_FILE", "wildlife_tracking.db")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "wildlife_tracking")

def get_connection():
    if DB_ENGINE == "mysql" and mysql is not None:
        try:
            return mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME
            )
        except Exception as e:
            print(f"[Database] MySQL connection failed ({e}), falling back to SQLite: {DB_FILE}")
    
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS animals (
        animal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_name VARCHAR(100) NOT NULL,
        scientific_name VARCHAR(150),
        class_index INTEGER NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
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
    """)
    conn.commit()

    # Check if animals are seeded
    cursor.execute("SELECT COUNT(*) as count FROM animals;")
    row = cursor.fetchone()
    count = row[0] if isinstance(row, tuple) else row['count']
    
    if count == 0:
        seed_path = os.path.join(os.path.dirname(__file__), "seed_animals.sql")
        if os.path.exists(seed_path):
            with open(seed_path, "r", encoding="utf-8") as f:
                cursor.executescript(f.read())
            conn.commit()
            print("[Database] Seeded 40 wildlife classes successfully.")
    
    conn.close()

def get_all_animals() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM animals ORDER BY class_index ASC;")
    rows = cursor.fetchall()
    animals = [dict(row) for row in rows]
    conn.close()
    return animals

def get_animal_by_id(animal_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM animals WHERE animal_id = ? OR class_index = ?;", (animal_id, animal_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_animal_by_class_index(class_index: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM animals WHERE class_index = ?;", (class_index,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def record_detection(
    animal_id: Optional[int],
    animal_name: str,
    confidence: float,
    detection_type: str,
    tracking_id: Optional[int] = None,
    image_path: Optional[str] = None,
    bbox: Optional[List[float]] = None
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    box_ymin = bbox[0] if bbox and len(bbox) > 0 else None
    box_xmin = bbox[1] if bbox and len(bbox) > 1 else None
    box_ymax = bbox[2] if bbox and len(bbox) > 2 else None
    box_xmax = bbox[3] if bbox and len(bbox) > 3 else None

    cursor.execute("""
    INSERT INTO detections (animal_id, animal_name, confidence, detection_type, tracking_id, image_path, box_ymin, box_xmin, box_ymax, box_xmax)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (animal_id, animal_name, confidence, detection_type, tracking_id, image_path, box_ymin, box_xmin, box_ymax, box_xmax))
    
    detection_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return detection_id

def get_all_detections(limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT d.*, a.scientific_name, a.class_index, a.description 
    FROM detections d
    LEFT JOIN animals a ON d.animal_id = a.animal_id
    ORDER BY d.detection_id DESC LIMIT ?;
    """, (limit,))
    rows = cursor.fetchall()
    detections = [dict(row) for row in rows]
    conn.close()
    return detections
