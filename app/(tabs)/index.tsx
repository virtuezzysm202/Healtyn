// app/(tabs)/index.tsx
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import LansiaText from '../../components/ui/LansiaText';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';

type WeatherData = {
  weather: { icon: string; description: string }[];
  main: { temp: number };
  name?: string;
};

type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const menuItems: MenuItem[] = [
    { icon: 'medkit', label: 'Pengingat Obat', route: '/medicine' },
    { icon: 'book', label: 'Pindai Buku', route: '/scan' },
    { icon: 'user-md', label: 'Hubungi Dokter', route: '/call-doctor' },
    { icon: 'users', label: 'Hubungi Keluarga', route: '/family' },
    { icon: 'heartbeat', label: 'Kesehatan Hari Ini', route: '/health' },
    { icon: 'music', label: 'Musik Relaksasi & Meditasi', route: '/relax-music' },
  ];

  const mapIconToEmoji = (icon?: string) => {
    if (!icon) return '🌤';
    if (icon.startsWith('01')) return '☀️';
    if (icon.startsWith('02') || icon.startsWith('03')) return '⛅️';
    if (icon.startsWith('04')) return '☁️';
    if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️';
    if (icon.startsWith('11')) return '⛈️';
    if (icon.startsWith('13')) return '❄️';
    if (icon.startsWith('50')) return '🌫️';
    return '🌤';
  };

  const getOutfitRecommendation = (temp: number) => {
    if (temp > 30) return { icon: '🩳', text: 'Pakaian tipis & topi' };
    if (temp > 25) return { icon: '👕', text: 'Kaos & celana panjang' };
    if (temp > 20) return { icon: '👔', text: 'Kemeja & celana panjang' };
    if (temp > 15) return { icon: '🧥', text: 'Jaket tipis' };
    return { icon: '🧥', text: 'Jaket tebal & syal' };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!API_KEY) {
          setWeatherError('API key OpenWeather tidak ditemukan di .env');
          setLoadingWeather(false);
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherError('Izin lokasi ditolak');
          setLoadingWeather(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        const { latitude, longitude } = location.coords;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=id`
        );
        if (!res.ok) throw new Error(`Fetch gagal: ${res.status}`);
        const data: WeatherData = await res.json();
        if (mounted) setWeather(data);
      } catch (err: any) {
        setWeatherError(err.message ?? 'Gagal memuat cuaca');
      } finally {
        if (mounted) setLoadingWeather(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <LansiaText style={[styles.appName, darkMode && styles.darkText]}>
            Lansia Helper
          </LansiaText>
          <LansiaText style={[styles.appSubtitle, darkMode && styles.darkSubText]}>
            Pendamping kesehatan harian
          </LansiaText>
        </View>
        <View style={styles.rightHeader}>
          <LansiaText style={styles.smallLabel}>🌙</LansiaText>
          <Switch 
            value={darkMode} 
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E5EA"
          />
          <Pressable
            onPress={() => router.push('/settings')}
            style={[styles.profileButton, darkMode && styles.darkProfileButton]}
          >
            <Feather
              name="settings"
              size={20}
              color={darkMode ? '#FFFFFF' : '#007AFF'}
            />
          </Pressable>
        </View>
      </View>

      {/* Weather Card - iOS Modern Design */}
      <View style={[styles.weatherCard, darkMode && styles.darkWeatherCard]}>
        {loadingWeather ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <LansiaText style={[styles.loadingText, darkMode && styles.darkText]}>
              Memuat cuaca...
            </LansiaText>
          </View>
        ) : weather ? (
          <>
            {/* Main Weather Info */}
            <View style={styles.weatherHeader}>
              <View style={styles.weatherIconContainer}>
                <LansiaText style={styles.weatherEmoji}>
                  {mapIconToEmoji(weather.weather[0]?.icon)}
                </LansiaText>
              </View>
              <View style={styles.weatherInfo}>
                <LansiaText style={[styles.locationText, darkMode && styles.darkText]}>
                  📍 {weather.name ?? 'Lokasi Anda'}
                </LansiaText>
                <LansiaText style={[styles.temperatureText, darkMode && styles.darkText]}>
                  {Math.round(weather.main.temp)}°
                </LansiaText>
                <LansiaText style={[styles.weatherDescription, darkMode && styles.darkSubText]}>
                  {weather.weather[0]?.description?.replace(
                    /^\w/,
                    (c) => c.toUpperCase()
                  )}
                </LansiaText>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, darkMode && styles.darkDivider]} />

            {/* Outfit Recommendation */}
            <View style={styles.recommendationContainer}>
              <View style={styles.recommendationHeader}>
                <LansiaText style={[styles.recommendationTitle, darkMode && styles.darkText]}>
                  Rekomendasi Pakaian
                </LansiaText>
              </View>
              <View style={styles.outfitRow}>
                <View style={styles.outfitIconContainer}>
                  <LansiaText style={styles.outfitIcon}>
                    {getOutfitRecommendation(weather.main.temp).icon}
                  </LansiaText>
                </View>
                <LansiaText style={[styles.outfitText, darkMode && styles.darkSubText]}>
                  {getOutfitRecommendation(weather.main.temp).text}
                </LansiaText>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <LansiaText style={styles.errorIcon}>⚠️</LansiaText>
            <LansiaText style={[styles.errorText, darkMode && styles.darkText]}>
              {weatherError ?? 'Gagal memuat cuaca'}
            </LansiaText>
          </View>
        )}
      </View>

      {/* Daily Reminder Card */}
      <View style={[styles.reminderCard, darkMode && styles.darkReminderCard]}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderIconContainer}>
            <LansiaText style={styles.reminderIcon}>🕙</LansiaText>
          </View>
          <View style={styles.reminderContent}>
            <LansiaText style={[styles.reminderTitle, darkMode && styles.darkText]}>
              Pengingat Hari Ini
            </LansiaText>
            <LansiaText style={[styles.reminderText, darkMode && styles.darkSubText]}>
              Minum air putih jam 10:00
            </LansiaText>
          </View>
          <View style={styles.reminderBadge}>
            <LansiaText style={styles.reminderBadgeText}>1</LansiaText>
          </View>
        </View>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.menuItem,
              darkMode && styles.darkMenuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.menuIconContainer, darkMode && styles.darkMenuIconContainer]}>
              <FontAwesome5 name={item.icon} size={24} color="#007AFF" />
            </View>
            <LansiaText style={[styles.menuLabel, darkMode && styles.darkText]}>
              {item.label}
            </LansiaText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkProfileButton: {
    backgroundColor: '#1C1C1E',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '400',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#8E8E93',
  },
  smallLabel: {
    fontSize: 16,
    marginRight: 8,
  },

  // Weather Card Styles
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  darkWeatherCard: {
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#8E8E93',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  weatherEmoji: {
    fontSize: 40,
  },
  weatherInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: '200',
    color: '#1D1D1F',
    lineHeight: 52,
  },
  weatherDescription: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 20,
  },
  darkDivider: {
    backgroundColor: '#38383A',
  },
  recommendationContainer: {
    marginTop: 4,
  },
  recommendationHeader: {
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  outfitIcon: {
    fontSize: 20,
  },
  outfitText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Reminder Card Styles
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  darkReminderCard: {
    backgroundColor: '#1C1C1E',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderIcon: {
    fontSize: 20,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  reminderText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  reminderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Menu Grid Styles
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  darkMenuItem: {
    backgroundColor: '#1C1C1E',
  },
  menuItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  darkMenuIconContainer: {
    backgroundColor: '#2C2C2E',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    lineHeight: 18,
  },
});