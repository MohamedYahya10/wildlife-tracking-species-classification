import React from 'react';
import { 
  Radar, 
  Camera, 
  Layers, 
  Upload, 
  BookOpen, 
  History, 
  Volume2, 
  VolumeX, 
  Activity,
  Flame,
  Eye,
  Crosshair
} from 'lucide-react';
import { ScannerMode, VisionFilter } from '../types.ts';
import { sensorAudio } from '../services/audioService.ts';

interface HeaderProps {
  currentMode: ScannerMode;
  onSelectMode: (mode: ScannerMode) => void;
  visionFilter: VisionFilter;
  onChangeVisionFilter: (filter: VisionFilter) => void;
  detectionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  visionFilter,
  onChangeVisionFilter,
  detectionCount,
}) => {
  const [soundOn, setSoundOn] = React.useState(sensorAudio.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sensorAudio.setSoundEnabled(next);
    if (next) {
      sensorAudio.playMotionChirp();
    }
  };

  return (
    <header id="app-header" className="bg-stone-900 border-b border-stone-800 text-stone-100 sticky top-0 z-40">
      {/* Top telemetry status bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-stone-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-stone-400 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider">SENSOR: ARMED</span>
          </div>
          <span className="hidden sm:inline text-stone-600">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-stone-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>PIR OPTICAL: <strong className="text-amber-400 font-normal">ACTIVE</strong></span>
          </div>
          <span className="hidden md:inline text-stone-600">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-stone-400">
            <Radar className="w-3.5 h-3.5 text-sky-400" />
            <span>MODEL PIPELINE: <strong className="text-sky-300 font-normal">CLIP ZERO-SHOT / YOLOV8</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Vision filter switches */}
          <div className="flex items-center bg-stone-950 p-0.5 rounded-md border border-stone-800 text-[11px]">
            <button
              id="filter-natural"
              onClick={() => onChangeVisionFilter('natural')}
              title="Natural Optical Spectrum"
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                visionFilter === 'natural' 
                  ? 'bg-stone-800 text-amber-300 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Natural</span>
            </button>
            <button
              id="filter-thermal"
              onClick={() => onChangeVisionFilter('thermal')}
              title="FLIR Thermal Heat Signature"
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                visionFilter === 'thermal' 
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/50' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Thermal FLIR</span>
            </button>
            <button
              id="filter-night"
              onClick={() => onChangeVisionFilter('night-vision')}
              title="Military Infrared Night Vision"
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                visionFilter === 'night-vision' 
                  ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/50' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span>Night IR</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title={soundOn ? 'Sensor Audio Enabled' : 'Sensor Audio Muted'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                Wildlife Tracker <span className="text-emerald-400 font-medium text-sm">Camera Trap Classifier</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                40 Species Taxonomy
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Camera Trap Monitoring • Zero-Shot CLIP Vision & YOLO Tracking • Centroid-IoU Engine • MySQL/SQLite
            </p>
          </div>
        </div>

        {/* Primary mode tabs */}
        <nav className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 overflow-x-auto max-w-full">
          <button
            id="nav-tab-traps"
            onClick={() => onSelectMode('traps')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              currentMode === 'traps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trail Camera Traps</span>
          </button>

          <button
            id="nav-tab-camera"
            onClick={() => onSelectMode('camera')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              currentMode === 'camera'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live WebCam Scanner</span>
          </button>

          <button
            id="nav-tab-upload"
            onClick={() => onSelectMode('upload')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              currentMode === 'upload'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Photo Scanner</span>
          </button>

          <button
            id="nav-tab-database"
            onClick={() => onSelectMode('database')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              currentMode === 'database'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Species Databank</span>
          </button>

          <button
            id="nav-tab-log"
            onClick={() => onSelectMode('traps')}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition"
            title={`${detectionCount} detections logged`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="bg-stone-800 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
              {detectionCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
