import React, { useEffect, useRef } from 'react';
import type { DetectedPerson } from '@/hooks/usePersonDetection';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface MonitorCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  persons: DetectedPerson[];
  lang: Language;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const MonitorCanvas: React.FC<MonitorCanvasProps> = ({
  videoRef,
  persons,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (video.readyState < 2) {
        requestAnimationFrame(draw);
        return;
      }

      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each person's bounding box and timer
      persons.forEach((person) => {
        const [x, y, width, height] = person.bbox;
        const isActive = person.isActive;

        // Box styling
        const boxColor = isActive ? '#22c55e' : '#ef4444';
        const glowColor = isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';

        // Draw glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, width, height);

        // Reset shadow for text
        ctx.shadowBlur = 0;

        // Timer badge background
        const time = isActive ? person.activeTime : person.inactiveTime;
        const timeText = formatTime(time);
        const statusText = isActive ? t(lang, 'active') : t(lang, 'inactive');
        const labelText = `${statusText}: ${timeText}`;

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const textMetrics = ctx.measureText(labelText);
        const padding = 5;
        const badgeHeight = 18;
        const badgeWidth = textMetrics.width + padding * 2;

        // Position badge above box
        const badgeX = x + (width - badgeWidth) / 2;
        const badgeY = y - badgeHeight - 5;

        // Badge background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 3);
        ctx.fill();

        // Badge border
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Badge text
        ctx.fillStyle = boxColor;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

        // Corner accents
        const cornerSize = 8;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = boxColor;

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        ctx.stroke();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(x + width - cornerSize, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + cornerSize);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + height - cornerSize);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + cornerSize, y + height);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(x + width - cornerSize, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + height - cornerSize);
        ctx.stroke();
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [persons, videoRef, lang]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ objectFit: 'contain' }}
    />
  );
};
