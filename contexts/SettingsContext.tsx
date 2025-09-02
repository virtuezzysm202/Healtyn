import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'id' | 'en';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      const savedTheme = await AsyncStorage.getItem('app_theme');
      
      if (savedLanguage) {
        setLanguageState(savedLanguage as Language);
      }
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};