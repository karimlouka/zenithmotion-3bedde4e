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

  // Generate stable ID for a person based on position
  const generatePersonId = useCallback((bbox: number[], existingPersons: Map<string, DetectedPerson>): string => {
    const [x, y, width, height] = bbox;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Find the closest existing person within a reasonable distance
    let closestId: string | null = null;
    let closestDistance = Infinity;

    existingPersons.forEach((person, id) => {
      const [px, py, pw, ph] = person.bbox;
      const personCenterX = px + pw / 2;
      const personCenterY = py + ph / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - personCenterX, 2) + Math.pow(centerY - personCenterY, 2)
      );

      // Allow matching within 150 pixels
      if (distance < 150 && distance < closestDistance) {
        closestDistance = distance;
        closestId = id;
      }
    });

    return closestId || `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

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
      const seenIds = new Set<string>();

      // Filter only person detections
      const personPredictions = predictions.filter(
        (pred) => pred.class === 'person' && pred.score > 0.5
      );

      for (const prediction of personPredictions) {
        const bbox = prediction.bbox as [number, number, number, number];
        const personId = generatePersonId(bbox, personsRef.current);
        
        if (seenIds.has(personId)) continue;
        seenIds.add(personId);

        const existingPerson = personsRef.current.get(personId);
        const centerX = bbox[0] + bbox[2] / 2;
        const centerY = bbox[1] + bbox[3] / 2;

        let isActive = false;
        let activeTime = 0;
        let inactiveTime = 0;
        let alertTriggered = false;

        if (existingPerson) {
          // Calculate movement
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
      }

      personsRef.current = currentPersons;
      const personsArray = Array.from(currentPersons.values());
      setPersons(personsArray);
      return personsArray;
    } catch (err) {
      console.error('Detection error:', err);
      return Array.from(personsRef.current.values());
    }
  }, [model, getMotionThreshold, generatePersonId, inactivityThreshold, onInactivityAlert]);

  return {
    model,
    isLoading,
    error,
    persons,
    detectPersons,
  };
};
