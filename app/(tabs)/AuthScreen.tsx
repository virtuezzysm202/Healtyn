import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../contexts/SettingsContext";

const translations = {
  id: {
    title: "Masuk / Daftar",
    login: "Masuk",
    register: "Daftar",
    loginDesc: "Masuk ke akun yang sudah ada",
    registerDesc: "Buat akun baru",
    back: "Kembali",
    comingSoon: "Fitur ini akan segera hadir!",
  },
  en: {
    title: "Sign In / Sign Up",
    login: "Sign In",
    register: "Sign Up", 
    loginDesc: "Sign in to existing account",
    registerDesc: "Create a new account",
    back: "Back",
    comingSoon: "This feature is coming soon!",
  },
};

export default function AuthScreen() {
  const { language, theme } = useSettings();
  const t = translations[language];
  const router = useRouter();
  const isDark = theme === 'dark';

  const goBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/settings");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/(tabs)/settings");
    }
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        isDark && styles.containerDark
      ]} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={[
              styles.backButtonText,
              isDark && styles.backButtonTextDark
            ]}>
              ‹ {t.back}
            </Text>
          </TouchableOpacity>
          <Text style={[
            styles.title,
            isDark && styles.titleDark
          ]}>
            {t.title}
          </Text>
        </View>

        {/* Auth Options */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[
              styles.authButton,
              isDark && styles.authButtonDark
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.authIconContainer}>
              <Text style={styles.authIcon}>🔑</Text>
            </View>
            <View style={styles.authContent}>
              <Text style={[
                styles.authTitle,
                isDark && styles.authTitleDark
              ]}>
                {t.login}
              </Text>
              <Text style={[
                styles.authDescription,
                isDark && styles.authDescriptionDark
              ]}>
                {t.loginDesc}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              isDark && styles.authButtonDark
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.authIconContainer}>
              <Text style={styles.authIcon}>📝</Text>
            </View>
            <View style={styles.authContent}>
              <Text style={[
                styles.authTitle,
                isDark && styles.authTitleDark
              ]}>
                {t.register}
              </Text>
              <Text style={[
                styles.authDescription,
                isDark && styles.authDescriptionDark
              ]}>
                {t.registerDesc}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Coming Soon Message */}
        <View style={[
          styles.comingSoonContainer,
          isDark && styles.comingSoonContainerDark
        ]}>
          <Text style={[
            styles.comingSoonText,
            isDark && styles.comingSoonTextDark
          ]}>
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
    marginBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "500",
  },
  backButtonTextDark: {
    color: "#60a5fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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