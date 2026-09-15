import { IncomingMessage, ServerResponse } from 'http';
import {
  runZeroShotInference,
  DEFAULT_CONFIDENCE_THRESHOLD,
  DetectionResult,
  RawPrediction
} from './classifierEngine';
import {
  getAllAnimals,
  getAnimalById,
  getAnimalByClassIndex,
  recordDetection,
  getAllDetections,
  clearAllDetections
} from './sqliteDb';
import { globalWildlifeTracker } from './tracker';

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Safeguard max upload size (30MB)
      if (body.length > 30 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  // Health check
  if (pathname === '/api/health') {
    sendJson(res, { status: 'ok', service: 'wildlife-tracking-api', timestamp: new Date().toISOString() });
    return true;
  }

  // 1. GET /api/animals
  if (pathname === '/api/animals' && method === 'GET') {
    try {
      const animals = getAllAnimals();
      sendJson(res, {
        success: true,
        count: animals.length,
        animals
      });
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message }, 500);
    }
    return true;
  }

  // 2. GET /api/animal/:id
  if (pathname.startsWith('/api/animal/') && method === 'GET') {
    try {
      const idStr = pathname.replace('/api/animal/', '').trim();
      const animal = getAnimalById(idStr);
      if (!animal) {
        sendJson(res, { success: false, error: 'Animal not found' }, 404);
      } else {
        sendJson(res, { success: true, animal });
      }
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message }, 500);
    }
    return true;
  }

  // 3. GET /api/detections
  if (pathname === '/api/detections' && method === 'GET') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const detections = getAllDetections(limit);
      sendJson(res, {
        success: true,
        count: detections.length,
        detections
      });
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message }, 500);
    }
    return true;
  }

  // 4. DELETE /api/detections
  if (pathname === '/api/detections' && method === 'DELETE') {
    try {
      const result = clearAllDetections();
      globalWildlifeTracker.reset();
      sendJson(res, { success: true, ...result });
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message }, 500);
    }
    return true;
  }

  // 5. POST /api/detect/image
  if (pathname === '/api/detect/image' && method === 'POST') {
    try {
      const startTime = Date.now();
      const body = await parseBody(req);
      const imageBase64 = body.image || '';
      const mimeType = body.mimeType || 'image/jpeg';
      const filename = body.filename || '';
      const threshold = typeof body.confidenceThreshold === 'number' ? body.confidenceThreshold : DEFAULT_CONFIDENCE_THRESHOLD;

      if (!imageBase64) {
        sendJson(res, {
          success: false,
          error: 'Missing image data (base64 string required)',
          status: 'error',
          has_detection: false,
          message: 'No image provided for analysis.'
        }, 400);
        return true;
      }

      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

      const inference = await runZeroShotInference(cleanBase64, mimeType, filename);
      const inferenceMs = Date.now() - startTime;

      if (!inference.detected || inference.predictions.length === 0) {
        sendJson(res, {
          success: true,
          has_detection: false,
          status: 'no_detection',
          message: 'No supported animal detected.',
          count: 0,
          model_type: inference.modelSource,
          model_inference_ms: inferenceMs,
          detections: []
        });
        return true;
      }

      // Check against threshold
      const allDetections: any[] = [];
      let anyAboveThreshold = false;

      for (const pred of inference.predictions) {
        const animalInfo = getAnimalByClassIndex(pred.class_index);
        const isAbove = pred.confidence >= threshold;
        if (isAbove) anyAboveThreshold = true;

        let detRecordId: number | null = null;
        let detectedAt = new Date().toISOString();

        // Only persist if above threshold or detected
        if (isAbove) {
          const rec = recordDetection({
            animal_id: animalInfo?.animal_id ?? null,
            animal_name: animalInfo?.animal_name || pred.animal_name,
            confidence: pred.confidence,
            detection_type: 'image',
            tracking_id: null,
            image_path: filename || 'uploaded_image',
            bbox: pred.bbox
          });
          detRecordId = rec.detection_id;
          detectedAt = rec.detected_at;
        }

        allDetections.push({
          detection_id: detRecordId,
          animal_id: animalInfo?.animal_id ?? null,
          animal_name: animalInfo?.animal_name || pred.animal_name,
          scientific_name: animalInfo?.scientific_name || '',
          class_index: pred.class_index,
          description: animalInfo?.description || '',
          confidence: pred.confidence,
          confidence_display: `${(pred.confidence * 100).toFixed(1)}%`,
          bbox: pred.bbox,
          detected_at: detectedAt
        });
      }

      if (!anyAboveThreshold) {
        sendJson(res, {
          success: true,
          has_detection: true,
          status: 'low_confidence',
          message: 'Animal detected, but species could not be identified with sufficient confidence.',
          count: 0,
          model_type: inference.modelSource,
          model_inference_ms: inferenceMs,
          detections: allDetections
        });
        return true;
      }

      sendJson(res, {
        success: true,
        has_detection: true,
        status: 'identified',
        message: `Successfully classified ${allDetections.length} wildlife specimen(s)`,
        count: allDetections.length,
        model_type: inference.modelSource,
        model_inference_ms: inferenceMs,
        detections: allDetections
      });
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message, status: 'error' }, 500);
    }
    return true;
  }

  // 6. POST /api/detect/webcam
  if (pathname === '/api/detect/webcam' && method === 'POST') {
    try {
      const startTime = Date.now();
      const body = await parseBody(req);
      const imageBase64 = body.image || '';
      const mimeType = body.mimeType || 'image/jpeg';
      const threshold = typeof body.confidenceThreshold === 'number' ? body.confidenceThreshold : DEFAULT_CONFIDENCE_THRESHOLD;

      if (!imageBase64) {
        sendJson(res, {
          success: false,
          error: 'Missing frame data',
          status: 'error',
          has_detection: false
        }, 400);
        return true;
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      const inference = await runZeroShotInference(cleanBase64, mimeType);
      const inferenceMs = Date.now() - startTime;

      if (!inference.detected || inference.predictions.length === 0) {
        sendJson(res, {
          success: true,
          has_detection: false,
          status: 'no_detection',
          message: 'No supported animal detected.',
          count: 0,
          unique_track_count: globalWildlifeTracker.getUniqueCount(),
          model_type: inference.modelSource,
          model_inference_ms: inferenceMs,
          detections: []
        });
        return true;
      }

      // Update tracker with detected instances
      const validPredictions = inference.predictions.filter(p => p.confidence >= threshold);

      let trackedResults: any[] = [];
      if (validPredictions.length > 0) {
        trackedResults = globalWildlifeTracker.update(validPredictions);
      }

      const allDetections: any[] = [];
      for (const pred of inference.predictions) {
        const animalInfo = getAnimalByClassIndex(pred.class_index);
        const isAbove = pred.confidence >= threshold;
        const tracked = trackedResults.find(t => t.class_index === pred.class_index);
        const trackingId = tracked?.tracking_id || null;

        let detRecordId: number | null = null;
        let detectedAt = new Date().toISOString();

        if (isAbove) {
          const rec = recordDetection({
            animal_id: animalInfo?.animal_id ?? null,
            animal_name: animalInfo?.animal_name || pred.animal_name,
            confidence: pred.confidence,
            detection_type: 'webcam',
            tracking_id: trackingId,
            image_path: 'webcam_stream',
            bbox: pred.bbox
          });
          detRecordId = rec.detection_id;
          detectedAt = rec.detected_at;
        }

        allDetections.push({
          detection_id: detRecordId,
          animal_id: animalInfo?.animal_id ?? null,
          animal_name: animalInfo?.animal_name || pred.animal_name,
          scientific_name: animalInfo?.scientific_name || '',
          class_index: pred.class_index,
          description: animalInfo?.description || '',
          confidence: pred.confidence,
          confidence_display: `${(pred.confidence * 100).toFixed(1)}%`,
          tracking_id: trackingId,
          bbox: pred.bbox,
          detected_at: detectedAt
        });
      }

      if (validPredictions.length === 0) {
        sendJson(res, {
          success: true,
          has_detection: true,
          status: 'low_confidence',
          message: 'Animal detected, but species could not be identified with sufficient confidence.',
          count: 0,
          unique_track_count: globalWildlifeTracker.getUniqueCount(),
          model_type: inference.modelSource,
          model_inference_ms: inferenceMs,
          detections: allDetections
        });
        return true;
      }

      sendJson(res, {
        success: true,
        has_detection: true,
        status: 'identified',
        message: `Detected ${validPredictions.length} wildlife specimen(s)`,
        count: validPredictions.length,
        unique_track_count: globalWildlifeTracker.getUniqueCount(),
        active_track_count: globalWildlifeTracker.getActiveCount(),
        model_type: inference.modelSource,
        model_inference_ms: inferenceMs,
        detections: allDetections
      });
    } catch (err: any) {
      sendJson(res, { success: false, error: err?.message, status: 'error' }, 500);
    }
    return true;
  }

  // 7. POST /api/tracker/reset
  if (pathname === '/api/tracker/reset' && method === 'POST') {
    globalWildlifeTracker.reset();
    sendJson(res, { success: true, message: 'Tracker state reset' });
    return true;
  }

  return false;
}
