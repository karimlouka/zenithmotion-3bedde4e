import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Volume2, VolumeX, Camera, CameraOff, Globe } from 'lucide-react';
import type { Language } from '@/lib/i18n';
import { t, languageNames, isRTL } from '@/lib/i18n';

interface ControlPanelProps {
  lang: Language;
  sensitivity: number;
  inactivityThreshold: number;
  isMuted: boolean;
  isCameraActive: boolean;
  personsCount: number;
  activePersonsCount: number;
  onLanguageChange: (lang: Language) => void;
  onSensitivityChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  lang,
  sensitivity,
  inactivityThreshold,
  isMuted,
  isCameraActive,
  personsCount,
  activePersonsCount,
  onLanguageChange,
  onSensitivityChange,
  onThresholdChange,
  onMuteToggle,
  onCameraToggle,
}) => {
  const rtl = isRTL(lang);

  return (
    <div className={`control-panel space-y-5 ${rtl ? 'rtl' : ''}`}>
      {/* Language Selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{t(lang, 'language')}</span>
        </div>
        <Select value={lang} onValueChange={(v) => onLanguageChange(v as Language)}>
          <SelectTrigger className="w-32 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languageNames).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Persons Count */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <span className="text-sm text-muted-foreground">{t(lang, 'persons')}</span>
        <span className="font-mono text-lg font-semibold text-primary">{personsCount}</span>
      </div>

      {/* Active Persons Count */}
      <div className="flex items-center justify-between p-3 bg-active/20 rounded-lg border border-active/30">
        <span className="text-sm text-muted-foreground">{t(lang, 'activePersons')}</span>
        <span className="font-mono text-lg font-semibold text-active">{activePersonsCount}</span>
      </div>

      {/* Sensitivity Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">{t(lang, 'sensitivity')}</span>
          <span className="font-mono text-xs text-muted-foreground">{sensitivity}%</span>
        </div>
        <Slider
          value={[sensitivity]}
          onValueChange={([v]) => onSensitivityChange(v)}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t(lang, 'low')}</span>
          <span>{t(lang, 'high')}</span>
        </div>
      </div>

      {/* Inactivity Threshold */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">{t(lang, 'threshold')}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {inactivityThreshold >= 60 
              ? `${Math.floor(inactivityThreshold / 60)}:${(inactivityThreshold % 60).toString().padStart(2, '0')} ${t(lang, 'minutes')}`
              : `${inactivityThreshold} ${t(lang, 'seconds')}`
            }
          </span>
        </div>
        <Slider
          value={[inactivityThreshold]}
          onValueChange={([v]) => onThresholdChange(v)}
          min={3}
          max={300}
          step={1}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant={isMuted ? 'secondary' : 'default'}
          size="sm"
          onClick={onMuteToggle}
          className="flex-1 gap-2"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4" />
              {t(lang, 'unmute')}
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              {t(lang, 'mute')}
            </>
          )}
        </Button>
        <Button
          variant={isCameraActive ? 'destructive' : 'default'}
          size="sm"
          onClick={onCameraToggle}
          className="flex-1 gap-2"
        >
          {isCameraActive ? (
            <>
              <CameraOff className="w-4 h-4" />
              {t(lang, 'stopCamera')}
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              {t(lang, 'startCamera')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
