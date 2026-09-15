import React, { useState, useEffect, useRef } from 'react';
import { 
  TRAIL_CAMERA_STATIONS, 
  SPECIES_DATABASE 
} from '../data/wildlifeData.ts';
import { 
  TrailCameraStation, 
  DetectionEvent, 
  VisionFilter, 
  AnimalSpecies 
} from '../types.ts';
import { sensorAudio } from '../services/audioService.ts';
import { 
  Radar, 
  Crosshair, 
  Zap, 
  Radio, 
  Thermometer, 
  Gauge, 
  Compass, 
  Eye, 
  Play, 
  Pause,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface TrailTrapsScannerProps {
  visionFilter: VisionFilter;
  onAnimalDetected: (detection: DetectionEvent) => void;
  onOpenSpeciesDetail: (species: AnimalSpecies) => void;
}

export const TrailTrapsScanner: React.FC<TrailTrapsScannerProps> = ({
  visionFilter,
  onAnimalDetected,
  onOpenSpeciesDetail,
}) => {
  const [selectedStation, setSelectedStation] = useState<TrailCameraStation>(TRAIL_CAMERA_STATIONS[0]);
  const [isArming, setIsArming] = useState(false);
  const [motionEnergy, setMotionEnergy] = useState(18);
  const [isMotionTriggered, setIsMotionTriggered] = useState(false);
  const [continuousMonitor, setContinuousMonitor] = useState(false);
  const [sensitivity, setSensitivity] = useState(75);
  const [lastEvent, setLastEvent] = useState<DetectionEvent | null>(null);
  const [reticleCoords, setReticleCoords] = useState({ x: 38, y: 32, w: 42, h: 48 });

  const monitorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic sensor fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // Background thermal noise
      if (!isMotionTriggered) {
        setMotionEnergy(prev => {
          const noise = Math.sin(Date.now() / 1000) * 8;
          const val = Math.max(5, Math.min(45, 20 + noise + (Math.random() * 6 - 3)));
          return Math.round(val);
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isMotionTriggered]);

  // Continuous monitoring auto-trigger
  useEffect(() => {
    if (continuousMonitor) {
      monitorTimerRef.current = setInterval(() => {
        // Random chance to catch animal in sensor
        triggerSensorScan();
      }, 7000);
    } else {
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
    }
    return () => {
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
    };
  }, [continuousMonitor, selectedStation]);

  const triggerSensorScan = () => {
    if (isArming) return;
    setIsArming(true);
    sensorAudio.playSensorClick();

    // Spikes motion energy over threshold
    setMotionEnergy(89 + Math.floor(Math.random() * 10));
    setIsMotionTriggered(true);
    sensorAudio.playMotionChirp();

    setTimeout(() => {
      const animal = selectedStation.targetAnimal;
      sensorAudio.playTargetLock();

      const newEvent: DetectionEvent = {
        id: 'det-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        hasAnimal: true,
        status: 'animal_identified',
        statusMessage: `Animal Detected: ${animal.commonName}`,
        species: animal,
        capturedImageUrl: animal.heroImage,
        modelConfidence: animal.modelPredictionAccuracy,
        motionVelocity: animal.sampleMotionVelocity,
        thermalReading: animal.sampleThermalSignature,
        sensorStationId: selectedStation.id,
        sensorStationName: selectedStation.name,
      };

      setLastEvent(newEvent);
      onAnimalDetected(newEvent);
      setIsArming(false);

      // Reset motion trigger state after visual feedback
      setTimeout(() => {
        setIsMotionTriggered(false);
      }, 3500);
    }, 600);
  };

  const getFilterStyle = () => {
    switch (visionFilter) {
      case 'thermal':
        return 'filter hue-rotate-[280deg] saturate-200 contrast-150 brightness-110';
      case 'night-vision':
        return 'filter hue-rotate-[90deg] saturate-150 contrast-125 brightness-110 sepia-[0.3]';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sensor Control Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-stone-300 font-semibold uppercase">Active Camera Trap:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRAIL_CAMERA_STATIONS.map((station) => (
              <button
                key={station.id}
                id={`station-btn-${station.id}`}
                onClick={() => {
                  setSelectedStation(station);
                  sensorAudio.playSensorClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                  selectedStation.id === station.id
                    ? 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <span>{station.targetAnimal.commonName.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({station.ambientTemp})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Bio-Sensor Monitoring toggle */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-continuous-scan"
            onClick={() => {
              setContinuousMonitor(!continuousMonitor);
              sensorAudio.playSensorClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
              continuousMonitor
                ? 'bg-amber-600/90 text-white font-bold ring-1 ring-amber-400'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {continuousMonitor ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Auto-Trap Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Trap Inactive</span>
              </>
            )}
          </button>

          <button
            id="btn-trigger-scan"
            onClick={triggerSensorScan}
            disabled={isArming}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Crosshair className="w-4 h-4" />
            <span>{isArming ? 'SCANNING SENSOR...' : 'TRIGGER SENSOR SCAN'}</span>
          </button>
        </div>
      </div>

      {/* Main Trail Camera Viewport & HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Optical Camera Trap Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-stone-800 shadow-2xl aspect-video select-none">
            
            {/* Visual Feed Image */}
            <img
              src={selectedStation.previewImage}
              alt={selectedStation.name}
              className={`w-full h-full object-cover object-center transition duration-300 ${getFilterStyle()}`}
            />

            {/* Scanline Grid & Sensor Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>

            {/* Thermal or Night Vision Vignette */}
            {visionFilter === 'thermal' && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-900/30 via-transparent to-amber-500/20 mix-blend-color"></div>
            )}
            {visionFilter === 'night-vision' && (
              <div className="absolute inset-0 pointer-events-none bg-emerald-950/20 mix-blend-screen"></div>
            )}

            {/* Top HUD Telemetry */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                <span className="font-bold tracking-wider uppercase">CAM TRAP: {selectedStation.id.toUpperCase()}</span>
                <span className="text-stone-300">| {selectedStation.coordinates}</span>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-700 text-stone-200">
                TEMP: <span className="text-amber-300">{selectedStation.ambientTemp}</span> | FPS: 30
              </div>
            </div>

            {/* Bounding Box / Targeting Reticle Overlay */}
            <div 
              className={`absolute border-2 transition-all duration-300 pointer-events-none ${
                isMotionTriggered 
                  ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-100' 
                  : 'border-amber-400/50 scale-95'
              }`}
              style={{
                top: `${reticleCoords.y}%`,
                left: `${reticleCoords.x}%`,
                width: `${reticleCoords.w}%`,
                height: `${reticleCoords.h}%`,
              }}
            >
              {/* Corner Brackets */}
              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-white"></div>

              {/* Reticle Tag */}
              <div className="absolute -top-6 left-0 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 font-bold border border-emerald-500/50 flex items-center gap-1.5 whitespace-nowrap">
                <Crosshair className="w-3 h-3 animate-spin" />
                <span>
                  {isMotionTriggered 
                    ? `[ TARGET LOCKED: ${selectedStation.targetAnimal.commonName.toUpperCase()} ]`
                    : `SENSING SECTOR: ${selectedStation.biome.slice(0, 22)}...`
                  }
                </span>
              </div>

              {isMotionTriggered && (
                <div className="absolute -bottom-6 left-0 bg-emerald-950/90 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-600 flex items-center gap-2">
                  <span>CONF: {(selectedStation.targetAnimal.modelPredictionAccuracy * 100).toFixed(1)}%</span>
                  <span>VEL: {selectedStation.targetAnimal.sampleMotionVelocity}</span>
                </div>
              )}
            </div>

            {/* Motion Waveform & Sensor Energy Bar (Bottom HUD) */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-stone-800 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span className="text-stone-300">PIR DELTA:</span>
                  <span className={`font-bold ${motionEnergy > 70 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {motionEnergy}%
                  </span>
                </div>

                {/* Energy progress bar */}
                <div className="w-24 bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      motionEnergy > 70 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${motionEnergy}%` }}
                  ></div>
                </div>

                <span className="text-stone-400 text-[10px]">
                  THRESH: {sensitivity}%
                </span>
              </div>

              <div className="bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-800 text-stone-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>ELEV: 840m</span>
                <span className="text-stone-600">|</span>
                <span className="text-emerald-400">LIVING ORGANISM CONFIRMED</span>
              </div>
            </div>

            {/* Visual Flash on detection */}
            {isMotionTriggered && (
              <div className="absolute inset-0 bg-emerald-400/20 pointer-events-none animate-pulse"></div>
            )}
          </div>

          {/* Sensor station description */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-3 font-mono">
            <div>
              <span className="text-stone-400">Deployed Station:</span>{' '}
              <strong className="text-white">{selectedStation.name}</strong>
              <div className="text-[11px] text-stone-400">{selectedStation.location}</div>
            </div>
            <div>
              <span className="text-stone-400">Sensor Hardware:</span>{' '}
              <span className="text-emerald-400">{selectedStation.sensorType}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Identified Animal & Real Dataset Card */}
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  Sensor Identification Telemetry
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>

            {/* Target Animal Overview */}
            {(() => {
              const animal = selectedStation.targetAnimal;
              const ds = animal.realDataset;

              return (
                <div className="space-y-4">
                  {/* Animal Image & Identification Header */}
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-stone-700 bg-stone-950">
                      <img 
                        src={animal.heroImage} 
                        alt={animal.commonName}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-600">
                        {(animal.modelPredictionAccuracy * 100).toFixed(1)}% Accuracy
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
                        {animal.livingObjectType}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white font-sans">
                        {animal.commonName}
                      </h4>
                      <p className="text-xs font-serif italic text-emerald-400">
                        {animal.scientificName}
                      </p>
                    </div>
                  </div>

                  {/* USER REQUESTED METRIC 1: Model Prediction Accuracy */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-stone-400">Model Prediction Accuracy</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        {(animal.modelPredictionAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${animal.modelPredictionAccuracy * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-500 pt-0.5">
                      <span>Verified Living Target</span>
                      <span>Latency: 92ms</span>
                    </div>
                  </div>

                  {/* USER REQUESTED METRIC 2: Real Dataset - How Many Living */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center justify-between">
                      <span>Real Dataset: How Many Living</span>
                      <span className="text-amber-400 font-bold">IUCN {ds.iucnStatus}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-white">
                      {ds.populationCount}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Source: {ds.populationCensusSource}
                    </div>
                  </div>

                  {/* USER REQUESTED METRIC 3: Survival Rate */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                    <div className="text-[11px] font-mono uppercase text-stone-400">
                      Real Dataset: Survival Rates
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-stone-300">
                        <span>Cub / Juvenile (1st Year):</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {ds.survivalRate.cubFirstYear.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Adult Annual Survival:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {ds.survivalRate.adultAnnual.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                        <span>Wild Lifespan:</span>
                        <span className="text-stone-200">{ds.survivalRate.wildLifespan}</span>
                      </div>
                    </div>
                  </div>

                  {/* USER REQUESTED METRIC 4: Habitat Distribution */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <div className="text-[11px] font-mono uppercase text-stone-400">
                      Habitat & Biome Distribution
                    </div>
                    <p className="text-xs text-stone-300 line-clamp-2">
                      {ds.habitat.geographicRange}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {ds.habitat.primaryBiomes.slice(0, 2).map((b, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-emerald-300 border border-emerald-900/60">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Open Comprehensive Dossier Button */}
                  <button
                    id="btn-view-full-dossier"
                    onClick={() => onOpenSpeciesDetail(animal)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <span>Inspect Full Real Dataset</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
};
