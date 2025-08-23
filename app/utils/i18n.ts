import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import en from "../locales/en.json";
import id from "../locales/id.json";

type Language = "id" | "en";
type TranslationMap = Record<string, any>;

class EfficientI18n {
  private currentLanguage: Language = "id";
  private translations: Record<Language, TranslationMap> = {
    id,
    en,
  };
  private listeners: Array<(language: Language) => void> = [];

  constructor() {
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      const savedLanguage = (await AsyncStorage.getItem("app_language")) as Language | null;

      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      } else {
        // Menggunakan expo-localization API
        const systemLanguage = Localization.getLocales()[0]?.languageCode as Language;
        if (this.isValidLanguage(systemLanguage)) {
          this.currentLanguage = systemLanguage;
        }
      }
    } catch (error) {
      console.warn("Failed to initialize language:", error);
      this.currentLanguage = "id";
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ["id", "en"].includes(lang);
  }

  async changeLanguage(language: Language): Promise<void> {
    if (this.currentLanguage === language) return;

    this.currentLanguage = language;
    try {
      await AsyncStorage.setItem("app_language", language);
    } catch (error) {
      console.warn("Failed to save language preference:", error);
    }

    this.listeners.forEach((listener) => listener(language));
  }

  translate(key: string, params?: Record<string, string>): string {
    const currentTranslations = this.translations[this.currentLanguage] || {};
    const value = key.split(".").reduce((obj, k) => obj?.[k], currentTranslations);

    if (typeof value !== "string") {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
      return key;
    }

    if (params) {
        return Object.entries(params).reduce<string>(
          (text, [param, replacement]) => text.replace(`{{${param}}}`, replacement),
          value as string
        );
      }

    return value;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  getAvailableLanguages(): Language[] {
    return ["id", "en"];
  }

  subscribe(listener: (language: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const i18n = new EfficientI18n();
export default i18n;