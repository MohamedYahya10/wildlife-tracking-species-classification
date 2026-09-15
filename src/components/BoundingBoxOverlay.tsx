import React from 'react';
import { BoundingBox, DetectedAnimalEntity } from '../types.ts';

interface BoundingBoxOverlayProps {
  boundingBox?: BoundingBox;
  label?: string;
  confidence?: number;
  allDetectedAnimals?: DetectedAnimalEntity[];
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  boundingBox,
  label,
  confidence,
  allDetectedAnimals = [],
}) => {
  // Collect all boxes to render
  const boxesToRender: Array<{
    box: BoundingBox;
    name: string;
    conf: number;
    color: string;
  }> = [];

  const colors = [
    'border-emerald-400 text-emerald-300 bg-emerald-950/80',
    'border-amber-400 text-amber-300 bg-amber-950/80',
    'border-cyan-400 text-cyan-300 bg-cyan-950/80',
    'border-rose-400 text-rose-300 bg-rose-950/80',
  ];

  if (allDetectedAnimals.length > 0) {
    allDetectedAnimals.forEach((entity, idx) => {
      if (entity.boundingBox) {
        boxesToRender.push({
          box: entity.boundingBox,
          name: entity.commonName,
          conf: entity.confidence,
          color: colors[idx % colors.length],
        });
      }
    });
  } else if (boundingBox) {
    boxesToRender.push({
      box: boundingBox,
      name: label || 'Living Organism',
      conf: confidence || 0.95,
      color: colors[0],
    });
  }

  if (boxesToRender.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {boxesToRender.map((item, idx) => {
        const { box, name, conf, color } = item;
        // Clamp normalized 0-1000 values
        const ymin = Math.max(0, Math.min(1000, box.ymin));
        const xmin = Math.max(0, Math.min(1000, box.xmin));
        const ymax = Math.max(ymin + 20, Math.min(1000, box.ymax));
        const xmax = Math.max(xmin + 20, Math.min(1000, box.xmax));

        const top = `${(ymin / 1000) * 100}%`;
        const left = `${(xmin / 1000) * 100}%`;
        const width = `${((xmax - xmin) / 1000) * 100}%`;
        const height = `${((ymax - ymin) / 1000) * 100}%`;

        const confPct = Math.round(conf * 100);

        return (
          <div
            key={idx}
            className="absolute transition-all duration-300 ease-out"
            style={{ top, left, width, height }}
          >
            {/* Box outline */}
            <div className={`w-full h-full border-2 border-dashed ${color.split(' ')[0]} rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] relative`}>
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>

              {/* Tag header */}
              <div className="absolute -top-6 left-0 flex items-center gap-1.5 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wide border shadow-md ${color}`}>
                  {name} [{confPct}%]
                </span>
              </div>

              {/* Center reticle */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
