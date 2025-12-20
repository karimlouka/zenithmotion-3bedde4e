export type Language = 'en' | 'fr' | 'ar';

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

export const translations = {
  en: {
    title: 'Zenith Motion',
    subtitle: 'Solutions Beyond Limits',
    description: 'Advanced AI-powered workforce monitoring system. Track multiple workers in real-time, detect activity patterns, and receive instant alerts for inactivity.',
    feature1: 'Real-time Detection',
    feature2: 'Multi-person Tracking',
    feature3: 'Smart Alerts',
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
    minutes: 'min',
    persons: 'Persons Detected',
    activePersons: 'Active Persons',
    footer: 'Zenith Motion — AI Workforce Activity Tracking',
    cameraError: 'Camera access denied',
    modelError: 'Failed to load detection model',
  },
  fr: {
    title: 'Zenith Motion',
    subtitle: 'Solutions au-delà des limites',
    description: 'Système de surveillance avancé alimenté par l\'IA. Suivez plusieurs travailleurs en temps réel, détectez les modèles d\'activité et recevez des alertes instantanées.',
    feature1: 'Détection en temps réel',
    feature2: 'Suivi multi-personnes',
    feature3: 'Alertes intelligentes',
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
    minutes: 'min',
    persons: 'Personnes Détectées',
    activePersons: 'Personnes Actives',
    footer: 'Zenith Motion — Suivi d\'Activité par IA',
    cameraError: 'Accès caméra refusé',
    modelError: 'Échec du chargement du modèle',
  },
  ar: {
    title: 'زينيث موشن',
    subtitle: 'حلول بلا حدود',
    description: 'نظام مراقبة متقدم بالذكاء الاصطناعي. تتبع عدة عمال في الوقت الفعلي، واكتشف أنماط النشاط، واحصل على تنبيهات فورية لعدم النشاط.',
    feature1: 'كشف فوري',
    feature2: 'تتبع متعدد',
    feature3: 'تنبيهات ذكية',
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
    minutes: 'دقيقة',
    persons: 'الأشخاص المكتشفون',
    activePersons: 'الأشخاص المتحركون',
    footer: 'زينيث موشن — تتبع نشاط بالذكاء الاصطناعي',
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
