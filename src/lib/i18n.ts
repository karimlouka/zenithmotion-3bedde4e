export type Language = 'en' | 'fr' | 'ar';

export const translations = {
  en: {
    title: 'Motion Monitor',
    subtitle: 'Real-time workforce activity tracking',
    sensitivity: 'Sensitivity',
    low: 'Low',
    high: 'High',
    mute: 'Mute',
    unmute: 'Unmute',
    language: 'Language',
    startCamera: 'Start Camera',
    stopCamera: 'Stop Camera',
    loading: 'Loading AI model...',
    active: 'Active',
    inactive: 'Inactive',
    threshold: 'Inactivity Threshold',
    seconds: 'seconds',
    persons: 'Persons Detected',
    footer: 'Motion Monitor MVP — Workforce Activity Tracking Solution',
    cameraError: 'Camera access denied',
    modelError: 'Failed to load detection model',
  },
  fr: {
    title: 'Moniteur de Mouvement',
    subtitle: 'Suivi d\'activité en temps réel',
    sensitivity: 'Sensibilité',
    low: 'Bas',
    high: 'Élevé',
    mute: 'Muet',
    unmute: 'Son',
    language: 'Langue',
    startCamera: 'Démarrer Caméra',
    stopCamera: 'Arrêter Caméra',
    loading: 'Chargement du modèle IA...',
    active: 'Actif',
    inactive: 'Inactif',
    threshold: 'Seuil d\'inactivité',
    seconds: 'secondes',
    persons: 'Personnes Détectées',
    footer: 'Motion Monitor MVP — Solution de Suivi d\'Activité',
    cameraError: 'Accès caméra refusé',
    modelError: 'Échec du chargement du modèle',
  },
  ar: {
    title: 'مراقب الحركة',
    subtitle: 'تتبع نشاط القوى العاملة في الوقت الفعلي',
    sensitivity: 'الحساسية',
    low: 'منخفض',
    high: 'مرتفع',
    mute: 'كتم',
    unmute: 'صوت',
    language: 'اللغة',
    startCamera: 'بدء الكاميرا',
    stopCamera: 'إيقاف الكاميرا',
    loading: 'جاري تحميل نموذج الذكاء الاصطناعي...',
    active: 'نشط',
    inactive: 'غير نشط',
    threshold: 'عتبة عدم النشاط',
    seconds: 'ثواني',
    persons: 'الأشخاص المكتشفون',
    footer: 'Motion Monitor MVP — حل تتبع نشاط القوى العاملة',
    cameraError: 'تم رفض الوصول إلى الكاميرا',
    modelError: 'فشل تحميل نموذج الكشف',
  },
} as const;

export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export const isRTL = (lang: Language): boolean => lang === 'ar';

export type TranslationKey = keyof typeof translations.en;

export const t = (lang: Language, key: TranslationKey): string => {
  return translations[lang][key];
};
