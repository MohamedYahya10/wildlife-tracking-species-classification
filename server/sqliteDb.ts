import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export interface AnimalEntity {
  animal_id: number;
  animal_name: string;
  scientific_name: string;
  class_index: number;
  description: string;
  created_at: string;
}

export interface DetectionEntity {
  detection_id: number;
  animal_id: number | null;
  animal_name: string;
  confidence: number;
  detection_type: 'image' | 'webcam';
  tracking_id: number | null;
  image_path: string | null;
  box_ymin?: number | null;
  box_xmin?: number | null;
  box_ymax?: number | null;
  box_xmax?: number | null;
  detected_at: string;
  scientific_name?: string;
  class_index?: number;
  description?: string;
}

const DB_PATH = path.resolve(process.cwd(), 'wildlife_tracking.db');
let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // Create tables
  db.exec(`
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
  `);

  // Check count
  const countRow = db.prepare('SELECT COUNT(*) as count FROM animals;').get() as { count: number };
  if (!countRow || countRow.count === 0) {
    const seedPath = path.resolve(process.cwd(), 'database', 'seed_animals.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
      console.log('[SQLite] Seeded 40 wildlife classes into wildlife_tracking.db');
    }
  }
}

export function getAllAnimals(): AnimalEntity[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM animals ORDER BY class_index ASC;');
  return stmt.all() as unknown as AnimalEntity[];
}

export function getAnimalById(id: number | string): AnimalEntity | null {
  const db = getDatabase();
  const numId = Number(id);
  const stmt = db.prepare('SELECT * FROM animals WHERE animal_id = ? OR class_index = ?;');
  const row = stmt.get(numId, numId);
  return (row as unknown as AnimalEntity) || null;
}

export function getAnimalByClassIndex(classIndex: number): AnimalEntity | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM animals WHERE class_index = ?;');
  const row = stmt.get(classIndex);
  return (row as unknown as AnimalEntity) || null;
}

export function recordDetection(params: {
  animal_id?: number | null;
  animal_name: string;
  confidence: number;
  detection_type: 'image' | 'webcam';
  tracking_id?: number | null;
  image_path?: string | null;
  bbox?: [number, number, number, number] | null;
}): { detection_id: number; detected_at: string } {
  const db = getDatabase();
  const boxYmin = params.bbox ? params.bbox[0] : null;
  const boxXmin = params.bbox ? params.bbox[1] : null;
  const boxYmax = params.bbox ? params.bbox[2] : null;
  const boxXmax = params.bbox ? params.bbox[3] : null;

  const stmt = db.prepare(`
    INSERT INTO detections (
      animal_id, animal_name, confidence, detection_type, tracking_id, image_path,
      box_ymin, box_xmin, box_ymax, box_xmax
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  const info = stmt.run(
    params.animal_id ?? null,
    params.animal_name,
    params.confidence,
    params.detection_type,
    params.tracking_id ?? null,
    params.image_path ?? null,
    boxYmin,
    boxXmin,
    boxYmax,
    boxXmax
  );

  const newId = Number(info.lastInsertRowid);
  const row = db.prepare('SELECT detected_at FROM detections WHERE detection_id = ?').get(newId) as { detected_at: string };

  return {
    detection_id: newId,
    detected_at: row?.detected_at || new Date().toISOString()
  };
}

export function getAllDetections(limit = 100): DetectionEntity[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT d.*, a.scientific_name, a.class_index, a.description 
    FROM detections d
    LEFT JOIN animals a ON d.animal_id = a.animal_id
    ORDER BY d.detection_id DESC LIMIT ?;
  `);
  return stmt.all(limit) as unknown as DetectionEntity[];
}

export function clearAllDetections(): { success: boolean; deletedCount: number } {
  const db = getDatabase();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM detections;').get() as { count: number };
  db.exec('DELETE FROM detections;');
  return { success: true, deletedCount: countRow?.count || 0 };
}
