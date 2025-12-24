import React, { useState, useEffect, useRef } from 'react';
import { Video, ChevronDown } from 'lucide-react';
import type { Language } from '@/lib/i18n';
import { t, isRTL } from '@/lib/i18n';

interface CameraSelectorProps {
  lang: Language;
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({
  lang,
  selectedDeviceId,
  onDeviceChange,
  disabled = false,
}) => {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rtl = isRTL(lang);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices
          .filter(device => device.kind === 'videoinput')
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `${t(lang, 'camera')} ${index + 1}`,
          }));
        
        setDevices(videoDevices);
        
        // Auto-select first device if none selected
        if (!selectedDeviceId && videoDevices.length > 0) {
          onDeviceChange(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting camera devices:', error);
      }
    };

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [lang, selectedDeviceId, onDeviceChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

  if (devices.length <= 1) {
    return null; // Don't show selector if only one camera
  }

  return (
    <div ref={dropdownRef} className={`relative ${rtl ? 'rtl' : ''}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 w-full
          bg-secondary/50 hover:bg-secondary/70 
          border border-border rounded-lg
          text-sm text-foreground
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Video className="w-4 h-4 text-primary" />
        <span className="flex-1 text-start truncate">
          {selectedDevice?.label || t(lang, 'selectCamera')}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className={`
            absolute top-full mt-1 w-full z-20
            bg-card border border-border rounded-lg shadow-lg
            overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200
          `}
        >
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => {
                onDeviceChange(device.deviceId);
                setIsOpen(false);
              }}
              className={`
                flex items-center gap-2 px-3 py-2.5 w-full
                text-sm text-start transition-colors
                ${device.deviceId === selectedDeviceId 
                  ? 'bg-primary/20 text-primary' 
                  : 'hover:bg-secondary/50 text-foreground'
                }
              `}
            >
              <Video className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{device.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
