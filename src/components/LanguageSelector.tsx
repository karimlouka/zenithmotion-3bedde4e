import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { languageFlags, languageNames } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: Language[] = ['en', 'fr', 'ar'];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-all duration-300"
      >
        <img 
          src={languageFlags[currentLang]} 
          alt={`${currentLang} flag`}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-foreground">{languageNames[currentLang]}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200
                ${currentLang === lang 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted text-foreground'
                }
              `}
            >
              <img 
                src={languageFlags[lang]} 
                alt={`${lang} flag`}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
