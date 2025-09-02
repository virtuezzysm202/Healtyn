import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from '../../contexts/SettingsContext';


// Translation object
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

export default function SettingsPage() {
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();

 
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const navigateToProfile = () => {
    try {
      router.push("/(tabs)/ProfileOfflineSettings");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const navigateToDisplay = () => {
    try {
      router.push("/(tabs)/DisplaySettings");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const navigateToAccount = () => {
    try {
      if (isLoggedIn) {
        router.push("/(tabs)/profile-online");
      } else {
        router.push("/(tabs)/AuthScreen");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
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
              <Text style={styles.menuIcon}>👤</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.profileOffline}</Text>
              <Text style={styles.menuDescription}>
                {t.profileOfflineDesc}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Display Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToDisplay}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🎨</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.display}</Text>
              <Text style={styles.menuDescription}>{t.displayDesc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToAccount}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>{isLoggedIn ? "⚙️" : "🔐"}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                {isLoggedIn ? t.accountLoggedIn : t.account}
              </Text>
              <Text style={styles.menuDescription}>
                {isLoggedIn ? t.accountDescLoggedIn : t.accountDesc}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  menuIcon: {
    fontSize: 24,
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
  chevron: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "300",
  },
});