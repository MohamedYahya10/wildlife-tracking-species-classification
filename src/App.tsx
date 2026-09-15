import React, { useState, useEffect } from 'react';
import { 
  ScannerMode, 
  VisionFilter, 
  DetectionEvent, 
  AnimalSpecies,
  TrailCameraStation,
  DatabaseRecord 
} from './types.ts';
import { SPECIES_DATABASE, TRAIL_CAMERA_STATIONS } from './data/wildlifeData.ts';
import { Header } from './components/Header.tsx';
import { MovingStateTrapScanner } from './components/MovingStateTrapScanner.tsx';
import { LiveTelemetryBelow } from './components/LiveTelemetryBelow.tsx';
import { StoredDatabaseView } from './components/StoredDatabaseView.tsx';
import { LiveCameraScanner } from './components/LiveCameraScanner.tsx';
import { UploadScanner } from './components/UploadScanner.tsx';
import { SpeciesDatabaseView } from './components/SpeciesDatabaseView.tsx';
import { AnimalDetailModal } from './components/AnimalDetailModal.tsx';
import { 
  fetchDatabaseRecords, 
  persistDetectionRecord, 
  clearAllDatabaseRecords 
} from './services/databaseService.ts';

export default function App() {
  // Default to 'upload' mode so user can immediately test real images (dog, cat, elephant, tiger, etc.)
  const [currentMode, setCurrentMode] = useState<ScannerMode>('upload');
  const [visionFilter, setVisionFilter] = useState<VisionFilter>('natural');
  
  // Active identified animal (null if no animal detected in current frame)
  const [activeSpecies, setActiveSpecies] = useState<AnimalSpecies | null>(null);
  
  // Active station in moving state trap mode
  const [activeStation, setActiveStation] = useState<TrailCameraStation>(TRAIL_CAMERA_STATIONS[0]);
  
  // Real-time telemetry in moving / optical state
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(0.96);
  const [currentVelocity, setCurrentVelocity] = useState<string>('3.2 m/s (Active Stride)');
  const [currentThermal, setCurrentThermal] = useState<string>('37.8°C (Biological Heat)');
  
  // Persistent database records state
  const [dbRecords, setDbRecords] = useState<DatabaseRecord[]>([]);
  const [lastPersistedRecord, setLastPersistedRecord] = useState<DatabaseRecord | null>(null);
  
  // Modal for deep archival dossier
  const [inspectModalSpecies, setInspectModalSpecies] = useState<AnimalSpecies | null>(null);

  // Load database records on startup
  useEffect(() => {
    async function loadDb() {
      const records = await fetchDatabaseRecords();
      if (records && records.length > 0) {
        setDbRecords(records);
        setLastPersistedRecord(records[0]);
      }
    }
    loadDb();
  }, []);

  // Handler for detection events from UploadScanner or LiveCameraScanner
  const handleRealDetection = async (det: DetectionEvent) => {
    if (det.hasAnimal && det.species) {
      setActiveSpecies(det.species);
      setCurrentAccuracy(det.modelConfidence);
      setCurrentVelocity(det.motionVelocity);
      setCurrentThermal(det.thermalReading);

      // Create and persist database record
      const newRecord: DatabaseRecord = {
        id: det.id,
        timestamp: det.timestamp,
        isoDate: new Date().toISOString(),
        speciesId: det.species.id,
        commonName: det.species.commonName,
        scientificName: det.species.scientificName,
        livingCategory: det.species.livingObjectType,
        modelPredictionAccuracy: det.modelConfidence,
        confidenceDisplay: `${Math.round(det.modelConfidence * 100)}%`,
        status: det.status,
        boundingBox: det.boundingBox,
        movingVelocity: det.motionVelocity,
        movingDirection: 'Vector 048° Heading',
        pirDeltaEnergy: 'Optical Motion Energy',
        thermalReading: det.thermalReading,
        sensorStationId: det.sensorStationId,
        sensorStationName: det.sensorStationName,
        imageUrl: det.capturedImageUrl,
        realDataset: det.species.realDataset,
        mysqlQuery: det.mysqlQuery,
        scanMode: currentMode === 'camera' ? 'Live WebCam Optical Frame' : 'Uploaded Image Frame Scan'
      };

      await persistDetectionRecord(newRecord);

      setDbRecords((prev) => {
        const exists = prev.some(r => r.id === newRecord.id);
        if (exists) return prev;
        return [newRecord, ...prev];
      });
      setLastPersistedRecord(newRecord);
    } else {
      // If no animal detected or error
      setActiveSpecies(null);
      setCurrentAccuracy(0);
      setCurrentVelocity('0.0 m/s (Static / Inanimate)');
      setCurrentThermal('22.0°C (Ambient Temperature)');
    }
  };

  // Handler for Moving State Trap Scanner
  const handleAnimalIdentifiedInMotion = async (
    species: AnimalSpecies,
    telemetry: {
      velocity: string;
      direction: string;
      energy: string;
      accuracy: number;
      thermal: string;
      stationId: string;
      stationName: string;
    }
  ) => {
    setActiveSpecies(species);
    setCurrentAccuracy(telemetry.accuracy);
    setCurrentVelocity(telemetry.velocity);
    setCurrentThermal(telemetry.thermal);

    const newRecord: DatabaseRecord = {
      id: `rec-${species.id}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isoDate: new Date().toISOString(),
      speciesId: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      livingCategory: species.livingObjectType,
      modelPredictionAccuracy: telemetry.accuracy,
      confidenceDisplay: `${(telemetry.accuracy * 100).toFixed(1)}%`,
      status: 'animal_identified',
      movingVelocity: telemetry.velocity,
      movingDirection: telemetry.direction,
      pirDeltaEnergy: telemetry.energy,
      thermalReading: telemetry.thermal,
      sensorStationId: telemetry.stationId,
      sensorStationName: telemetry.stationName,
      imageUrl: species.heroImage,
      realDataset: species.realDataset,
      scanMode: 'Moving State Continuous Optical Scan'
    };

    await persistDetectionRecord(newRecord);
    
    setDbRecords((prev) => {
      const exists = prev.some(r => r.speciesId === newRecord.speciesId && Math.abs(new Date(r.isoDate).getTime() - new Date(newRecord.isoDate).getTime()) < 4000);
      if (exists) return prev;
      return [newRecord, ...prev];
    });
    setLastPersistedRecord(newRecord);
  };

  const handleClearDatabase = async () => {
    await clearAllDatabaseRecords();
    setDbRecords([]);
    setLastPersistedRecord(null);
  };

  const handleRefreshDatabase = async () => {
    const records = await fetchDatabaseRecords();
    setDbRecords(records);
  };

  const handleSelectStation = (station: TrailCameraStation) => {
    setActiveStation(station);
    setActiveSpecies(station.targetAnimal);
  };

  const handleSelectSpeciesFromTable = (speciesId: string) => {
    const found = SPECIES_DATABASE.find(s => s.id === speciesId);
    if (found) {
      setInspectModalSpecies(found);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* High-tech Sensor Telemetry Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        visionFilter={visionFilter}
        onChangeVisionFilter={setVisionFilter}
        detectionCount={dbRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* ACTIVE SCANNER VIEWPORT */}
        {currentMode === 'upload' && (
          <UploadScanner
            visionFilter={visionFilter}
            onAnimalDetected={handleRealDetection}
            onOpenSpeciesDetail={(sp) => setInspectModalSpecies(sp)}
          />
        )}

        {currentMode === 'camera' && (
          <LiveCameraScanner
            visionFilter={visionFilter}
            onAnimalDetected={handleRealDetection}
            onOpenSpeciesDetail={(sp) => setInspectModalSpecies(sp)}
          />
        )}

        {currentMode === 'traps' && (
          <MovingStateTrapScanner
            visionFilter={visionFilter}
            onAnimalIdentifiedInMotion={handleAnimalIdentifiedInMotion}
            activeSpecies={activeSpecies || SPECIES_DATABASE[0]}
            activeStation={activeStation}
            onSelectStation={handleSelectStation}
          />
        )}

        {currentMode === 'database' && (
          <SpeciesDatabaseView
            onSelectSpecies={(sp) => setInspectModalSpecies(sp)}
          />
        )}

        {/* 5 USER-REQUESTED DATASET METRICS BELOW SCANNER:
            1. Animal Identification & Specimen Photo
            2. Model Prediction Accuracy
            3. Real Dataset: How Many Living (Population count)
            4. Real Dataset: Survival Rate (Cub, Adult, Lifespan)
            5. Real Dataset: Habitat (Biomes, Geographic Range, Elevation, Territory)
            + Database Persisted Status Indicator
        */}
        <section id="telemetry-below-scanner-section">
          <LiveTelemetryBelow
            species={activeSpecies}
            accuracy={currentAccuracy}
            motionVelocity={currentVelocity}
            thermalReading={currentThermal}
            lastPersistedRecord={lastPersistedRecord}
            dbSavedCount={dbRecords.length}
            onOpenFullDossier={(sp) => setInspectModalSpecies(sp)}
          />
        </section>

        {/* DATABASE STORAGE VIEW: Displays all stored records, MySQL schemas & queries */}
        <section id="database-records-section" className="pt-2">
          <StoredDatabaseView
            records={dbRecords}
            onClearDatabase={handleClearDatabase}
            onSelectSpeciesForInspection={handleSelectSpeciesFromTable}
            onRefreshDatabase={handleRefreshDatabase}
          />
        </section>
      </main>

      {/* Modal for In-Depth Archival Dossier */}
      {inspectModalSpecies && (
        <AnimalDetailModal
          detection={null}
          speciesOverride={inspectModalSpecies}
          onClose={() => setInspectModalSpecies(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-4 text-center text-xs font-mono text-stone-500">
        BioScan Wildlife & Living Object Motion Sensor • Multimodal Neural Vision • Persistent Database Storage • IUCN Red List Assessment
      </footer>
    </div>
  );
}
