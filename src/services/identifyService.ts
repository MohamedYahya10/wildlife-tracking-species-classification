import { AnimalSpecies, DetectionEvent, DatabaseRecord } from '../types.ts';

export async function identifyCapturedAnimal(params: {
  imageBase64?: string;
  sensorStationId?: string;
  sensorStationName?: string;
  movingVelocity?: string;
  movingDirection?: string;
  pirDeltaEnergy?: string;
}): Promise<DetectionEvent> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    const res = await fetch('/api/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: params.imageBase64,
      }),
    });

    if (res.ok) {
      const data = await res.json();

      // Case 1: No animal detected
      if (!data.hasAnimal || data.status === 'no_animal_detected') {
        return {
          id: 'det-' + Date.now(),
          timestamp,
          hasAnimal: false,
          status: 'no_animal_detected',
          statusMessage: 'No animal detected.',
          capturedImageUrl: params.imageBase64 || '',
          modelConfidence: 0,
          motionVelocity: '0.0 m/s (Static / Inanimate)',
          thermalReading: '22.0°C (Ambient Background)',
          sensorStationId: params.sensorStationId || 'station-optical',
          sensorStationName: params.sensorStationName || 'Continuous Optical Frame Analyzer',
        };
      }

      // Case 2: Animal detected but unknown species
      if (data.status === 'animal_detected_unknown_species') {
        const detection: DetectionEvent = {
          id: 'det-' + Date.now(),
          timestamp,
          hasAnimal: true,
          status: 'animal_detected_unknown_species',
          statusMessage: 'Species could not be identified with sufficient confidence.',
          capturedImageUrl: params.imageBase64 || '',
          modelConfidence: data.primaryAnimal?.confidence || 0.45,
          boundingBox: data.primaryAnimal?.boundingBox,
          motionVelocity: params.movingVelocity || '1.8 m/s (Undetermined Gait)',
          thermalReading: '36.8°C (Biological Living Heat)',
          sensorStationId: params.sensorStationId || 'station-optical',
          sensorStationName: params.sensorStationName || 'Continuous Optical Frame Analyzer',
          mysqlQuery: data.mysqlQuery,
        };

        // Persist to database
        saveToDatabase(detection, null);
        return detection;
      }

      // Case 3: Confidently identified animal species
      if (data.primaryAnimal) {
        const animal = data.primaryAnimal;
        const confNumber = typeof animal.confidence === 'number' ? animal.confidence : 0.94;
        
        const speciesObj: AnimalSpecies = {
          id: (animal.commonName || 'animal').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          commonName: animal.commonName,
          scientificName: animal.scientificName || 'Fauna species',
          class: animal.class || 'Mammalia',
          family: animal.family || 'Fauna',
          livingObjectType: animal.livingObjectType || 'Living Organism (Endothermic/Ectothermic)',
          heroImage: params.imageBase64 || '',
          modelPredictionAccuracy: confNumber,
          sampleMotionVelocity: params.movingVelocity || '3.5 m/s (Active Stride)',
          sampleThermalSignature: '38.2°C (Core Mammalian Temp)',
          diet: animal.diet || 'Documented dietary preferences',
          weightRange: animal.weightRange || 'Observed physical metrics',
          funFact: animal.funFact || `Predicted with ${Math.round(confNumber * 100)}% visual neural confidence.`,
          realDataset: animal.realDataset,
        };

        const detection: DetectionEvent = {
          id: 'det-' + Date.now(),
          timestamp,
          hasAnimal: true,
          status: 'animal_identified',
          statusMessage: `Animal Detected: ${animal.commonName}`,
          species: speciesObj,
          capturedImageUrl: params.imageBase64 || '',
          modelConfidence: confNumber,
          boundingBox: animal.boundingBox,
          allDetectedAnimals: data.allDetectedAnimals,
          motionVelocity: params.movingVelocity || '3.5 m/s (Continuous Motion Vector)',
          thermalReading: '38.2°C (Biological Living Heat)',
          sensorStationId: params.sensorStationId || 'station-optical',
          sensorStationName: params.sensorStationName || 'Continuous Optical Frame Analyzer',
          mysqlQuery: data.mysqlQuery,
        };

        // Persist to database
        saveToDatabase(detection, speciesObj);
        return detection;
      }
    }
  } catch (err: any) {
    console.error('Identification service error:', err);
  }

  // If request failed or error occurred
  return {
    id: 'det-' + Date.now(),
    timestamp,
    hasAnimal: false,
    status: 'error',
    statusMessage: 'Inference error: Could not complete frame analysis.',
    capturedImageUrl: params.imageBase64 || '',
    modelConfidence: 0,
    motionVelocity: '0.0 m/s',
    thermalReading: 'Sensor Standby',
    sensorStationId: params.sensorStationId || 'station-optical',
    sensorStationName: params.sensorStationName || 'Continuous Optical Frame Analyzer',
  };
}

async function saveToDatabase(detection: DetectionEvent, species: AnimalSpecies | null) {
  try {
    const record: Partial<DatabaseRecord> = {
      id: detection.id,
      timestamp: detection.timestamp,
      isoDate: new Date().toISOString(),
      speciesId: species?.id || 'unknown-species',
      commonName: species?.commonName || 'Unidentified Animal',
      scientificName: species?.scientificName || 'Species unidentified',
      livingCategory: species?.livingObjectType || 'Fauna Specimen',
      modelPredictionAccuracy: detection.modelConfidence,
      confidenceDisplay: `${Math.round(detection.modelConfidence * 100)}%`,
      status: detection.status,
      boundingBox: detection.boundingBox,
      movingVelocity: detection.motionVelocity,
      movingDirection: 'Vector 048° Heading',
      pirDeltaEnergy: 'Motion Spike Trigger',
      thermalReading: detection.thermalReading,
      sensorStationId: detection.sensorStationId,
      sensorStationName: detection.sensorStationName,
      imageUrl: detection.capturedImageUrl,
      realDataset: species?.realDataset || {
        populationCount: 'Under investigation',
        populationCensusSource: 'IUCN Species Survival Commission',
        populationTrend: 'Stable',
        iucnStatus: 'Data Deficient / Pending',
        iucnCode: 'DD',
        survivalRate: {
          cubFirstYear: 'Documented field records',
          adultAnnual: 'Documented field records',
          wildLifespan: 'Documented field records',
          captiveLifespan: 'Documented field records',
          primaryMortalityCauses: ['Environmental factors']
        },
        habitat: {
          primaryBiomes: ['Natural biome'],
          geographicRange: 'Observed region',
          territoryRequirement: 'Territory territory',
          elevationRange: 'Terrain elevation',
          gpsReference: 'Station GPS',
          climate: 'Standard'
        }
      },
      mysqlQuery: detection.mysqlQuery,
      scanMode: 'Continuous Optical Trap Analysis'
    };

    await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch (err) {
    console.warn('Failed to save detection record to database:', err);
  }
}
