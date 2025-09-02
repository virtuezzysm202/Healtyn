import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";

// Translation object
const translations = {
  id: {
    title: "Pengaturan Akun",
    profile: "Profil Online",
    profileDesc: "Kelola informasi akun Anda",
    security: "Keamanan",
    securityDesc: "Ubah password dan pengaturan keamanan",
    privacy: "Privasi",
    privacyDesc: "Kelola pengaturan privasi akun",
    subscription: "Berlangganan",
    subscriptionDesc: "Kelola paket berlangganan premium",
    logout: "Keluar",
    logoutDesc: "Keluar dari akun Anda",
    back: "Kembali",
    comingSoon: "Segera Hadir",
    comingSoonMessage: "Fitur ini sedang dalam pengembangan",
    logoutConfirm: "Konfirmasi Keluar",
    logoutConfirmMessage: "Apakah Anda yakin ingin keluar dari akun?",
    cancel: "Batal",
    yes: "Ya, Keluar",
  },
  en: {
    title: "Account Settings",
    profile: "Online Profile",
    profileDesc: "Manage your account information",
    security: "Security",
    securityDesc: "Change password and security settings",
    privacy: "Privacy",
    privacyDesc: "Manage account privacy settings",
    subscription: "Subscription",
    subscriptionDesc: "Manage premium subscription plan",
    logout: "Logout",
    logoutDesc: "Sign out from your account",
    back: "Back",
    comingSoon: "Coming Soon",
    comingSoonMessage: "This feature is under development",
    logoutConfirm: "Confirm Logout",
    logoutConfirmMessage: "Are you sure you want to sign out?",
    cancel: "Cancel",
    yes: "Yes, Logout",
  }
};

type AccountSettingsProps = {
  navigation: any;
};

export default function AccountSettings({ navigation }: AccountSettingsProps) {
  const { language } = useSettings();
  const t = translations[language];

  // Mock user data - replace with real user data
  const [userData, setUserData] = React.useState({
    name: "John Doe",
    email: "john.doe@example.com",
    plan: "Premium",
  });

  const handleMenuPress = (feature: string) => {
    Alert.alert(t.comingSoon, t.comingSoonMessage);
  };

  const handleLogout = () => {
    Alert.alert(
      t.logoutConfirm,
      t.logoutConfirmMessage,
      [
        {
          text: t.cancel,
          style: "cancel",
        },
        {
          text: t.yes,
          style: "destructive",
          onPress: () => {
            // Add logout logic here
            navigation.navigate('Settings');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹ {t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.userPlan}>
              <Text style={styles.userPlanText}>{userData.plan}</Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.menuContainer}>
          
          {/* Profile Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('profile')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👤</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.profile}</Text>
              <Text style={styles.menuDescription}>{t.profileDesc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Security Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('security')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔒</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.security}</Text>
              <Text style={styles.menuDescription}>{t.securityDesc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Privacy Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🛡️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.privacy}</Text>
              <Text style={styles.menuDescription}>{t.privacyDesc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Subscription */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('subscription')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>⭐</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t.subscription}</Text>
              <Text style={styles.menuDescription}>{t.subscriptionDesc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, styles.logoutTitle]}>{t.logout}</Text>
              <Text style={styles.menuDescription}>{t.logoutDesc}</Text>
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
    marginBottom: 24,
    position: "relative",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  userAvatar: {
    width: 60,
    height: 60,
    backgroundColor: "#3b82f6",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  userPlan: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userPlanText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
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
  logoutItem: {
    marginTop: 12,
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
  logoutIconContainer: {
    backgroundColor: "#fef2f2",
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  logoutTitle: {
    color: "#dc2626",
  },
  menuDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  chevron: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "300",
  },
});