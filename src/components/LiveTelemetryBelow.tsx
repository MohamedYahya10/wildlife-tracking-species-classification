import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  HeartPulse, 
  MapPin, 
  Database, 
  Gauge, 
  CheckCircle2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { AnimalSpecies, DatabaseRecord } from '../types.ts';

interface LiveTelemetryBelowProps {
  species?: AnimalSpecies | null;
  accuracy: number;
  motionVelocity: string;
  thermalReading: string;
  lastPersistedRecord: DatabaseRecord | null;
  dbSavedCount: number;
  onOpenFullDossier?: (species: AnimalSpecies) => void;
}

export const LiveTelemetryBelow: React.FC<LiveTelemetryBelowProps> = ({
  species,
  accuracy,
  motionVelocity,
  thermalReading,
  lastPersistedRecord,
  dbSavedCount,
  onOpenFullDossier,
}) => {
  const getIucnColor = (code?: string) => {
    switch (code) {
      case 'CR': return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'EN': return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'VU': return 'bg-yellow-950 text-yellow-300 border-yellow-700';
      default: return 'bg-emerald-950 text-emerald-300 border-emerald-700';
    }
  };

  const ds = species?.realDataset;

  return (
    <div id="live-telemetry-below-scanner" className="space-y-4">
      {/* Database Auto-Persistence Notification Bar */}
      <div className="bg-stone-900 border border-emerald-500/30 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Database Status:
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            AUTO-STORED IN DATABASE
          </span>
          {lastPersistedRecord && (
            <span className="text-xs font-mono text-stone-300 hidden sm:inline">
              Latest Record: <strong className="text-white">{lastPersistedRecord.commonName}</strong> ({lastPersistedRecord.confidenceDisplay}) at {lastPersistedRecord.timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Real-Time Pipeline</span>
          </div>
          <span className="text-stone-600">|</span>
          <span className="bg-stone-950 px-2 py-1 rounded text-stone-200 border border-stone-800">
            Total DB Records: <strong className="text-emerald-400">{dbSavedCount}</strong>
          </span>
        </div>
      </div>

      {/* Grid of 5 User-Requested Metrics Below The Moving Scanner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* 1. IDENTIFIED ANIMAL & SPECIES */}
        <div id="card-identified-species" className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                1. Identified Species
              </span>
              {ds && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getIucnColor(ds.iucnCode)}`}>
                  {ds.iucnStatus.split(' ')[0]}
                </span>
              )}
            </div>

            {species ? (
              <>
                {/* Specimen Photo */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
                  <img
                    src={species.heroImage}
                    alt={species.commonName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-stone-700">
                    {species.livingObjectType}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {species.commonName}
                  </h3>
                  <p className="text-xs font-serif italic text-emerald-400">
                    {species.scientificName}
                  </p>
                  <p className="text-[11px] font-mono text-stone-400 pt-1">
                    Class: {species.class} • Family: {species.family}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-stone-500 mx-auto" />
                <div className="text-xs font-mono font-bold text-stone-300">
                  No Animal Detected
                </div>
                <p className="text-[11px] text-stone-500">
                  The model detected no living animal in the current frame.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 mt-2 flex justify-between items-center">
            <span>{species ? 'Organism Confirmed' : 'Inanimate / Vacant Frame'}</span>
            <span className={species ? 'text-emerald-400' : 'text-stone-500'}>
              {species ? 'Living Fauna' : 'Standby'}
            </span>
          </div>
        </div>

        {/* 2. MODEL PREDICTION ACCURACY */}
        <div id="card-prediction-accuracy" className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                2. Model Accuracy
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                REAL-TIME
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
              <div className="text-[10px] font-mono text-stone-400 uppercase">
                Prediction Accuracy Score
              </div>
              <div className="text-3xl font-mono font-extrabold text-emerald-400">
                {species ? `${Math.round(accuracy * 100)}%` : '0.0%'}
              </div>
              <div className="text-[10px] font-mono text-stone-500">
                Inference: Multimodal Neural Vision
              </div>
            </div>

            {/* Accuracy Bar */}
            <div className="space-y-1">
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${species ? 'bg-emerald-500' : 'bg-stone-700'}`} 
                  style={{ width: `${species ? accuracy * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-stone-400">
                <span>Confidence: {species ? 'Verified' : 'Zero'}</span>
                <span>Match: {species ? 'Positive' : 'None'}</span>
              </div>
            </div>

            {/* Dynamic Moving State Telemetry */}
            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-[11px] font-mono space-y-1 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Motion Speed:</span>
                <strong className="text-amber-400">{motionVelocity}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Thermal Read:</span>
                <strong className="text-emerald-400">{thermalReading}</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 mt-2">
            Continuous optical tracking active
          </div>
        </div>

        {/* 3. REAL DATASET: HOW MANY LIVING (POPULATION COUNT) */}
        <div id="card-living-population" className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                3. How Many Living
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                CENSUS
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
              <div className="text-[10px] font-mono text-stone-400 uppercase">
                Verified Global Population Count
              </div>
              <div className="text-lg font-mono font-bold text-white leading-tight">
                {ds?.populationCount || 'No animal target identified'}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-300 font-mono">
                <span className="text-stone-400">Population Trend:</span>
                <span className={`font-semibold ${ds?.populationTrend === 'Increasing' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ds?.populationTrend || 'Pending'}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                <strong className="text-stone-300">Census Authority:</strong> {ds?.populationCensusSource || 'Global Biodiversity Information'}
              </div>
              <div className="text-[11px] text-stone-400 leading-snug">
                <strong className="text-stone-300">IUCN Status:</strong> {ds?.iucnStatus || 'N/A'}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 mt-2">
            Verified IUCN Red List Assessment
          </div>
        </div>

        {/* 4. REAL DATASET: SURVIVAL RATE */}
        <div id="card-survival-rates" className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                4. Survival Rate
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                ACTUARIAL
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                <span className="text-stone-400">Offspring 1st-Year:</span>
                <strong className="text-amber-400 font-bold">
                  {ds?.survivalRate?.cubFirstYear?.split(' ')[0] || 'N/A'}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                <span className="text-stone-400">Adult Annual Survival:</span>
                <strong className="text-emerald-400 font-bold">
                  {ds?.survivalRate?.adultAnnual?.split(' ')[0] || 'N/A'}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex justify-between items-center">
                <span className="text-stone-400">Wild Lifespan:</span>
                <strong className="text-stone-200">
                  {ds?.survivalRate?.wildLifespan || 'N/A'}
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-stone-400">
              <span className="text-stone-300 font-mono text-[10px] uppercase block mb-0.5">Primary Mortality Causes:</span>
              <p className="line-clamp-2 text-stone-400">
                {ds?.survivalRate?.primaryMortalityCauses?.join('; ') || 'Environmental & territorial dynamics'}
              </p>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 mt-2">
            Captive Lifespan: {ds?.survivalRate?.captiveLifespan || 'N/A'}
          </div>
        </div>

        {/* 5. REAL DATASET: HABITAT */}
        <div id="card-habitat-distribution" className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                5. Habitat & Biome
              </span>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800">
                GEO-ECO
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Geographic Range:</span>
                <p className="text-stone-200 font-medium line-clamp-2">
                  {ds?.habitat?.geographicRange || 'Awaiting identified species coordinate'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400">Territory:</span>
                  <span className="text-amber-300">{ds?.habitat?.territoryRequirement || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400">Elevation:</span>
                  <span className="text-emerald-300">{ds?.habitat?.elevationRange || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400">GPS Reference:</span>
                  <span className="text-sky-300">{ds?.habitat?.gpsReference || 'Active Sensor'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Primary Biomes:</span>
                <div className="flex flex-wrap gap-1">
                  {ds?.habitat?.primaryBiomes?.slice(0, 2).map((biome, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950 text-emerald-300 border border-stone-800">
                      {biome}
                    </span>
                  )) || <span className="text-[10px] text-stone-500 font-mono">Standby</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 mt-2 flex justify-between items-center">
            <span>Climate: {ds?.habitat?.climate || 'Standard'}</span>
            {species && onOpenFullDossier && (
              <button
                onClick={() => onOpenFullDossier(species)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 underline font-sans"
              >
                <span>Full Bio</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
