import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  Activity, 
  ShieldCheck,
  RefreshCw,
  Camera,
  Layers,
  Crosshair
} from 'lucide-react';
import { DatabaseRecord } from '../types.ts';
import { fetchDetectionHistory, clearDetectionHistory } from '../services/cameraTrapService.ts';
import { DetectionEntity } from '../types.ts';

interface StoredDatabaseViewProps {
  records: DatabaseRecord[];
  onClearDatabase: () => void;
  onSelectSpeciesForInspection?: (speciesId: string) => void;
  onRefreshDatabase: () => void;
}

export const StoredDatabaseView: React.FC<StoredDatabaseViewProps> = ({
  records,
  onClearDatabase,
  onSelectSpeciesForInspection,
  onRefreshDatabase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'webcam'>('all');
  const [apiDetections, setApiDetections] = useState<DetectionEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApiDetections = async () => {
    setLoading(true);
    try {
      const data = await fetchDetectionHistory(100);
      setApiDetections(data);
    } catch (err) {
      console.warn('Failed to fetch api detections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiDetections();
  }, [records.length]);

  const handleClearAll = async () => {
    try {
      await clearDetectionHistory();
      await onClearDatabase();
      await loadApiDetections();
    } catch (err) {
      console.error('Error clearing database:', err);
    }
  };

  const handleRefresh = async () => {
    onRefreshDatabase();
    await loadApiDetections();
  };

  const filteredDetections = apiDetections.filter((det) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      det.animal_name.toLowerCase().includes(term) ||
      (det.scientific_name && det.scientific_name.toLowerCase().includes(term)) ||
      (det.tracking_id && det.tracking_id.toString().includes(term)) ||
      det.detection_type.toLowerCase().includes(term);

    const matchType = typeFilter === 'all' || det.detection_type === typeFilter;
    return matchSearch && matchType;
  });

  const exportJson = () => {
    const dataToExport = apiDetections.length > 0 ? apiDetections : records;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', jsonStr);
    dl.setAttribute('download', `wildlife_camera_trap_detections_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const exportCsv = () => {
    const headers = [
      'Detection ID',
      'Timestamp',
      'Species Name',
      'Scientific Name',
      'Class Index',
      'Confidence %',
      'Detection Type',
      'Tracking ID',
      'Bounding Box'
    ];
    const rows = apiDetections.map(d => [
      `"${d.detection_id}"`,
      `"${d.detected_at}"`,
      `"${d.animal_name}"`,
      `"${d.scientific_name || ''}"`,
      `"${d.class_index !== undefined ? d.class_index : ''}"`,
      `"${(d.confidence * 100).toFixed(1)}%"`,
      `"${d.detection_type}"`,
      `"${d.tracking_id || 'N/A'}"`,
      `"[${d.box_ymin || 0}, ${d.box_xmin || 0}, ${d.box_ymax || 0}, ${d.box_xmax || 0}]"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `wildlife_camera_trap_detections_${Date.now()}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
      {/* Top Banner with Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              Camera Trap Detection History (MySQL / SQLite Storage)
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Persisted camera trap sightings with verified confidence scores, class indices, and tracking IDs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            disabled={apiDetections.length === 0 && records.length === 0}
            className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={exportJson}
            disabled={apiDetections.length === 0 && records.length === 0}
            className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>

          <button
            onClick={handleClearAll}
            disabled={apiDetections.length === 0 && records.length === 0}
            className="px-3 py-1.5 rounded-lg border border-rose-900 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search detection history by species, class index, or tracking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <span className="text-xs font-mono text-stone-400">Source:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sources</option>
            <option value="image">Image Upload</option>
            <option value="webcam">Live Webcam</option>
          </select>
        </div>
      </div>

      {/* Detections Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-stone-900 text-stone-400 border-b border-stone-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4"># ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Species & Taxonomy</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Track ID</th>
              <th className="py-3 px-4">Bounding Box</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 text-stone-300">
            {filteredDetections.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-500">
                  No detection records stored yet. Run an image upload or activate webcam stream to record sightings.
                </td>
              </tr>
            ) : (
              filteredDetections.map((rec) => {
                const confPercent = (rec.confidence * 100).toFixed(1);
                const hasBox = rec.box_ymin !== null && rec.box_ymin !== undefined;

                return (
                  <tr key={rec.detection_id} className="hover:bg-stone-900/60 transition">
                    <td className="py-3 px-4 text-stone-500">
                      #{rec.detection_id}
                    </td>
                    <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                      {new Date(rec.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <div className="text-[10px] text-stone-600">
                        {new Date(rec.detected_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {rec.animal_name}
                        {rec.class_index !== undefined && rec.class_index !== null && (
                          <span className="px-1.5 py-0.2 bg-stone-800 text-emerald-400 border border-stone-700 rounded text-[9px]">
                            #{rec.class_index}
                          </span>
                        )}
                      </div>
                      {rec.scientific_name && (
                        <div className="text-[10px] italic text-stone-400 font-serif">
                          {rec.scientific_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${rec.confidence >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {confPercent}%
                        </span>
                        <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${rec.confidence >= 0.75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${confPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        rec.detection_type === 'webcam' 
                          ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {rec.detection_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {rec.tracking_id ? (
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                          Track #{rec.tracking_id}
                        </span>
                      ) : (
                        <span className="text-stone-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-400 text-[10px]">
                      {hasBox ? (
                        <span>
                          [{rec.box_ymin?.toFixed(2)}, {rec.box_xmin?.toFixed(2)}, {rec.box_ymax?.toFixed(2)}, {rec.box_xmax?.toFixed(2)}]
                        </span>
                      ) : (
                        <span className="text-stone-600">Full Image Tag</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
