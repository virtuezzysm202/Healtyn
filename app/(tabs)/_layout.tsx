import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const tabTranslations = {
  id: { 
    home: "Beranda", 
    health: "Kesehatan", 
    medicine: "Obat", 
    call: "Panggil Dokter", 
    lifestyle: "Gaya Hidup",
    settings: "Pengaturan" 
  },
  en: { 
    home: "Home", 
    health: "Health", 
    medicine: "Medicine", 
    call: "Call Doctor", 
    lifestyle: "Lifestyle",
    settings: "Settings" 
  }
};

type TabBarIconProps = { color: string; size: number };

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
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: t.health,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t.medicine,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="call-doctor"
        options={{
          title: t.call,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="call-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="lifestyle"
        options={{
          title: t.lifestyle,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      {[
        "family",
        "ProfileOfflineSettings",
        "profile-online",
        "DisplaySettings",
        "AuthScreen",
        "AccountSettings",
        "CreateMedicineSchedule",
        "explore",
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
