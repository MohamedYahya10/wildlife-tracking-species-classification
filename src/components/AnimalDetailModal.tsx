import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Thermometer, 
  Gauge, 
  HeartPulse, 
  AlertTriangle, 
  Award, 
  Compass, 
  Info,
  Maximize2
} from 'lucide-react';
import { DetectionEvent, AnimalSpecies } from '../types.ts';

interface AnimalDetailModalProps {
  detection: DetectionEvent | null;
  speciesOverride?: AnimalSpecies | null;
  onClose: () => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  detection,
  speciesOverride,
  onClose,
}) => {
  const species = speciesOverride || detection?.species;
  if (!species) return null;

  const dataset = species.realDataset;
  const accuracyPercent = (species.modelPredictionAccuracy * 100).toFixed(1);

  const getIucnColor = (code: string) => {
    switch (code) {
      case 'CR': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'EN': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'VU': return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      case 'NT': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default: return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="animal-detail-modal"
        className="relative w-full max-w-5xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Target Identified • Verified Living Object
                </span>
                {detection && (
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                    {detection.sensorStationName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="close-detail-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Header Banner with Animal Name & Accuracy */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
                  {species.commonName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getIucnColor(dataset.iucnCode)}`}>
                  IUCN {dataset.iucnStatus} ({dataset.iucnCode})
                </span>
              </div>
              <p className="text-sm font-serif italic text-emerald-400">
                {species.scientificName} • Class: {species.class} • Family: {species.family}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800/80 border border-stone-700 text-xs text-stone-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{species.livingObjectType}</span>
              </div>
            </div>

            {/* Model Accuracy Badge */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-mono text-stone-400 uppercase">Model Prediction Accuracy</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  {accuracyPercent}%
                </div>
                <div className="text-[11px] font-mono text-stone-400">Confidence Score: {(species.modelPredictionAccuracy).toFixed(4)}</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Sensor Capture & Visual Imagery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Identified Reference Image */}
            <div className="relative rounded-xl overflow-hidden border border-stone-700 bg-stone-950 group">
              <img 
                src={species.heroImage} 
                alt={species.commonName}
                className="w-full h-64 object-cover object-center group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  Target Optical Reference Profile
                </span>
                <span className="text-sm text-stone-200">
                  {species.commonName} in native biotope
                </span>
              </div>
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-amber-300 border border-amber-500/30">
                AI SENSOR LOCK: {species.commonName}
              </div>
            </div>

            {/* Sensor Telemetry & Physical Metrics */}
            <div className="bg-stone-950 rounded-xl p-5 border border-stone-800 flex flex-col justify-between space-y-4">
              <div className="text-xs font-mono uppercase text-stone-400 font-semibold tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Sensor Intercept Telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Thermal Signature</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-rose-300">
                    {species.sampleThermalSignature}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    <span>Motion Velocity</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-sky-300">
                    {species.sampleMotionVelocity}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diet Classification</span>
                  </div>
                  <div className="text-xs text-stone-300 line-clamp-2">
                    {species.diet}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Adult Weight Mass</span>
                  </div>
                  <div className="text-xs text-stone-300 font-mono">
                    {species.weightRange}
                  </div>
                </div>
              </div>

              {/* Biological insight */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{species.funFact}</span>
              </div>
            </div>
          </div>

          {/* REAL DATASET: Living Population & Demographic Census */}
          <div className="bg-stone-950 rounded-xl p-5 border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                  Real Dataset: Living Population & Census
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Source: {dataset.populationCensusSource}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800">
                <span className="text-xs text-stone-400 font-mono uppercase block mb-1">How Many Living (Wild Count)</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white">
                  {dataset.populationCount}
                </div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  {dataset.populationTrend === 'Increasing' ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>Trend: Expanding / Increasing in primary reserves</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-amber-400" />
                      <span>Trend: {dataset.populationTrend}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800">
                <span className="text-xs text-stone-400 font-mono uppercase block mb-1">IUCN Red List Classification</span>
                <div className="text-xl font-bold text-amber-300">
                  {dataset.iucnStatus} ({dataset.iucnCode})
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  Official Global Conservation Red List Status
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800">
                <span className="text-xs text-stone-400 font-mono uppercase block mb-1">Protected Sanctuaries</span>
                <div className="text-xl font-bold text-indigo-300 font-mono">
                  {dataset.conservationReservesCount} Dedicated Reserves
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  {dataset.conservationInitiatives}
                </div>
              </div>
            </div>
          </div>

          {/* REAL DATASET: Survival Rate & Lifespan Metrics */}
          <div className="bg-stone-950 rounded-xl p-5 border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                Real Dataset: Survival Rates & Lifespan Demographics
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-stone-300">First-Year Cub / Juvenile Survival Rate</span>
                    <span className="text-amber-400 font-bold">~45% – 50%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '48%' }}></div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    {dataset.survivalRate.cubFirstYear}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-stone-300">Adult Annual Survival Probability</span>
                    <span className="text-emerald-400 font-bold">~82% – 85%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    {dataset.survivalRate.adultAnnual}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Wild Ecosystem Lifespan</span>
                    <span className="text-stone-100 font-bold">{dataset.survivalRate.wildLifespan}</span>
                  </div>
                  <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Managed Sanctuary Lifespan</span>
                    <span className="text-stone-100 font-bold">{dataset.survivalRate.captiveLifespan}</span>
                  </div>
                </div>
              </div>

              {/* Primary Mortality Causes */}
              <div className="p-4 rounded-lg bg-stone-900 border border-stone-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-stone-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Primary Ecological Mortality Factors</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-300">
                    {dataset.survivalRate.primaryMortalityCauses.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-mono font-bold">{idx + 1}.</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80">
                  <div className="text-[11px] font-mono text-stone-400">Critical Threats to Survival:</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {dataset.keyThreats?.map((threat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-stone-800 text-[10px] text-rose-300 border border-rose-900/50">
                        {threat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL DATASET: Habitat & Ecological Biomes */}
          <div className="bg-stone-950 rounded-xl p-5 border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                Real Dataset: Habitat & Ecological Biomes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div className="p-3.5 rounded-lg bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 font-mono uppercase block mb-1">Geographic Range & Distribution</span>
                  <p className="text-sm text-stone-200">
                    {dataset.habitat.geographicRange}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 font-mono uppercase block mb-1.5">Primary Biomes & Habitats</span>
                  <div className="flex flex-wrap gap-2">
                    {dataset.habitat.primaryBiomes.map((biome, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-stone-800 text-xs font-mono text-emerald-300 border border-emerald-900/60">
                        {biome}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px] mb-1">Territory Requirement</span>
                    <span className="text-stone-200 font-semibold">{dataset.habitat.territoryRequirement}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px] mb-1">Elevation Range</span>
                    <span className="text-stone-200 font-semibold">{dataset.habitat.elevationRange}</span>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates & Climate Card */}
              <div className="p-4 rounded-lg bg-stone-900 border border-stone-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-stone-400 mb-2">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sanctuary Coordinates</span>
                  </div>
                  <div className="p-3 rounded bg-stone-950 font-mono text-xs text-amber-300 border border-stone-800 mb-3">
                    {dataset.habitat.gpsReference}
                  </div>

                  <div className="text-xs text-stone-400 mb-1 font-mono">Climate Profile:</div>
                  <p className="text-xs text-stone-300">
                    {dataset.habitat.climate}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 text-center">
                  <div className="text-[11px] font-mono text-emerald-400">
                    Sensor Station Verified: In-Situ Biome Match
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-stone-400">
            Record ID: <span className="text-stone-200">{detection ? detection.id : `species-${species.id}`}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow"
            >
              Close & Return to Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
