import React from 'react';
import type { Language } from '@/lib/i18n';
import { languageFlags } from '@/lib/i18n';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: Language[] = ['en', 'fr', 'ar'];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-xl
            transition-all duration-300 transform
            ${currentLang === lang 
              ? 'bg-primary/20 ring-2 ring-primary scale-110 animate-pulse-glow' 
              : 'bg-secondary hover:bg-secondary/80 hover:scale-105'
            }
          `}
          aria-label={`Switch to ${lang}`}
        >
          {languageFlags[lang]}
        </button>
      ))}
    </div>
  );
};
