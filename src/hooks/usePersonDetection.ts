import { useRef, useCallback, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DetectedPerson {
  id: string;
  bbox: [number, number, number, number]; // x, y, width, height
  isActive: boolean;
  activeTime: number;
  inactiveTime: number;
  lastPosition: { x: number; y: number };
  alertTriggered: boolean;
}

interface UsePersonDetectionProps {
  sensitivity: number;
  inactivityThreshold: number;
  onInactivityAlert: (personId: string) => void;
}

export const usePersonDetection = ({
  sensitivity,
  inactivityThreshold,
  onInactivityAlert,
}: UsePersonDetectionProps) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persons, setPersons] = useState<DetectedPerson[]>([]);
  
  const personsRef = useRef<Map<string, DetectedPerson>>(new Map());
  const lastUpdateRef = useRef<number>(Date.now());
  const frameCountRef = useRef(0);

  // Load the COCO-SSD model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        await tf.ready();
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2',
        });
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load detection model');
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      // Cleanup
      personsRef.current.clear();
    };
  }, []);

  // Motion threshold based on sensitivity (lower = more sensitive)
  const getMotionThreshold = useCallback(() => {
    // Sensitivity 1-100, convert to pixel threshold 50-5
    return Math.max(5, 50 - (sensitivity * 0.45));
  }, [sensitivity]);

  // Calculate IoU (Intersection over Union) for better matching
  const calculateIoU = useCallback((bbox1: number[], bbox2: number[]): number => {
    const [x1, y1, w1, h1] = bbox1;
    const [x2, y2, w2, h2] = bbox2;

    const xA = Math.max(x1, x2);
    const yA = Math.max(y1, y2);
    const xB = Math.min(x1 + w1, x2 + w2);
    const yB = Math.min(y1 + h1, y2 + h2);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const box1Area = w1 * h1;
    const box2Area = w2 * h2;
    const unionArea = box1Area + box2Area - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }, []);

  // Match new detections to existing persons using IoU and distance
  const matchPersons = useCallback((
    newDetections: Array<{ bbox: [number, number, number, number]; score: number }>,
    existingPersons: Map<string, DetectedPerson>
  ): Map<number, string> => {
    const matches = new Map<number, string>();
    const usedPersonIds = new Set<string>();
    const existingArray = Array.from(existingPersons.entries());

    // Create cost matrix combining IoU and distance
    const costs: Array<{ detIdx: number; personId: string; cost: number }> = [];

    newDetections.forEach((detection, detIdx) => {
      const [x, y, w, h] = detection.bbox;
      const detCenterX = x + w / 2;
      const detCenterY = y + h / 2;

      existingArray.forEach(([personId, person]) => {
        const iou = calculateIoU(detection.bbox, person.bbox);
        const [px, py, pw, ph] = person.bbox;
        const personCenterX = px + pw / 2;
        const personCenterY = py + ph / 2;
        
        const distance = Math.sqrt(
          Math.pow(detCenterX - personCenterX, 2) + 
          Math.pow(detCenterY - personCenterY, 2)
        );

        // Combined score: higher IoU is better, lower distance is better
        // Only consider matches within reasonable distance (200px)
        if (distance < 200 || iou > 0.1) {
          const cost = (1 - iou) * 100 + distance * 0.5;
          costs.push({ detIdx, personId, cost });
        }
      });
    });

    // Sort by cost and greedily assign matches
    costs.sort((a, b) => a.cost - b.cost);

    for (const { detIdx, personId, cost } of costs) {
      if (!matches.has(detIdx) && !usedPersonIds.has(personId) && cost < 150) {
        matches.set(detIdx, personId);
        usedPersonIds.add(personId);
      }
    }

    return matches;
  }, [calculateIoU]);

  // Detect persons in a video frame
  const detectPersons = useCallback(async (
    video: HTMLVideoElement
  ): Promise<DetectedPerson[]> => {
    if (!model || !video || video.readyState < 2) {
      return [];
    }

    // Skip frames for performance (process every 3rd frame)
    frameCountRef.current++;
    if (frameCountRef.current % 3 !== 0) {
      return Array.from(personsRef.current.values());
    }

    try {
      const predictions = await model.detect(video);
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      const motionThreshold = getMotionThreshold();
      const currentPersons = new Map<string, DetectedPerson>();

      // Filter only person detections
      const personPredictions = predictions
        .filter((pred) => pred.class === 'person' && pred.score > 0.5)
        .map((pred) => ({
          bbox: pred.bbox as [number, number, number, number],
          score: pred.score,
        }));

      // Match new detections to existing persons
      const matches = matchPersons(personPredictions, personsRef.current);

      personPredictions.forEach((prediction, idx) => {
        const bbox = prediction.bbox;
        const matchedId = matches.get(idx);
        const personId = matchedId || `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const existingPerson = matchedId ? personsRef.current.get(matchedId) : null;
        const centerX = bbox[0] + bbox[2] / 2;
        const centerY = bbox[1] + bbox[3] / 2;

        let isActive = false;
        let activeTime = 0;
        let inactiveTime = 0;
        let alertTriggered = false;

        if (existingPerson) {
          // Calculate movement based on center position
          const movement = Math.sqrt(
            Math.pow(centerX - existingPerson.lastPosition.x, 2) +
            Math.pow(centerY - existingPerson.lastPosition.y, 2)
          );

          isActive = movement > motionThreshold;

          if (isActive) {
            activeTime = existingPerson.activeTime + deltaTime;
            inactiveTime = 0;
            alertTriggered = false;
          } else {
            activeTime = 0;
            inactiveTime = existingPerson.inactiveTime + deltaTime;
            alertTriggered = existingPerson.alertTriggered;

            // Trigger alert if inactive too long and not already triggered
            if (inactiveTime >= inactivityThreshold && !alertTriggered) {
              alertTriggered = true;
              onInactivityAlert(personId);
            }
          }
        }

        currentPersons.set(personId, {
          id: personId,
          bbox,
          isActive,
          activeTime,
          inactiveTime,
          lastPosition: { x: centerX, y: centerY },
          alertTriggered,
        });
      });

      personsRef.current = currentPersons;
      const personsArray = Array.from(currentPersons.values());
      setPersons(personsArray);
      return personsArray;
    } catch (err) {
      console.error('Detection error:', err);
      return Array.from(personsRef.current.values());
    }
  }, [model, getMotionThreshold, matchPersons, inactivityThreshold, onInactivityAlert]);

  return {
    model,
    isLoading,
    error,
    persons,
    detectPersons,
  };
};
