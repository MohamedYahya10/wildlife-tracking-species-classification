import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../data/detections_db.json');

// Ensure database directory and file exist
function ensureDbFile() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialRecords = [
      {
        id: 'rec-tiger-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
        isoDate: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        speciesId: 'tiger',
        commonName: 'Royal Bengal Tiger',
        scientificName: 'Panthera tigris tigris',
        livingCategory: 'Warm-Blooded Endothermic Carnivora',
        modelPredictionAccuracy: 0.994,
        confidenceDisplay: '99.4%',
        movingVelocity: '4.8 m/s (Prowling Stride)',
        movingDirection: 'East-North-East (Heading 068°)',
        pirDeltaEnergy: '88% Motion Spike',
        thermalReading: '38.4°C (Living Endotherm)',
        sensorStationId: 'station-tiger-ranthambore',
        sensorStationName: 'Sector 04 - Ranthambore Waterhole Trap',
        imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80',
        realDataset: {
          populationCount: '~5,574 in the wild globally (~3,682 in India)',
          populationCensusSource: 'NTCA All India Tiger Estimation (2023) & IUCN Global Assessment',
          populationTrend: 'Increasing in core reserves; fragmented regionally',
          iucnStatus: 'Endangered (EN)',
          survivalRate: {
            cubFirstYear: '45% – 50% first-year survival',
            adultAnnual: '82% – 85% annual survival probability',
            wildLifespan: '10 – 15 years in wild',
            primaryMortalityCauses: [
              'Territorial combat between males',
              'Poaching and retaliatory poisoning',
              'Habitat fragmentation and edge highway trauma'
            ]
          },
          habitat: {
            primaryBiomes: ['Sundarbans Mangroves', 'Tropical Moist Deciduous', 'Alluvial Grasslands'],
            geographicRange: 'India, Bangladesh, Nepal, Bhutan',
            territoryRequirement: '25 – 100 km² per adult',
            elevationRange: 'Sea level to 3,000 m',
            gpsReference: '26.0173° N, 76.5026° E'
          }
        },
        scanMode: 'Moving State Continuous Optical Scan'
      }
    ];
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialRecords, null, 2), 'utf-8');
  }
}

export function getDatabaseRecords() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const records = JSON.parse(raw);
    return records;
  } catch (err) {
    console.error('Error reading detections database:', err);
    return [];
  }
}

export function saveDatabaseRecord(record: any) {
  ensureDbFile();
  try {
    const records = getDatabaseRecords();
    // Prepend new record
    const updated = [record, ...records];
    // Keep last 150 records to manage size
    const capped = updated.slice(0, 150);
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(capped, null, 2), 'utf-8');
    return { success: true, count: capped.length, record };
  } catch (err: any) {
    console.error('Error saving detection record to database:', err);
    return { success: false, error: err?.message };
  }
}

export function clearDatabaseRecords() {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    return { success: true, count: 0 };
  } catch (err: any) {
    console.error('Error clearing database:', err);
    return { success: false, error: err?.message };
  }
}
