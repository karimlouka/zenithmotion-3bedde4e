import React, { useState, useCallback } from 'react';
import { VideoMonitor } from '@/components/VideoMonitor';
import { ControlPanel } from '@/components/ControlPanel';
import type { Language } from '@/lib/i18n';
import { t, isRTL } from '@/lib/i18n';
import { Activity } from 'lucide-react';

const Index: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [sensitivity, setSensitivity] = useState(50);
  const [inactivityThreshold, setInactivityThreshold] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [personsCount, setPersonsCount] = useState(0);

  const rtl = isRTL(lang);

  const handleCameraError = useCallback(() => {
    setIsCameraActive(false);
  }, []);

  return (
    <div className={`min-h-screen bg-background ${rtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {t(lang, 'title')}
              </h1>
              <p className="text-sm text-muted-foreground">{t(lang, 'subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Video Monitor */}
          <div className="space-y-4">
            <VideoMonitor
              lang={lang}
              sensitivity={sensitivity}
              inactivityThreshold={inactivityThreshold}
              isMuted={isMuted}
              isCameraActive={isCameraActive}
              onPersonsChange={setPersonsCount}
              onCameraError={handleCameraError}
            />
          </div>

          {/* Control Panel */}
          <aside>
            <ControlPanel
              lang={lang}
              sensitivity={sensitivity}
              inactivityThreshold={inactivityThreshold}
              isMuted={isMuted}
              isCameraActive={isCameraActive}
              personsCount={personsCount}
              onLanguageChange={setLang}
              onSensitivityChange={setSensitivity}
              onThresholdChange={setInactivityThreshold}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onCameraToggle={() => setIsCameraActive(!isCameraActive)}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            {t(lang, 'footer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
