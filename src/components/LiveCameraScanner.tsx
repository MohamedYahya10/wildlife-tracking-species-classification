import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  VideoOff, 
  Crosshair, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  AlertTriangle,
  Sliders,
  Sparkles,
  Database,
  Play,
  Square,
  Activity,
  RotateCcw,
  Layers,
  Cpu
} from 'lucide-react';
import { DetectionEvent, VisionFilter, AnimalSpecies, ApiDetectionResponse, ApiDetectionItem } from '../types.ts';
import { detectWildlifeWebcam, resetWildlifeTracker } from '../services/cameraTrapService.ts';
import { sensorAudio } from '../services/audioService.ts';
import { SPECIES_DATABASE } from '../data/wildlifeData.ts';
import { BoundingBoxOverlay } from './BoundingBoxOverlay.tsx';

interface LiveCameraScannerProps {
  visionFilter: VisionFilter;
  onAnimalDetected: (detection: DetectionEvent) => void;
  onOpenSpeciesDetail: (species: AnimalSpecies) => void;
}

interface SightingLogItem {
  id: string;
  time: string;
  animal_name: string;
  class_index: number;
  confidence: number;
  confidence_display: string;
  tracking_id?: number | null;
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({
  visionFilter,
  onAnimalDetected,
  onOpenSpeciesDetail,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Section 19: Periodic frame grab configurable (500ms - 2000ms)
  const [intervalMs, setIntervalMs] = useState<number>(1000);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.50);
  const [simulationFeed, setSimulationFeed] = useState<boolean>(false);
  const [demoAnimalIdx, setDemoAnimalIdx] = useState<number>(1); // Bengal Tiger default demo

  // Real detection state from /api/detect/webcam
  const [latestResponse, setLatestResponse] = useState<ApiDetectionResponse | null>(null);
  const [uniqueTrackCount, setUniqueTrackCount] = useState<number>(0);
  const [activeTrackCount, setActiveTrackCount] = useState<number>(0);
  const [sightingLog, setSightingLog] = useState<SightingLogItem[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollTimerRef = useRef<any>(null);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in current environment');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setHasCamera(true);
      setCameraError(null);
      sensorAudio.playSensorClick();
    } catch (err: any) {
      console.warn('Could not start webcam:', err?.message);
      setHasCamera(false);
      setCameraError(err?.message || 'Camera access unavailable');
      setSimulationFeed(true);
      setIsCameraActive(true);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsCameraActive(false);
    sensorAudio.playSensorClick();
  };

  // Periodic Frame Capture Loop when Camera is Active
  useEffect(() => {
    if (isCameraActive) {
      pollTimerRef.current = setInterval(() => {
        captureAndAnalyzeFrame();
      }, intervalMs);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [isCameraActive, intervalMs, confidenceThreshold, simulationFeed, demoAnimalIdx]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureAndAnalyzeFrame = async () => {
    if (isScanning) return;
    setIsScanning(true);

    let frameBase64: string | null = null;

    if (!simulationFeed && videoRef.current && hiddenCanvasRef.current) {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frameBase64 = canvas.toDataURL('image/jpeg', 0.82);
        }
      }
    } else {
      const currentSim = SPECIES_DATABASE[demoAnimalIdx % SPECIES_DATABASE.length];
      frameBase64 = currentSim.heroImage;
    }

    if (!frameBase64) {
      setIsScanning(false);
      return;
    }

    try {
      const resp = await detectWildlifeWebcam(frameBase64, confidenceThreshold);
      setLatestResponse(resp);
      
      if (resp.unique_track_count !== undefined) {
        setUniqueTrackCount(resp.unique_track_count);
      }
      if (resp.active_track_count !== undefined) {
        setActiveTrackCount(resp.active_track_count);
      }

      // Add to live sightings log if animals detected
      if (resp.has_detection && resp.detections && resp.detections.length > 0) {
        const top = resp.detections[0];
        const newLogItem: SightingLogItem = {
          id: `sight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          animal_name: top.animal_name,
          class_index: top.class_index,
          confidence: top.confidence,
          confidence_display: top.confidence_display,
          tracking_id: top.tracking_id
        };

        setSightingLog(prev => [newLogItem, ...prev.slice(0, 19)]); // keep last 20 sightings

        const matchedSpecies = SPECIES_DATABASE.find(
          s => s.commonName.toLowerCase() === top.animal_name.toLowerCase()
        );

        const detectionEvent: DetectionEvent = {
          id: `det-${top.detection_id || Date.now()}`,
          timestamp: newLogItem.time,
          hasAnimal: resp.status === 'identified',
          status: resp.status === 'identified' ? 'animal_identified' : 'animal_detected_unknown_species',
          statusMessage: resp.message,
          species: matchedSpecies,
          capturedImageUrl: frameBase64,
          modelConfidence: top.confidence,
          boundingBox: {
            ymin: Math.round(top.bbox[0] * 1000),
            xmin: Math.round(top.bbox[1] * 1000),
            ymax: Math.round(top.bbox[2] * 1000),
            xmax: Math.round(top.bbox[3] * 1000),
            label: `${top.animal_name} #${top.tracking_id ? `Track ${top.tracking_id}` : top.class_index}`,
            confidence: top.confidence
          },
          motionVelocity: '2.8 m/s (Live Optical Velocity)',
          thermalReading: '38.4°C (Living Fauna)',
          sensorStationId: 'station-webcam-trap-01',
          sensorStationName: 'Live Camera Trap Webcam Sensor'
        };

        onAnimalDetected(detectionEvent);
      }
    } catch (err) {
      console.warn('Webcam frame inference error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetTracker = async () => {
    try {
      await resetWildlifeTracker();
      setUniqueTrackCount(0);
      setActiveTrackCount(0);
      setSightingLog([]);
    } catch (err) {
      console.error('Failed to reset tracker:', err);
    }
  };

  const getFilterClass = () => {
    switch (visionFilter) {
      case 'thermal':
        return 'filter hue-rotate-[280deg] saturate-200 contrast-150 brightness-110';
      case 'night-vision':
        return 'filter hue-rotate-[90deg] saturate-150 contrast-125 brightness-110 sepia-[0.3]';
      default:
        return '';
    }
  };

  const currentSim = SPECIES_DATABASE[demoAnimalIdx % SPECIES_DATABASE.length];
  const primaryDetection = latestResponse?.detections?.[0];
  const hasAnimal = latestResponse?.has_detection && latestResponse?.status === 'identified';
  const isLowConfidence = latestResponse?.status === 'low_confidence';
  const isNoAnimal = latestResponse?.status === 'no_detection';

  return (
    <div className="space-y-6">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Camera Controls Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-stone-200 uppercase">
              Camera Trap Stream:
            </span>
          </div>

          {/* Start / Stop Camera Button */}
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP CAMERA</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow hover:shadow-emerald-900/40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START CAMERA</span>
            </button>
          )}

          {/* Mode Selector */}
          <div className="flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-xs font-mono">
            <button
              onClick={() => setSimulationFeed(false)}
              className={`px-3 py-1 rounded transition ${
                !simulationFeed ? 'bg-stone-800 text-emerald-300 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hardware WebCam
            </button>
            <button
              onClick={() => setSimulationFeed(true)}
              className={`px-3 py-1 rounded transition ${
                simulationFeed ? 'bg-stone-800 text-emerald-300 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Camera Trap Simulation
            </button>
          </div>

          {simulationFeed && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 font-mono">Species Subject:</span>
              <select
                value={demoAnimalIdx}
                onChange={(e) => setDemoAnimalIdx(Number(e.target.value))}
                className="bg-stone-950 border border-stone-800 text-emerald-300 text-xs font-mono px-2 py-1 rounded focus:outline-none"
              >
                {SPECIES_DATABASE.map((animal, idx) => (
                  <option key={animal.id} value={idx}>
                    #{idx} {animal.commonName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Polling Interval & Reset Tracker Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <span>Poll: {intervalMs}ms</span>
            <input
              type="range"
              min="500"
              max="2000"
              step="250"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Threshold: {(confidenceThreshold * 100).toFixed(0)}%</span>
            <input
              type="range"
              min="0.30"
              max="0.85"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-16 accent-emerald-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleResetTracker}
            className="px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono flex items-center gap-1.5 transition"
            title="Reset active tracking IDs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Tracker</span>
          </button>
        </div>
      </div>

      {/* Main Stream Viewport + Live Detection Log Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Video Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-stone-800 shadow-2xl aspect-video select-none">
            
            {/* Real WebCam Video element or Simulation */}
            {!simulationFeed ? (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${getFilterClass()}`}
              />
            ) : (
              <img
                src={currentSim.heroImage}
                alt={currentSim.commonName}
                className={`w-full h-full object-cover ${getFilterClass()}`}
              />
            )}

            {/* Offline / Inactive Banner */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                <VideoOff className="w-12 h-12 text-stone-600" />
                <h4 className="text-base font-bold text-white">Camera Trap Standby</h4>
                <p className="text-xs text-stone-400 max-w-sm">
                  Click "Start Camera" to initiate periodic optical inference and real-time animal tracking.
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition shadow"
                >
                  Start Live Camera Trap
                </button>
              </div>
            )}

            {/* Scanline Grid */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-25"></div>

            {/* BOUNDING BOX OVERLAY WITH TRACKING ID */}
            {isCameraActive && hasAnimal && primaryDetection && (
              <div className="absolute inset-0 pointer-events-none">
                <BoundingBoxOverlay
                  boundingBox={{
                    ymin: Math.round(primaryDetection.bbox[0] * 1000),
                    xmin: Math.round(primaryDetection.bbox[1] * 1000),
                    ymax: Math.round(primaryDetection.bbox[2] * 1000),
                    xmax: Math.round(primaryDetection.bbox[3] * 1000),
                    label: `${primaryDetection.animal_name} ${primaryDetection.tracking_id ? `#${primaryDetection.tracking_id}` : ''} (${primaryDetection.confidence_display})`,
                    confidence: primaryDetection.confidence
                  }}
                  label={`${primaryDetection.animal_name} ${primaryDetection.tracking_id ? `#${primaryDetection.tracking_id}` : ''} (${primaryDetection.confidence_display})`}
                  confidence={primaryDetection.confidence}
                />
              </div>
            )}

            {/* Reticle / Stream Header Status */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-30">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-mono text-emerald-400 border border-emerald-500/40 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isCameraActive ? 'OPTICAL SENSOR ACTIVE' : 'STANDBY'}</span>
                <span className="text-stone-500">|</span>
                <span>{intervalMs}ms interval</span>
              </div>

              {latestResponse && isCameraActive && (
                <div className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold border backdrop-blur-md ${
                  isNoAnimal
                    ? 'bg-stone-900/90 border-stone-600 text-stone-300'
                    : isLowConfidence
                    ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                }`}>
                  {latestResponse.message}
                </div>
              )}
            </div>

            {/* Model & Tracker HUD Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none z-30">
              <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-stone-700 text-[10px] font-mono text-stone-300 flex items-center gap-2">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>{latestResponse?.model_type || 'CLIP Zero-Shot Vision'}</span>
                <span className="text-stone-500">•</span>
                <span>Tracker: Centroid/IoU (ByteTrack Mode)</span>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-2">
                <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-stone-700 text-[10px] font-mono text-stone-300">
                  Visible Now: <strong className="text-emerald-400 font-bold">{latestResponse?.count || 0}</strong>
                </div>
                <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-emerald-800 text-[10px] font-mono text-emerald-300">
                  Unique Total: <strong className="text-emerald-400 font-bold">{uniqueTrackCount}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Trigger Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Camera Trap Model: Real-Time Periodic Frame Polling Engine</span>
            <button
              onClick={captureAndAnalyzeFrame}
              disabled={!isCameraActive || isScanning}
              className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 transition disabled:opacity-50"
            >
              Manual Frame Trigger
            </button>
          </div>
        </div>

        {/* Right Col: Real-time Animal Count & Live Detection Log */}
        <div className="space-y-4">
          
          {/* Tracking Metrics Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  Individual Tracking & Counting
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-mono font-bold">
                Centroid-IoU Engine
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Currently In Frame</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {latestResponse?.count || 0}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block">Specimen(s)</span>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Unique Individuals</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {uniqueTrackCount}
                </span>
                <span className="text-[10px] font-mono text-stone-400 block">Distinct Track IDs</span>
              </div>
            </div>

            {/* Top Currently Tracked Animal */}
            {hasAnimal && primaryDetection ? (
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
                    Target Identification
                  </span>
                  {primaryDetection.tracking_id && (
                    <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 rounded text-[10px] font-mono text-emerald-300 font-bold">
                      Track #{primaryDetection.tracking_id}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-white">
                  {primaryDetection.animal_name}
                </div>
                {primaryDetection.scientific_name && (
                  <div className="text-xs italic font-serif text-stone-400">
                    {primaryDetection.scientific_name}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-mono pt-1 text-stone-300">
                  <span>Confidence:</span>
                  <strong className="text-emerald-400">{primaryDetection.confidence_display}</strong>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section 19: Live Detection Log (Scrolling List) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  Live Sightings Log
                </h4>
              </div>
              <span className="text-[10px] font-mono text-stone-500">
                {sightingLog.length} Sightings
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-800/60">
              {sightingLog.length === 0 ? (
                <div className="py-8 text-center text-stone-500 font-mono text-xs">
                  Awaiting camera sightings... Start camera or activate simulation feed.
                </div>
              ) : (
                sightingLog.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <span>{item.animal_name}</span>
                        {item.tracking_id && (
                          <span className="text-[10px] text-emerald-400 bg-stone-800 px-1.5 py-0.2 rounded border border-stone-700">
                            #{item.tracking_id}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500">{item.time}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{item.confidence_display}</span>
                      <div className="text-[9px] text-stone-500">Class #{item.class_index}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
