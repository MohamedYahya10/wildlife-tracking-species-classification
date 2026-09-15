import {
  AnimalEntity,
  DetectionEntity,
  ApiDetectionResponse,
  ApiDetectionItem
} from '../types.ts';

export const EXACT_40_CLASSES = [
  'Lion', 'Tiger', 'African Elephant', 'Leopard', 'Cheetah', 'Rhinoceros',
  'Hippopotamus', 'Giraffe', 'Zebra', 'Gorilla', 'Brown Bear', 'Polar Bear',
  'Gray Wolf', 'Red Fox', 'Jaguar', 'Snow Leopard', 'Giant Panda',
  'Orangutan', 'Kangaroo', 'Koala', 'Moose', 'American Bison',
  'Reindeer', 'Sea Otter', 'Sloth', 'Wild Boar', 'Nile Crocodile',
  'American Alligator', 'Komodo Dragon', 'King Cobra', 'Bald Eagle',
  'Golden Eagle', 'Great Horned Owl', 'Flamingo', 'Emperor Penguin',
  'Macaw', 'Great White Shark', 'Blue Whale', 'Bottlenose Dolphin',
  'Giant Pacific Octopus'
];

export async function detectWildlifeImage(
  imageBase64: string,
  filename?: string,
  confidenceThreshold = 0.50
): Promise<ApiDetectionResponse> {
  const res = await fetch('/api/detect/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      filename: filename || 'uploaded_image.jpg',
      confidenceThreshold
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Image detection failed (${res.status})`);
  }

  return res.json();
}

export async function detectWildlifeWebcam(
  imageBase64: string,
  confidenceThreshold = 0.50
): Promise<ApiDetectionResponse> {
  const res = await fetch('/api/detect/webcam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      confidenceThreshold
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Webcam frame analysis failed (${res.status})`);
  }

  return res.json();
}

export async function fetchAllAnimals(): Promise<AnimalEntity[]> {
  const res = await fetch('/api/animals');
  if (!res.ok) throw new Error('Failed to fetch animals');
  const data = await res.json();
  return data.animals || [];
}

export async function fetchAnimalById(id: number | string): Promise<AnimalEntity | null> {
  const res = await fetch(`/api/animal/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.animal || null;
}

export async function fetchDetectionHistory(limit = 100): Promise<DetectionEntity[]> {
  const res = await fetch(`/api/detections?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch detections');
  const data = await res.json();
  return data.detections || [];
}

export async function clearDetectionHistory(): Promise<void> {
  const res = await fetch('/api/detections', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear detections');
}

export async function resetWildlifeTracker(): Promise<void> {
  const res = await fetch('/api/tracker/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset tracker');
}
