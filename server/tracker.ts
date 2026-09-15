export interface Track {
  track_id: number;
  class_index: number;
  animal_name: string;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  last_seen: number;
  hits: number;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export class WildlifeTracker {
  private nextTrackId: number = 1;
  private activeTracks: Track[] = [];
  private totalUniqueTracks: Set<number> = new Set();
  private maxAgeMs: number = 8000; // 8 seconds before track expires
  private iouThreshold: number = 0.25;

  public update(
    detections: Array<{
      class_index: number;
      animal_name: string;
      confidence: number;
      bbox: [number, number, number, number];
    }>
  ): Array<{
    class_index: number;
    animal_name: string;
    confidence: number;
    bbox: [number, number, number, number];
    tracking_id: number;
  }> {
    const now = Date.now();
    // Prune stale tracks
    this.activeTracks = this.activeTracks.filter(t => now - t.last_seen < this.maxAgeMs);

    const results: Array<{
      class_index: number;
      animal_name: string;
      confidence: number;
      bbox: [number, number, number, number];
      tracking_id: number;
    }> = [];

    const matchedTrackIndices = new Set<number>();

    for (const det of detections) {
      let bestMatchIdx = -1;
      let bestScore = -1;

      for (let i = 0; i < this.activeTracks.length; i++) {
        if (matchedTrackIndices.has(i)) continue;
        const track = this.activeTracks[i];
        
        // Calculate IoU & Centroid Distance
        const iou = calculateIoU(det.bbox, track.bbox);
        const centroidDist = calculateCentroidDist(det.bbox, track.bbox);

        // Same class or high overlap
        const isSameClass = track.class_index === det.class_index;
        const score = (iou * 0.7) + (isSameClass ? 0.3 : 0) - (centroidDist * 0.2);

        if (iou >= this.iouThreshold || (centroidDist < 0.25 && isSameClass)) {
          if (score > bestScore) {
            bestScore = score;
            bestMatchIdx = i;
          }
        }
      }

      let assignedTrackId: number;
      if (bestMatchIdx >= 0) {
        matchedTrackIndices.add(bestMatchIdx);
        const track = this.activeTracks[bestMatchIdx];
        track.bbox = det.bbox;
        track.last_seen = now;
        track.hits += 1;
        assignedTrackId = track.track_id;
      } else {
        // Create new track
        assignedTrackId = this.nextTrackId++;
        this.activeTracks.push({
          track_id: assignedTrackId,
          class_index: det.class_index,
          animal_name: det.animal_name,
          bbox: det.bbox,
          last_seen: now,
          hits: 1
        });
      }

      this.totalUniqueTracks.add(assignedTrackId);

      results.push({
        ...det,
        tracking_id: assignedTrackId
      });
    }

    return results;
  }

  public getUniqueCount(): number {
    return this.totalUniqueTracks.size;
  }

  public getActiveCount(): number {
    const now = Date.now();
    return this.activeTracks.filter(t => now - t.last_seen < this.maxAgeMs).length;
  }

  public reset(): void {
    this.nextTrackId = 1;
    this.activeTracks = [];
    this.totalUniqueTracks.clear();
  }
}

function calculateIoU(boxA: [number, number, number, number], boxB: [number, number, number, number]): number {
  const [yA1, xA1, yA2, xA2] = boxA;
  const [yB1, xB1, yB2, xB2] = boxB;

  const yInter1 = Math.max(yA1, yB1);
  const xInter1 = Math.max(xA1, xB1);
  const yInter2 = Math.min(yA2, yB2);
  const xInter2 = Math.min(xA2, xB2);

  const interArea = Math.max(0, yInter2 - yInter1) * Math.max(0, xInter2 - xInter1);
  const areaA = Math.max(0, yA2 - yA1) * Math.max(0, xA2 - xA1);
  const areaB = Math.max(0, yB2 - yB1) * Math.max(0, xB2 - xB1);
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

function calculateCentroidDist(boxA: [number, number, number, number], boxB: [number, number, number, number]): number {
  const cAy = (boxA[0] + boxA[2]) / 2;
  const cAx = (boxA[1] + boxA[3]) / 2;
  const cBy = (boxB[0] + boxB[2]) / 2;
  const cBx = (boxB[1] + boxB[3]) / 2;

  const dy = cAy - cBy;
  const dx = cAx - cBx;
  return Math.sqrt(dy * dy + dx * dx);
}

export const globalWildlifeTracker = new WildlifeTracker();
