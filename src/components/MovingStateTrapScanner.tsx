import React, { useState, useEffect, useRef } from 'react';
import { 
  TRAIL_CAMERA_STATIONS, 
  SPECIES_DATABASE 
} from '../data/wildlifeData.ts';
import { 
  TrailCameraStation, 
  VisionFilter, 
  AnimalSpecies,
  DatabaseRecord 
} from '../types.ts';
import { sensorAudio } from '../services/audioService.ts';
import { 
  Radar, 
  Crosshair, 
  Radio, 
  Gauge, 
  Compass, 
  Play, 
  Pause,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  RotateCw,
  Database
} from 'lucide-react';

interface MovingStateTrapScannerProps {
  visionFilter: VisionFilter;
  onAnimalIdentifiedInMotion: (
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
  ) => void;
  activeSpecies: AnimalSpecies;
  activeStation: TrailCameraStation;
  onSelectStation: (station: TrailCameraStation) => void;
}

export const MovingStateTrapScanner: React.FC<MovingStateTrapScannerProps> = ({
  visionFilter,
  onAnimalIdentifiedInMotion,
  activeSpecies,
  activeStation,
  onSelectStation,
}) => {
  // Motion simulation state
  const [isPlayingMotion, setIsPlayingMotion] = useState<boolean>(true);
  const [motionSpeed, setMotionSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [motionProgress, setMotionProgress] = useState<number>(20); // 0 to 100% horizontal traverse
  const [movingDirection, setMovingDirection] = useState<'east' | 'west'>('east');
  const [motionEnergy, setMotionEnergy] = useState<number>(84);
  const [isAiScanningInMotion, setIsAiScanningInMotion] = useState<boolean>(true);
  const [autoCycleSpecies, setAutoCycleSpecies] = useState<boolean>(false);

  // Reticle coordinate interpolation
  const [reticleState, setReticleState] = useState({
    x: 25,
    y: 36,
    width: 38,
    height: 44,
    confidence: activeSpecies.modelPredictionAccuracy,
  });

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const lastIdentifiedSpeciesIdRef = useRef<string>('');
  const lastDbSaveTimeRef = useRef<number>(0);

  // Sync confidence when species changes
  useEffect(() => {
    setReticleState(prev => ({
      ...prev,
      confidence: activeSpecies.modelPredictionAccuracy
    }));

    // Trigger immediate identification in moving state
    triggerMotionIdentification(activeSpecies, motionProgress, movingDirection);
  }, [activeSpecies]);

  // Main continuous moving state animation loop
  useEffect(() => {
    const speedMultiplier = motionSpeed === 'slow' ? 0.04 : motionSpeed === 'fast' ? 0.12 : 0.07;

    const animateMovement = (time: number) => {
      const delta = Math.min(time - lastTimeRef.current, 50); // cap delta
      lastTimeRef.current = time;

      if (isPlayingMotion) {
        setMotionProgress(prev => {
          let next = prev;
          if (movingDirection === 'east') {
            next = prev + delta * speedMultiplier;
            if (next >= 75) {
              setMovingDirection('west');
              next = 75;
              // Check if auto-cycle species is enabled
              if (autoCycleSpecies) {
                cycleNextStation();
              }
            }
          } else {
            next = prev - delta * speedMultiplier;
            if (next <= 12) {
              setMovingDirection('east');
              next = 12;
            }
          }
          return next;
        });

        // Dynamic thermal/motion energy fluctuation reacting to movement
        const wave = Math.sin(time / 250);
        const bobbingY = 36 + Math.sin(time / 200) * 2.5;
        const currentEnergy = Math.round(75 + wave * 14 + (motionSpeed === 'fast' ? 8 : 0));
        setMotionEnergy(currentEnergy);

        // Update Reticle position smoothly as animal moves
        setReticleState(prev => ({
          ...prev,
          x: motionProgress,
          y: bobbingY,
        }));

        // Periodic continuous AI model telemetry sync in moving state
        const now = Date.now();
        if (now - lastDbSaveTimeRef.current > 7000) {
          lastDbSaveTimeRef.current = now;
          triggerMotionIdentification(activeSpecies, motionProgress, movingDirection);
        }
      }

      animRef.current = requestAnimationFrame(animateMovement);
    };

    animRef.current = requestAnimationFrame(animateMovement);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlayingMotion, motionSpeed, movingDirection, motionProgress, activeSpecies, autoCycleSpecies]);

  const cycleNextStation = () => {
    const currentIdx = TRAIL_CAMERA_STATIONS.findIndex(s => s.id === activeStation.id);
    const nextStation = TRAIL_CAMERA_STATIONS[(currentIdx + 1) % TRAIL_CAMERA_STATIONS.length];
    onSelectStation(nextStation);
    sensorAudio.playMotionChirp();
  };

  const triggerMotionIdentification = (
    sp: AnimalSpecies, 
    currentX: number, 
    dir: 'east' | 'west'
  ) => {
    const heading = dir === 'east' ? 'Heading 068° (ENE)' : 'Heading 248° (WSW)';
    const speedStr = motionSpeed === 'fast' ? '7.2 m/s (Sprint)' : motionSpeed === 'slow' ? '2.4 m/s (Stalking)' : sp.sampleMotionVelocity;

    onAnimalIdentifiedInMotion(sp, {
      velocity: speedStr,
      direction: heading,
      energy: `${motionEnergy}% PIR Motion Spike`,
      accuracy: sp.modelPredictionAccuracy,
      thermal: sp.sampleThermalSignature,
      stationId: activeStation.id,
      stationName: activeStation.name,
    });
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
    <div className="space-y-4">
      {/* Sensor Control Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-stone-300 font-semibold uppercase">
              Camera Trap Sector:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRAIL_CAMERA_STATIONS.map((station) => (
              <button
                key={station.id}
                id={`btn-select-station-${station.id}`}
                onClick={() => {
                  onSelectStation(station);
                  sensorAudio.playSensorClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                  activeStation.id === station.id
                    ? 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <span>{station.targetAnimal.commonName}</span>
                <span className="text-[10px] opacity-75">({station.ambientTemp})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Movement Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Play Movement */}
          <button
            id="toggle-play-movement"
            onClick={() => {
              setIsPlayingMotion(!isPlayingMotion);
              sensorAudio.playSensorClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
              isPlayingMotion 
                ? 'bg-amber-600/90 text-white font-bold' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
            title={isPlayingMotion ? 'Pause moving state' : 'Resume moving state'}
          >
            {isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingMotion ? 'In Motion (Active)' : 'Motion Paused'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px] font-mono">
            {(['slow', 'normal', 'fast'] as const).map((spd) => (
              <button
                key={spd}
                id={`speed-btn-${spd}`}
                onClick={() => {
                  setMotionSpeed(spd);
                  sensorAudio.playSensorClick();
                }}
                className={`px-2 py-1 rounded capitalize transition ${
                  motionSpeed === spd
                    ? 'bg-stone-800 text-emerald-400 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          {/* Next Moving Organism Button */}
          <button
            id="btn-cycle-species"
            onClick={cycleNextStation}
            className="px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-mono flex items-center gap-1.5 transition"
            title="Scan next moving species"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Next Moving Target</span>
          </button>
        </div>
      </div>

      {/* Main Viewport: Continuous Optical Motion Scanner */}
      <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-stone-800 shadow-2xl aspect-[16/9] sm:aspect-[21/9] select-none">
        
        {/* Habitat Background Terrain */}
        <img
          src={activeStation.previewImage}
          alt={activeStation.name}
          className={`w-full h-full object-cover object-center transition-all duration-300 ${getFilterStyle()}`}
        />

        {/* Scanlines & Tactical CRT Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>

        {/* Thermal FLIR or Night Vision tinting */}
        {visionFilter === 'thermal' && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-900/30 via-transparent to-amber-500/20 mix-blend-color"></div>
        )}
        {visionFilter === 'night-vision' && (
          <div className="absolute inset-0 pointer-events-none bg-emerald-950/20 mix-blend-screen"></div>
        )}

        {/* Moving Animal Layer: The living animal actively prowling across the frame */}
        <div 
          className="absolute pointer-events-none transition-transform duration-75 ease-linear"
          style={{
            left: `${reticleState.x}%`,
            top: `${reticleState.y}%`,
            width: `${reticleState.width}%`,
            height: `${reticleState.height}%`,
            transform: `translate(-10%, -10%) ${movingDirection === 'west' ? 'scaleX(-1)' : 'scaleX(1)'}`,
          }}
        >
          {/* Animal cutout specimen */}
          <div className="w-full h-full relative overflow-hidden rounded-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            <img 
              src={activeSpecies.heroImage} 
              alt={activeSpecies.commonName} 
              className={`w-full h-full object-cover rounded-2xl border border-emerald-500/30 transition duration-300 ${getFilterStyle()}`}
            />
            
            {/* Thermal heat signature glow on animal */}
            {visionFilter === 'thermal' && (
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-amber-400/30 to-transparent mix-blend-overlay"></div>
            )}
          </div>
        </div>

        {/* Dynamic Optical AI Bounding Box & Targeting Reticle tracking animal in moving state */}
        <div 
          className="absolute pointer-events-none border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] rounded-lg transition-all duration-75 ease-linear"
          style={{
            left: `${reticleState.x - 2}%`,
            top: `${reticleState.y - 2}%`,
            width: `${reticleState.width + 4}%`,
            height: `${reticleState.height + 4}%`,
          }}
        >
          {/* Corner Optical Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-white"></div>
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-white"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-white"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-white"></div>

          {/* Real-time Target Identification Banner in Moving State */}
          <div className="absolute -top-7 left-0 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 font-bold border border-emerald-500 flex items-center gap-2 whitespace-nowrap shadow-lg">
            <Crosshair className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>
              [ IN MOTION IDENTIFIED: {activeSpecies.commonName.toUpperCase()} ]
            </span>
            <span className="text-amber-300 font-normal">
              ({(activeSpecies.modelPredictionAccuracy * 100).toFixed(1)}%)
            </span>
          </div>

          {/* Dynamic Velocity & Heading Telemetry in Moving State */}
          <div className="absolute -bottom-7 left-0 bg-emerald-950/95 text-emerald-200 text-[10px] font-mono px-2.5 py-1 rounded border border-emerald-600 flex items-center gap-3 whitespace-nowrap shadow-lg">
            <span>VEL: {motionSpeed === 'fast' ? '7.2 m/s' : motionSpeed === 'slow' ? '2.4 m/s' : activeSpecies.sampleMotionVelocity}</span>
            <span>DIR: {movingDirection === 'east' ? '068° ENE' : '248° WSW'}</span>
            <span className="text-amber-300">TEMP: {activeSpecies.sampleThermalSignature}</span>
          </div>
        </div>

        {/* Top HUD Telemetry Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span className="font-bold tracking-wider uppercase">
              SECTOR: {activeStation.id.toUpperCase()} • {activeStation.location}
            </span>
          </div>

          <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-700 text-stone-200 flex items-center gap-2">
            <span className="text-emerald-400 font-bold animate-pulse">● MOVING STATE SCANNING</span>
            <span className="text-stone-500">|</span>
            <span>NO CAPTURE REQUIRED</span>
          </div>
        </div>

        {/* Bottom HUD: Motion Energy & Coordinate Sensor Readings */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-stone-800 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span className="text-stone-300">PIR SENSOR DELTA:</span>
              <span className="font-bold text-emerald-400">
                {motionEnergy}%
              </span>
            </div>

            {/* Visual Energy bar */}
            <div className="w-24 bg-stone-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-200" 
                style={{ width: `${motionEnergy}%` }}
              ></div>
            </div>

            <span className="text-stone-400 text-[10px]">
              GPS: {activeStation.coordinates}
            </span>
          </div>

          <div className="bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-800 text-stone-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>ORGANISM: <strong className="text-white">{activeSpecies.scientificName}</strong></span>
            <span className="text-stone-600">|</span>
            <span className="text-emerald-400">STATUS: AUTO-PERSISTING TO DB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
