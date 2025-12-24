import React, { useState, useCallback } from 'react';
import { VideoMonitor } from '@/components/VideoMonitor';
import { ControlPanel } from '@/components/ControlPanel';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CameraSelector } from '@/components/CameraSelector';
import type { Language } from '@/lib/i18n';
import { t, isRTL } from '@/lib/i18n';
import { Eye, Users, Bell } from 'lucide-react';
import zenithLogo from '@/assets/zenith-logo.png';

const Index: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [sensitivity, setSensitivity] = useState(50);
  const [inactivityThreshold, setInactivityThreshold] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [personsCount, setPersonsCount] = useState(0);
  const [activePersonsCount, setActivePersonsCount] = useState(0);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const rtl = isRTL(lang);

  const handleCameraError = useCallback(() => {
    setIsCameraActive(false);
  }, []);

  const features = [
    { icon: Eye, key: 'feature1' as const },
    { icon: Users, key: 'feature2' as const },
    { icon: Bell, key: 'feature3' as const },
  ];

  return (
    <div className={`min-h-screen bg-background ${rtl ? 'rtl' : ''}`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={zenithLogo} 
                alt="Zenith Logo" 
                className="h-12 w-auto animate-float"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  {t(lang, 'title')}
                </h1>
                <p className="text-sm text-primary">{t(lang, 'subtitle')}</p>
              </div>
            </div>
            <LanguageSelector currentLang={lang} onLanguageChange={setLang} />
          </div>
        </div>
      </header>

      {/* Hero Description Section */}
      <section className="bg-gradient-to-b from-card/80 to-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {t(lang, 'description')}
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              {features.map(({ icon: Icon, key }, index) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30 transition-all duration-300 hover:bg-primary/20 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {t(lang, key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Video Monitor */}
          <div className="space-y-4">
            <CameraSelector
              lang={lang}
              selectedDeviceId={selectedCameraId}
              onDeviceChange={setSelectedCameraId}
              disabled={isCameraActive}
            />
            <VideoMonitor
              lang={lang}
              sensitivity={sensitivity}
              inactivityThreshold={inactivityThreshold}
              isMuted={isMuted}
              isCameraActive={isCameraActive}
              selectedCameraId={selectedCameraId}
              onPersonsChange={(count, activeCount) => {
                setPersonsCount(count);
                setActivePersonsCount(activeCount);
              }}
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
              activePersonsCount={activePersonsCount}
              onSensitivityChange={setSensitivity}
              onThresholdChange={setInactivityThreshold}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onCameraToggle={() => setIsCameraActive(!isCameraActive)}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={zenithLogo} alt="Zenith" className="h-8 w-auto opacity-70" />
              <p className="text-sm text-muted-foreground">
                {t(lang, 'footer')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Zenith Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
