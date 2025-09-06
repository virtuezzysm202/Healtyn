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

const translations = {
  id: {
    title: "Masuk / Daftar",
    login: "Masuk",
    register: "Daftar",
    loginDesc: "Masuk ke akun yang sudah ada",
    registerDesc: "Buat akun baru",
    comingSoon: "Fitur ini akan segera hadir!",
  },
  en: {
    title: "Sign In / Sign Up",
    login: "Sign In",
    register: "Sign Up",
    loginDesc: "Sign in to existing account",
    registerDesc: "Create a new account",
    comingSoon: "This feature is coming soon!",
  },
};

export default function AuthScreen() {
  const { language, theme } = useSettings();
  const t = translations[language];
  const router = useRouter();
  const isDark = theme === "dark";

  const goBack = () => {
    router.replace("/(tabs)/settings"); // langsung balik ke settings
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {t.title}
          </Text>
        </View>

        {/* Auth Options */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.authButton, isDark && styles.authButtonDark]}
            activeOpacity={0.7}
          >
            <View style={styles.authIconContainer}>
              <Text style={styles.authIcon}>🔑</Text>
            </View>
            <View style={styles.authContent}>
              <Text style={[styles.authTitle, isDark && styles.authTitleDark]}>
                {t.login}
              </Text>
              <Text
                style={[
                  styles.authDescription,
                  isDark && styles.authDescriptionDark,
                ]}
              >
                {t.loginDesc}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, isDark && styles.authButtonDark]}
            activeOpacity={0.7}
          >
            <View style={styles.authIconContainer}>
              <Text style={styles.authIcon}>📝</Text>
            </View>
            <View style={styles.authContent}>
              <Text style={[styles.authTitle, isDark && styles.authTitleDark]}>
                {t.register}
              </Text>
              <Text
                style={[
                  styles.authDescription,
                  isDark && styles.authDescriptionDark,
                ]}
              >
                {t.registerDesc}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Coming Soon */}
        <View
          style={[
            styles.comingSoonContainer,
            isDark && styles.comingSoonContainerDark,
          ]}
        >
          <Text
            style={[
              styles.comingSoonText,
              isDark && styles.comingSoonTextDark,
            ]}
          >
            {t.comingSoon}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  containerDark: {
    backgroundColor: "#1a1a1a",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    flex: 1,
    zIndex: 1,
  },
  titleDark: {
    color: "#ffffff",
  },
  authContainer: {
    gap: 16,
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDark: {
    backgroundColor: "#2d2d2d",
  },
  authIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  authIcon: {
    fontSize: 24,
  },
  authContent: {
    flex: 1,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  authTitleDark: {
    color: "#ffffff",
  },
  authDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  authDescriptionDark: {
    color: "#9ca3af",
  },
  comingSoonContainer: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  comingSoonContainerDark: {
    backgroundColor: "#451a03",
  },
  comingSoonText: {
    fontSize: 16,
    color: "#92400e",
    fontWeight: "500",
    textAlign: "center",
  },
  comingSoonTextDark: {
    color: "#fbbf24",
  },
});
