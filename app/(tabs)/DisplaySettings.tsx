import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function DisplaySettings() {
  const { theme, setLanguage, setTheme } = useSettings();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const router = useRouter();

  const goBack = () => {
    router.push("/(tabs)/settings");
  };

  const handleLanguageChange = async (newLanguage: "id" | "en") => {
    setLanguage(newLanguage);
    await changeLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const isDark = theme === "dark";

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#60a5fa" : "#3b82f6"}
            />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {t("display.title")}
          </Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsContainer}>
          {/* Language Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              {t("display.language")}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                isDark && styles.sectionDescriptionDark,
              ]}
            >
              {t("display.languageDesc")}
            </Text>

            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  currentLanguage === "id" && styles.optionItemActive,
                ]}
                onPress={() => handleLanguageChange("id")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isDark && styles.optionTextDark,
                    currentLanguage === "id" && styles.optionTextActive,
                  ]}
                >
                  {t("display.indonesian")}
                </Text>
                {currentLanguage === "id" && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  currentLanguage === "en" && styles.optionItemActive,
                ]}
                onPress={() => handleLanguageChange("en")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isDark && styles.optionTextDark,
                    currentLanguage === "en" && styles.optionTextActive,
                  ]}
                >
                  {t("display.english")}
                </Text>
                {currentLanguage === "en" && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              {t("display.theme")}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                isDark && styles.sectionDescriptionDark,
              ]}
            >
              {t("display.themeDesc")}
            </Text>

            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  theme === "light" && styles.optionItemActive,
                ]}
                onPress={() => handleThemeChange("light")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isDark && styles.optionTextDark,
                    theme === "light" && styles.optionTextActive,
                  ]}
                >
                  ☀️ {t("display.lightTheme")}
                </Text>
                {theme === "light" && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  theme === "dark" && styles.optionItemActive,
                ]}
                onPress={() => handleThemeChange("dark")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isDark && styles.optionTextDark,
                    theme === "dark" && styles.optionTextActive,
                  ]}
                >
                  🌙 {t("display.darkTheme")}
                </Text>
                {theme === "dark" && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  containerDark: { backgroundColor: "#1a1a1a" },
  content: { padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
    marginRight: 40, 
  },
  titleDark: { color: "#ffffff" },
  settingsContainer: { gap: 32 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  sectionTitleDark: { color: "#ffffff" },
  sectionDescription: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  sectionDescriptionDark: { color: "#9ca3af" },
  optionContainer: { gap: 12 },
  optionItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItemDark: { backgroundColor: "#2d2d2d", borderColor: "#404040" },
  optionItemActive: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  optionText: { fontSize: 16, color: "#1a1a1a", fontWeight: "500" },
  optionTextDark: { color: "#ffffff" },
  optionTextActive: { color: "#3b82f6" },
  checkmark: { fontSize: 18, color: "#3b82f6", fontWeight: "600" },
});