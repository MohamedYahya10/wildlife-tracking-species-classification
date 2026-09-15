"""
Wildlife Tracking Engine
Implements ByteTrack with Centroid-IoU fallback tracker across camera trap frames.
"""
import math
import time
from typing import List, Dict, Any, Tuple

class FallbackIoUTracker:
    """
    Centroid-Distance & IoU-Matching Tracker.
    Disclosed fallback when ByteTrack/supervision packages are not installed.
    Persists tracking IDs and counts unique wildlife individuals across frames.
    """
    def __init__(self, iou_threshold: float = 0.25, max_age_seconds: float = 8.0):
        self.next_track_id = 1
        self.active_tracks: List[Dict[str, Any]] = []
        self.unique_track_ids = set()
        self.iou_threshold = iou_threshold
        self.max_age_seconds = max_age_seconds

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        now = time.time()
        # Remove tracks older than max_age_seconds
        self.active_tracks = [t for t in self.active_tracks if (now - t["last_seen"]) < self.max_age_seconds]

        matched_track_indices = set()
        results = []

        for det in detections:
            bbox = det.get("bbox", [0, 0, 1, 1])
            class_idx = det.get("class_index", -1)
            best_match_idx = -1
            best_score = -1.0

            for idx, track in enumerate(self.active_tracks):
                if idx in matched_track_indices:
                    continue
                iou = self.calculate_iou(bbox, track["bbox"])
                centroid_dist = self.calculate_centroid_dist(bbox, track["bbox"])
                is_same_class = track["class_index"] == class_idx
                score = (iou * 0.7) + (0.3 if is_same_class else 0.0) - (centroid_dist * 0.2)

                if iou >= self.iou_threshold or (centroid_dist < 0.25 and is_same_class):
                    if score > best_score:
                        best_score = score
                        best_match_idx = idx

            if best_match_idx >= 0:
                matched_track_indices.add(best_match_idx)
                track = self.active_tracks[best_match_idx]
                track["bbox"] = bbox
                track["last_seen"] = now
                track["hits"] += 1
                assigned_id = track["track_id"]
            else:
                assigned_id = self.next_track_id
                self.next_track_id += 1
                self.active_tracks.append({
                    "track_id": assigned_id,
                    "class_index": class_idx,
                    "animal_name": det.get("animal_name", ""),
                    "bbox": bbox,
                    "last_seen": now,
                    "hits": 1
                })

            self.unique_track_ids.add(assigned_id)
            res = dict(det)
            res["tracking_id"] = assigned_id
            results.append(res)

        return results

    def get_unique_count(self) -> int:
        return len(self.unique_track_ids)

    def get_active_count(self) -> int:
        now = time.time()
        return len([t for t in self.active_tracks if (now - t["last_seen"]) < self.max_age_seconds])

    def reset(self):
        self.next_track_id = 1
        self.active_tracks.clear()
        self.unique_track_ids.clear()

    @staticmethod
    def calculate_iou(box_a, box_b):
        y_a1, x_a1, y_a2, x_a2 = box_a
        y_b1, x_b1, y_b2, x_b2 = box_b
        y_inter1 = max(y_a1, y_b1)
        x_inter1 = max(x_a1, x_b1)
        y_inter2 = min(y_a2, y_b2)
        x_inter2 = min(x_a2, x_b2)
        inter_area = max(0, y_inter2 - y_inter1) * max(0, x_inter2 - x_inter1)
        area_a = max(0, y_a2 - y_a1) * max(0, x_a2 - x_a1)
        area_b = max(0, y_b2 - y_b1) * max(0, x_b2 - x_b1)
        union_area = area_a + area_b - inter_area
        return inter_area / union_area if union_area > 0 else 0.0

    @staticmethod
    def calculate_centroid_dist(box_a, box_b):
        c_ay = (box_a[0] + box_a[2]) / 2.0
        c_ax = (box_a[1] + box_a[3]) / 2.0
        c_by = (box_b[0] + box_b[2]) / 2.0
        c_bx = (box_b[1] + box_b[3]) / 2.0
        return math.sqrt((c_ay - c_by)**2 + (c_ax - c_bx)**2)

def get_tracker():
    try:
        import supervision as sv
        # ByteTrack implementation
        return sv.ByteTrack()
    except ImportError:
        # Transparent Fallback
        return FallbackIoUTracker()
