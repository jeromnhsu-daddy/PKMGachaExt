import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { translations, Language } from '../i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLang?: Language; onLangChange?: (lang: Language) => void }> = ({ 
  children, 
  initialLang = 'en',
  onLangChange
}) => {
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (onLangChange) onLangChange(newLang);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const langTranslations = translations[lang] || translations['en'];
    let text = (langTranslations as any)[key] || (translations['en'] as any)[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
