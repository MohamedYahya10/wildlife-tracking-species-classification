export type ScannerMode = 'upload' | 'camera' | 'traps' | 'database';

export type VisionFilter = 'natural' | 'thermal' | 'night-vision' | 'motion-diff';

export interface BoundingBox {
  ymin: number; // 0 to 1000
  xmin: number; // 0 to 1000
  ymax: number; // 0 to 1000
  xmax: number; // 0 to 1000
  label?: string;
  confidence?: number;
}

export type InferenceStatus = 
  | 'animal_identified'
  | 'animal_detected_unknown_species'
  | 'no_animal_detected'
  | 'error';

export interface DetectedAnimalEntity {
  commonName: string;
  scientificName?: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface HabitatData {
  primaryBiomes: string[];
  geographicRange: string;
  territoryRequirement: string;
  elevationRange: string;
  gpsReference: string;
  coordinates?: { lat: number; lng: number };
  climate: string;
}

export interface SurvivalData {
  cubFirstYear: string;
  adultAnnual: string;
  wildLifespan: string;
  captiveLifespan: string;
  primaryMortalityCauses: string[];
}

export interface RealDataset {
  populationCount: string;
  populationNumber?: number;
  populationCensusSource: string;
  populationTrend: 'Increasing' | 'Stable' | 'Decreasing' | 'Abundant';
  iucnStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern' | 'Domesticated' | string;
  iucnCode: 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DOM' | string;
  survivalRate: SurvivalData;
  habitat: HabitatData;
  keyThreats?: string[];
  conservationReservesCount?: number;
  conservationInitiatives?: string;
}

export interface AnimalSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  class: string;
  order?: string;
  family: string;
  livingObjectType: string;
  heroImage: string;
  galleryImages?: string[];
  thermalImage?: string;
  nightVisionImage?: string;
  modelPredictionAccuracy: number; // e.g. 0.96 for 96%
  sampleMotionVelocity: string;
  sampleThermalSignature: string;
  diet?: string;
  weightRange?: string;
  funFact?: string;
  realDataset: RealDataset;
}

export interface AIInferenceResult {
  hasAnimal: boolean;
  status: InferenceStatus;
  statusMessage: string;
  detectedCount: number;
  primaryAnimal?: {
    commonName: string;
    scientificName: string;
    livingObjectType: string;
    class: string;
    family: string;
    confidence: number;
    boundingBox?: BoundingBox;
    realDataset: RealDataset;
    diet?: string;
    weightRange?: string;
    funFact?: string;
  };
  allDetectedAnimals?: DetectedAnimalEntity[];
  rawInferenceLatencyMs?: number;
  mysqlQuery?: string;
  source?: string;
}

export interface DetectionEvent {
  id: string;
  timestamp: string;
  hasAnimal: boolean;
  status: InferenceStatus;
  statusMessage: string;
  species?: AnimalSpecies;
  capturedImageUrl: string;
  modelConfidence: number;
  boundingBox?: BoundingBox;
  allDetectedAnimals?: DetectedAnimalEntity[];
  motionVelocity: string;
  thermalReading: string;
  sensorStationId: string;
  sensorStationName: string;
  mysqlQuery?: string;
  notes?: string;
}

export interface TrailCameraStation {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  biome: string;
  sensorType: string;
  previewImage: string;
  targetAnimal: AnimalSpecies;
  motionSensitivityDefault: number;
  ambientTemp: string;
}

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

export interface ApiDetectionItem {
  detection_id?: number | null;
  animal_id?: number | null;
  animal_name: string;
  scientific_name?: string;
  class_index: number;
  description?: string;
  confidence: number;
  confidence_display: string;
  tracking_id?: number | null;
  bbox: [number, number, number, number];
  detected_at?: string;
}

export interface ApiDetectionResponse {
  success: boolean;
  has_detection: boolean;
  status: 'identified' | 'low_confidence' | 'no_detection' | 'error';
  message: string;
  count: number;
  unique_track_count?: number;
  active_track_count?: number;
  model_type?: string;
  model_inference_ms?: number;
  detections: ApiDetectionItem[];
  error?: string;
}

export interface DatabaseRecord {
  id: string;
  timestamp: string;
  isoDate: string;
  speciesId: string;
  commonName: string;
  scientificName: string;
  livingCategory: string;
  modelPredictionAccuracy: number;
  confidenceDisplay: string;
  status: InferenceStatus;
  boundingBox?: BoundingBox;
  movingVelocity: string;
  movingDirection?: string;
  pirDeltaEnergy?: string;
  thermalReading: string;
  sensorStationId: string;
  sensorStationName: string;
  imageUrl: string;
  realDataset: RealDataset;
  mysqlQuery?: string;
  scanMode: string;
}
