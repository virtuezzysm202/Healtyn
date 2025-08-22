import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

// Translations untuk tab titles
const tabTranslations = {
  id: {
    home: "Beranda",
    health: "Kesehatan", 
    medicine: "Obat",
    settings: "Pengaturan"
  },
  en: {
    home: "Home",
    health: "Health",
    medicine: "Medicine", 
    settings: "Settings"
  }
};

// Simple icon component for tabs
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, color: 'transparent', textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 0 }}>
        {emoji}
      </Text>
    </View>
  );
}

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
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 24, 
              opacity: focused ? 1 : 0.6 
            }}>
              🏠
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: t.health,
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 24, 
              opacity: focused ? 1 : 0.6 
            }}>
              🏥
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t.medicine,
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 24, 
              opacity: focused ? 1 : 0.6 
            }}>
              💊
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 24, 
              opacity: focused ? 1 : 0.6 
            }}>
              ⚙️
            </Text>
          ),
          headerShown: false,
        }}
      />
      {/* Hidden screens - tidak muncul di tab bar */}
      <Tabs.Screen
        name="ProfileOfflineSettings"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="DisplaySettings"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile-online"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="AuthScreen"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="AccountSettings"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="CreateMedicineSchedule"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="call-doctor"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="relax-music"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
    </Tabs>
  );
}