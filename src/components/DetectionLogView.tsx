import React from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Clock,
  Radio
} from 'lucide-react';
import { DetectionEvent, AnimalSpecies } from '../types.ts';

interface DetectionLogViewProps {
  detections: DetectionEvent[];
  onClearLog: () => void;
  onInspectDetection: (detection: DetectionEvent) => void;
}

export const DetectionLogView: React.FC<DetectionLogViewProps> = ({
  detections,
  onClearLog,
  onInspectDetection,
}) => {
  const exportJson = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(detections, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `bioscan_incident_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Sensor Intercept Log ({detections.length} Incidents)
            </h2>
            <p className="text-xs text-stone-400">
              Chronological register of living wildlife motion detections and optical matches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            disabled={detections.length === 0}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onClearLog}
            disabled={detections.length === 0}
            className="px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800 text-stone-400 hover:text-rose-300 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {detections.length === 0 ? (
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <Radio className="w-10 h-10 text-stone-600 mx-auto animate-pulse" />
          <h3 className="text-base font-mono font-semibold text-stone-300">
            No Sensor Detections Recorded Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Arm the camera traps or trigger a live webcam scan to record living animal motion events and model accuracies.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Sensor Station</th>
                  <th className="py-3 px-4">Identified Organism</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Living Population</th>
                  <th className="py-3 px-4">Survival Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                {detections.map((event) => (
                  <tr key={event.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3 px-4 text-stone-400 whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>{event.timestamp}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-stone-200">
                      {event.sensorStationName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={event.capturedImageUrl} 
                          alt="" 
                          className="w-8 h-8 rounded-md object-cover border border-stone-700" 
                        />
                        <div>
                          <div className="font-bold text-white">
                            {event.species ? event.species.commonName : event.statusMessage || 'No animal detected'}
                          </div>
                          <div className="text-[10px] italic text-emerald-400">
                            {event.species?.scientificName || 'Inanimate / Unclassified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-400">
                      {(event.modelConfidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-stone-200">
                      {event.species ? `${event.species.realDataset.populationCount.split(' ')[0]} ${event.species.realDataset.populationCount.split(' ')[1] || ''}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-amber-300">
                      {event.species ? `${event.species.realDataset.survivalRate.cubFirstYear.split(' ')[0]} cub` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onInspectDetection(event)}
                        className="px-2.5 py-1 rounded bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white transition inline-flex items-center gap-1"
                      >
                        <span>Dataset</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
