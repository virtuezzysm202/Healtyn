import { useCallback, useEffect, useState } from 'react';
import i18n from '../app/utils/i18n';

type Language = 'id' | 'en'; // ✅ hanya indo & english

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    i18n.getCurrentLanguage()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = i18n.subscribe((language) => {
      setCurrentLanguage(language as Language);
    });

    return unsubscribe;
  }, []);

  const changeLanguage = useCallback(async (language: Language) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      return i18n.translate(key, params);
    },
    [currentLanguage] // ✅ supaya rerender saat bahasa berubah
  );


  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    availableLanguages: i18n.getAvailableLanguages(),
  };
};
