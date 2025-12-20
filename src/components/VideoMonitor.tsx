import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MonitorCanvas } from './MonitorCanvas';
import { usePersonDetection } from '@/hooks/usePersonDetection';
import { playAlertSound } from '@/lib/audio';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { Loader2, AlertCircle } from 'lucide-react';

interface VideoMonitorProps {
  lang: Language;
  sensitivity: number;
  inactivityThreshold: number;
  isMuted: boolean;
  isCameraActive: boolean;
  onPersonsChange: (count: number, activeCount: number) => void;
  onCameraError: () => void;
}

export const VideoMonitor: React.FC<VideoMonitorProps> = ({
  lang,
  sensitivity,
  inactivityThreshold,
  isMuted,
  isCameraActive,
  onPersonsChange,
  onCameraError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleInactivityAlert = useCallback(
    (personId: string) => {
      playAlertSound(isMuted);
    },
    [isMuted]
  );

  const { isLoading, error, persons, detectPersons } = usePersonDetection({
    sensitivity,
    inactivityThreshold,
    onInactivityAlert: handleInactivityAlert,
  });

  // Update persons count
  useEffect(() => {
    const activeCount = persons.filter(p => p.isActive).length;
    onPersonsChange(persons.length, activeCount);
  }, [persons, onPersonsChange]);

  // Detection loop
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !isCameraActive) return;

    await detectPersons(videoRef.current);
    animationFrameRef.current = requestAnimationFrame(runDetection);
  }, [detectPersons, isCameraActive]);

  // Start/stop camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          runDetection();
        }
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError(t(lang, 'cameraError'));
        onCameraError();
      }
    };

    const stopCamera = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive, lang, onCameraError, runDetection]);

  // Restart detection when sensitivity changes
  useEffect(() => {
    if (isCameraActive && !animationFrameRef.current) {
      runDetection();
    }
  }, [sensitivity, isCameraActive, runDetection]);

  const showLoading = isLoading && isCameraActive;
  const showError = (error || cameraError) && isCameraActive;

  return (
    <div className="relative w-full aspect-video bg-secondary/30 rounded-lg overflow-hidden border border-border">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted
        playsInline
        autoPlay
      />

      {/* Detection canvas overlay */}
      {isCameraActive && <MonitorCanvas videoRef={videoRef} persons={persons} lang={lang} />}

      {/* Loading overlay */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="font-medium">{t(lang, 'loading')}</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {showError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-destructive">
            <AlertCircle className="w-10 h-10" />
            <span className="font-medium">{error || cameraError}</span>
          </div>
        </div>
      )}

      {/* Idle state */}
      {!isCameraActive && !showError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/50 animate-pulse" />
            </div>
            <span className="text-sm">{t(lang, 'startCamera')}</span>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isCameraActive && !showLoading && !showError && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-glow" />
          <span className="font-mono text-xs text-foreground">LIVE</span>
        </div>
      )}
    </div>
  );
};
