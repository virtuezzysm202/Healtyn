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

// Translations
const translations = {
  id: {
    title: "Pengaturan",
    profileOffline: "Profil Offline",
    profileOfflineDesc: "Kelola nama, usia, dan alamat",
    display: "Tampilan",
    displayDesc: "Bahasa dan tema aplikasi",
    account: "Masuk/Daftar",
    accountLoggedIn: "Pengaturan Akun",
    accountDesc: "Kelola akun online Anda",
    accountDescLoggedIn: "Kelola profil online Anda",
  },
  en: {
    title: "Settings",
    profileOffline: "Offline Profile",
    profileOfflineDesc: "Manage name, age, and address",
    display: "Display",
    displayDesc: "Language and app theme",
    account: "Sign Up/Login",
    accountLoggedIn: "Account Settings",
    accountDesc: "Manage your online account",
    accountDescLoggedIn: "Manage your online profile",
  },
};

// Enum untuk routes supaya TypeScript aman
enum Routes {
  Tabs = "/(tabs)",
  ProfileOffline = "/(tabs)/ProfileOfflineSettings",
  DisplaySettings = "/(tabs)/DisplaySettings",
  AuthScreen = "/(tabs)/AuthScreen",
  ProfileOnline = "/(tabs)/profile-online",
}

export default function SettingsPage() {
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Navigasi
  const navigateToProfile = () => router.push(Routes.ProfileOffline as any);
  const navigateToDisplay = () => router.push(Routes.DisplaySettings as any);
  const navigateToAccount = () =>
    router.push(isLoggedIn ? (Routes.ProfileOnline as any) : Routes.AuthScreen as any);

  const goBack = () => {
    router.push(Routes.Tabs as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>

        {/* Settings Menu Items */}
        <View style={styles.menuContainer}>
          {/* Profile Offline */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToProfile}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-circle-outline" size={26} color="#3b82f6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.profileOffline}</Text>
              <Text style={styles.menuDescription}>{t.profileOfflineDesc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
          </TouchableOpacity>

          {/* Display Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToDisplay}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="color-palette-outline" size={26} color="#f59e0b" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.display}</Text>
              <Text style={styles.menuDescription}>{t.displayDesc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToAccount}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={isLoggedIn ? "settings-outline" : "lock-closed-outline"}
                size={26}
                color={isLoggedIn ? "#10b981" : "#ef4444"}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                {isLoggedIn ? t.accountLoggedIn : t.account}
              </Text>
              <Text style={styles.menuDescription}>
                {isLoggedIn ? t.accountDescLoggedIn : t.accountDesc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    flex: 0,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
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
  menuIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
