// app/TabLayout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

// Tab titles (translations)
const tabTranslations = {
  id: { home: "Beranda", health: "Kesehatan", medicine: "Obat", settings: "Pengaturan" },
  en: { home: "Home", health: "Health", medicine: "Medicine", settings: "Settings" }
};

export default function TabLayout() {
  const { theme, language } = useSettings();
  const isDark = theme === 'dark';
  const t = tabTranslations[language];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
          borderTopColor: isDark ? '#404040' : '#e5e7eb',
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#1a1a1a',
      }}
    >
      {/* Main Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
          headerShown: false,
        }}
      />

      {/* Additional Tabs (optional, start with simple icon first) */}
      <Tabs.Screen
        name="health"
        options={{
          title: t.health,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>❤️</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t.medicine,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>💊</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>⚙️</Text>,
          headerShown: false,
        }}
      />

      {/* Hidden screens */}
      {[
        "ProfileOfflineSettings",
        "profile-online",
        "DisplaySettings",
        "AuthScreen",
        "AccountSettings",
        "CreateMedicineSchedule",
        "call-doctor",
        "explore",
        "relax-music",
        "health-check",
      ].map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, headerShown: false }}
        />
      ))}
    </Tabs>
  );
}