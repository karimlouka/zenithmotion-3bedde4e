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
    <div className="flex items-center gap-3">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
            transition-all duration-300 transform border-2
            ${currentLang === lang 
              ? 'border-primary scale-110 shadow-lg shadow-primary/30' 
              : 'border-transparent hover:border-primary/50 hover:scale-105'
            }
          `}
          aria-label={`Switch to ${lang}`}
        >
          <img 
            src={languageFlags[lang]} 
            alt={`${lang} flag`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};
