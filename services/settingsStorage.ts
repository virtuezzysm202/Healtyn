import AsyncStorage from "@react-native-async-storage/async-storage";

// ========================
// Profile
// ========================
export type OfflineProfile = {
  name: string;
  age: string;
  address: string;
};

const PROFILE_KEY = "offline_profile";

export const saveOfflineProfile = async (profile: OfflineProfile) => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const getOfflineProfile = async (): Promise<OfflineProfile | null> => {
  try {
    const result = await AsyncStorage.getItem(PROFILE_KEY);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error("Error loading profile:", error);
    return null;
  }
};

// ========================
// Settings: Language
// ========================
const LANGUAGE_KEY = "app_language";

export const saveLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error("Error saving language:", error);
    throw error;
  }
};

export const getLanguage = async (): Promise<"id" | "en"> => {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang === "en" ? "en" : "id";
  } catch (error) {
    console.error("Error loading language:", error);
    return "id"; // Default fallback
  }
};

// ========================
// Clear all data (utility function)
// ========================
export const clearAllSettings = async () => {
  try {
    await AsyncStorage.multiRemove([PROFILE_KEY, LANGUAGE_KEY]);
  } catch (error) {
    console.error("Error clearing settings:", error);
    throw error;
  }
};