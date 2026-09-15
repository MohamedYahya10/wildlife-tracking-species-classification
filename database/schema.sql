-- Wildlife Tracking and Species Classification via Camera Traps
-- Database Schema for MySQL & SQLite (compatible with both)

CREATE TABLE IF NOT EXISTS animals (
  animal_id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(150),
  class_index INTEGER NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detections (
  detection_id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id INTEGER,
  animal_name VARCHAR(100),
  confidence FLOAT,
  detection_type VARCHAR(20), -- 'image' or 'webcam'
  tracking_id INTEGER NULL,
  image_path VARCHAR(255),
  box_ymin FLOAT NULL,
  box_xmin FLOAT NULL,
  box_ymax FLOAT NULL,
  box_xmax FLOAT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
);
