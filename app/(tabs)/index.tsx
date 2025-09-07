import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTranslation } from "../../hooks/useTranslation";



import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import LansiaText from '../../components/ui/LansiaText';
import { getAllSchedules } from '../../services/medicineStorage';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';

// ===== Types =====
type WeatherData = {
  weather: {
    main: string; icon: string; description: string 
}[];
  main: { temp: number; humidity?: number };
  wind?: { speed: number };
  name?: string;
};

type AppRoute =
  | '/medicine'
  | '/health-check'
  | '/call-doctor'
  | '/family'
  | '/health'
  | '/relax-music';

type MenuItem = {
  icon: string;
  label: string;
  route: AppRoute;
};

interface HealthTip {
  id: string;
  tip: string;
  showOnHome?: boolean;
  iconType?: 'FontAwesome5' | 'MaterialCommunityIcons';
  iconName?: string;
  iconColor?: string;
}

interface MedicineSchedule {
  id: string;
  medicineName: string;
  medicineType: string;
  disease: string;
  medicineForm: string;
  dosageAmount: string;
  dosageUnit: string;
  spoonSize?: string;
  notes: string;
  usageTime: string;
  timesPerDay: number;
  alarmTimes: (string | Date)[];
  mustFinish: boolean;
  startDate: string | Date;
  endDate: string | Date;
  medicineImage?: string;
}

type GeoLocation = {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country?: string;
};

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // ===== UI / App State =====
  const [darkMode, setDarkMode] = useState(false);

  // ===== Weather State =====
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Lokasi: tersimpan, dipilih, dan hasil pencarian
  const [savedLocations, setSavedLocations] = useState<GeoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);

  // ===== Health State =====
  const [healthCondition, setHealthCondition] = useState<"healthy" | "sick" | null>(null);
  const [healthReminders, setHealthReminders] = useState<HealthTip[]>([]);

  // ===== Medicine State =====
  const [medicineSchedules, setMedicineSchedules] = useState<MedicineSchedule[]>([]);
  const [loadingMedicine, setLoadingMedicine] = useState(true);

  const toggleDarkMode = () => setDarkMode((v) => !v);


  const menuItems: MenuItem[] = [
    { icon: 'medkit', label: t('home.menu.medicineReminder'), route: '/medicine' },
    { icon: 'stethoscope', label: t('home.menu.health-check'), route: '/health-check' },
    { icon: 'user-md', label: t('home.menu.callDoctor'), route: '/call-doctor' },
    { icon: 'users', label: t('home.menu.callFamily'), route: '/family' },
    { icon: 'heartbeat', label: t('home.menu.health'), route: '/health' },
    { icon: 'music', label: t('home.menu.relaxMusic'), route: '/relax-music' },
  ];

  // ===== Helpers =====
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
    if (temp > 30) return { icon: '🩳', text: t('home.weather.outfit.hot') };
    if (temp > 25) return { icon: '👕', text: t('home.weather.outfit.warm') };
    if (temp > 20) return { icon: '👔', text: t('home.weather.outfit.mild') };
    if (temp > 15) return { icon: '🧥', text: t('home.weather.outfit.cool') };
    return { icon: '🧥', text: t('home.weather.outfit.cold') };
  };

  // Normalisasi lokasi dari hasil geocoding (lat/lon) atau GPS (coords)
  const normalizeLocation = (location: any): GeoLocation | null => {
    if (location?.lat != null && location?.lon != null) {
      // OpenWeather Direct Geocoding result
      return {
        name: location.name ?? `${location.lat},${location.lon}`,
        lat: Number(location.lat),
        lon: Number(location.lon),
        state: location.state,
        country: location.country,
      };
    }
    if (location?.coords) {
      // Expo Location result - akan di-update dengan nama kota nanti
      return {
        name: 'Getting location...', // temporary name
        lat: Number(location.coords.latitude),
        lon: Number(location.coords.longitude),
      };
    }
    return null;
  };

  const getCityNameFromCoords = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].name || `${lat},${lon}`;
      }
      return `${lat},${lon}`;
    } catch (error) {
      console.error('Error getting city name:', error);
      return `${lat},${lon}`;
    }
  };

  // Weather: API calls 
  const fetchWeather = async (loc: GeoLocation) => {
    try {
      if (!API_KEY) {
        throw new Error(t("home.weather.apiError"));
      }
      setLoadingWeather(true);
  
  
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
  
      if (!res.ok) throw new Error(`Gagal fetch weather: ${res.status}`);
      const data: WeatherData = await res.json();
  
      
      const mainCondition = data.weather?.[0]?.main || "Unknown";
  

      const localizedCondition =
        t(`weather.conditions.${mainCondition}`) || mainCondition;
  
    
      setWeather({
        ...data,
        weather: [{ ...data.weather[0], description: localizedCondition }],
      });
  
      setWeatherError(null);
    } catch (err: any) {
      setWeatherError(err?.message ?? t("home.weather.generalError"));
    } finally {
      setLoadingWeather(false);
    }
  };

  const selectLocationForWeather = async (location: any) => {
    const normalized = normalizeLocation(location);
    if (!normalized) return;
    
    setSelectedLocation(normalized);
    await fetchWeather(normalized);
    
    // Simpan lokasi yang dipilih ke saved locations
    await addLocation(normalized);
    
    // Simpan sebagai lokasi terakhir dipilih
    await AsyncStorage.setItem('lastSelectedLocation', JSON.stringify(normalized));
    
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const searchLocation = async (query: string) => {
    if (!query?.trim()) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query.trim()
        )}&limit=5&appid=${API_KEY}`
      );
      const data = (await res.json()) as any[];
      const mapped: GeoLocation[] = data.map((d) => ({
        name: d.name,
        lat: d.lat,
        lon: d.lon,
        state: d.state,
        country: d.country,
      }));
      setSearchResults(mapped);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Tambah lokasi ke daftar tersimpan (hindari duplikat lat/lon)
  const addLocation = async (location: GeoLocation) => {
    const exists = savedLocations.some(
      (l) => l.lat === location.lat && l.lon === location.lon
    );
    if (exists) return;
    const updated = [...savedLocations, location];
    setSavedLocations(updated);
    await AsyncStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  // Hapus lokasi dari daftar tersimpan
  const deleteLocation = async (location: GeoLocation) => {
    const updated = savedLocations.filter(
      (l) => !(l.lat === location.lat && l.lon === location.lon)
    );
    setSavedLocations(updated);
    await AsyncStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  // ===== Medicine Reminder =====
  const getNextMedicineReminder = () => {
    if (medicineSchedules.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let nextReminder: {
      medicine: string;
      time: string;
      dosage: string;
      isToday: boolean;
    } | null = null;

    let minTimeDiff = Infinity;

    for (const schedule of medicineSchedules) {
      const endDate = new Date(schedule.endDate);
      if (endDate < now) continue;

      for (const alarmTime of schedule.alarmTimes) {
        const alarm = new Date(alarmTime);
        const alarmMinutes = alarm.getHours() * 60 + alarm.getMinutes();

        let timeDiff = alarmMinutes - currentTime;
        if (timeDiff < 0) timeDiff += 24 * 60;

        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          nextReminder = {
            medicine: schedule.medicineName,
            time: alarm.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dosage: `${schedule.dosageAmount} ${schedule.dosageUnit}`,
            isToday: timeDiff < 24 * 60,
          };
        }
      }
    }

    return nextReminder;
  };

  // ===== Effects =====

  // Load medicine schedules
  useEffect(() => {
    const loadMedicineSchedules = async () => {
      try {
        setLoadingMedicine(true);
        const schedules = await getAllSchedules();
        setMedicineSchedules(schedules);
      } catch (error) {
        console.error('Error loading medicine schedules:', error);
      } finally {
        setLoadingMedicine(false);
      }
    };

    loadMedicineSchedules();
    const interval = setInterval(loadMedicineSchedules, 30000); // refresh tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Load health data (condition + reminders)
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const savedCondition = await AsyncStorage.getItem('healthCondition');
        if (savedCondition) {
          setHealthCondition(savedCondition as 'healthy' | 'sick');
        }

        const savedDefaultTips = await AsyncStorage.getItem('defaultHealthTips');
        const defaultTips = savedDefaultTips ? JSON.parse(savedDefaultTips) : { healthy: [], sick: [] };

        const savedCustomTips = await AsyncStorage.getItem('customTipsByCondition');
        const customTips = savedCustomTips ? JSON.parse(savedCustomTips) : { healthy: [], sick: [] };

        if (savedCondition) {
          const condition = savedCondition as 'healthy' | 'sick';
          const defaultReminders = defaultTips[condition]?.filter((tip: HealthTip) => tip.showOnHome) || [];
          const customReminders = customTips[condition]?.filter((tip: HealthTip) => tip.showOnHome) || [];
          setHealthReminders([...defaultReminders, ...customReminders]);
        }
      } catch (error) {
        console.error('Error loading health data:', error);
      }
    };

    loadHealthData();
    const interval = setInterval(loadHealthData, 5000); // cek tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  // Load lokasi tersimpan saat start
  useEffect(() => {
    const loadLocations = async () => {
      const saved = await AsyncStorage.getItem('savedLocations');
      if (saved) setSavedLocations(JSON.parse(saved));
    };
    loadLocations();
  }, []);

// Ambil cuaca dari lokasi terakhir dipilih atau GPS
useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      if (!API_KEY) {
        setWeatherError(t('home.weather.apiError'));
        setLoadingWeather(false);
        return;
      }

      // Cek lokasi terakhir yang dipilih
      const lastSelected = await AsyncStorage.getItem('lastSelectedLocation');
      if (lastSelected && mounted) {
        const savedLocation = JSON.parse(lastSelected);
        setSelectedLocation(savedLocation);
        await fetchWeather(savedLocation);
        return;
      }

      // Jika tidak ada lokasi tersimpan, gunakan GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherError(t('home.weather.permissionError'));
        setLoadingWeather(false);
        return;
      }
      
      const deviceLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const normalized = normalizeLocation(deviceLoc);
      if (mounted && normalized) {
        setSelectedLocation(normalized);
        await fetchWeather(normalized);
        
        // Get actual city name untuk GPS location
        const cityName = await getCityNameFromCoords(normalized.lat, normalized.lon);
        const updatedLocation = { ...normalized, name: cityName };
        setSelectedLocation(updatedLocation);
      }
    } catch (err: any) {
      setWeatherError(err?.message ?? t('home.weather.generalError'));
    } finally {
      if (mounted) setLoadingWeather(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);
  // ===== Greeting =====
  const getGreetingMessage = () => {
    if (!healthCondition) return null;

    if (healthCondition === 'sick') {
      return {
        title: t('home.greeting.sickTitle'),
        subtitle: t('home.greeting.sickSubtitle'),
        bgColor: '#FFE5E5',
        textColor: '#D32F2F',
      };
    }
    return {
      title: t('home.greeting.healthyTitle'),
      subtitle: t('home.greeting.healthySubtitle'),
      bgColor: '#E8F5E8',
      textColor: '#2E7D32',
    };
  };

  const greeting = getGreetingMessage();
  const nextMedicineReminder = getNextMedicineReminder();

  return (
    <ScrollView 
  style={[styles.container, darkMode && styles.darkContainer]}
  contentContainerStyle={{ paddingBottom: 50 }}
>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <LansiaText style={[styles.appName, darkMode && styles.darkText]}>
            {t('home.appName')}
          </LansiaText>
          <LansiaText style={[styles.appSubtitle, darkMode && styles.darkSubText]}>
            {t('home.appSubtitle')}
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

      {/* Greeting Card (jika ada kondisi kesehatan) */}
      {greeting && (
        <View style={[
          styles.greetingCard, 
          { backgroundColor: darkMode ? '#1C1C1E' : greeting.bgColor }
        ]}>
          <LansiaText style={[
            styles.greetingTitle, 
            { color: darkMode ? '#FFFFFF' : greeting.textColor }
          ]}>
            {greeting.title}
          </LansiaText>
          <LansiaText style={[
            styles.greetingSubtitle, 
            { color: darkMode ? '#8E8E93' : greeting.textColor }
          ]}>
            {greeting.subtitle}
          </LansiaText>
        </View>
      )}

      {/* Medicine Reminder Card */}
      {!loadingMedicine && medicineSchedules.length > 0 && (
        <View>
          <LansiaText style={[styles.sectionTitle, darkMode && styles.darkText]}>
            {t('home.medicineReminder.title')}
          </LansiaText>

          {medicineSchedules
            .filter((schedule) => {
              const today = new Date();
              const start = new Date(schedule.startDate);
              const end = new Date(schedule.endDate);

              // cek apakah hari ini dalam rentang start–end
              const inDateRange = today >= start && today <= end;

              // cek apakah masih ada alarm di hari ini
              const hasTodayAlarm =
                Array.isArray(schedule.alarmTimes) &&
                schedule.alarmTimes.some((t) => {
                  const alarmDate = new Date(t);
                  return (
                    alarmDate.toDateString() === today.toDateString() // alarm di hari yang sama
                  );
                });

              return inDateRange && hasTodayAlarm;
            })
            .map((schedule) => (
              <Pressable
                key={schedule.id}
                style={[
                  styles.medicineReminderCard,
                  darkMode && styles.darkMedicineReminderCard,
                ]}
                onPress={() => router.push("/medicine")}
              >
                <View style={styles.reminderHeader}>
                  <View
                    style={[styles.reminderIconContainer, { backgroundColor: "#007AFF" }]}
                  >
                    <LansiaText style={styles.reminderIcon}>💊</LansiaText>
                  </View>
                  <View style={styles.reminderContent}>
                    <LansiaText style={[styles.reminderTitle, darkMode && styles.darkText]}>
                      {schedule.medicineName}
                    </LansiaText>
                    <LansiaText style={[styles.reminderText, darkMode && styles.darkSubText]}>
                      {schedule.dosageAmount} {schedule.dosageUnit} •{" "}
                      {Array.isArray(schedule.alarmTimes) && schedule.alarmTimes.length > 0
                        ? schedule.alarmTimes
                            .map((t) =>
                              new Date(t).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            )
                            .join(", ")
                        : "-"}
                    </LansiaText>
                  </View>
                  <View style={styles.reminderBadge}>
                    <LansiaText style={styles.reminderBadgeText}>
                      {t('home.reminders.today')}
                    </LansiaText>
                  </View>
                </View>
              </Pressable>
            ))}
        </View>
      )}

 
{/* Weather Card  */}
<View style={[styles.weatherCard, darkMode && styles.darkWeatherCard]}>
  {loadingWeather ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#007AFF" />
      <LansiaText style={[styles.loadingText, darkMode && styles.darkText]}>
        {t("home.weather.loading")}
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
          📍 {selectedLocation?.name ?? weather.name ?? t("home.weather.yourLocation")}
          </LansiaText>
          <LansiaText style={[styles.temperatureText, darkMode && styles.darkText]}>
            {Math.round(weather.main.temp)}°
          </LansiaText>
          <LansiaText style={[styles.weatherDescription, darkMode && styles.darkSubText]}>
            {weather.weather[0]?.description?.replace(/^\w/, (c) => c.toUpperCase())}
          </LansiaText>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, darkMode && styles.darkDivider]} />

      {/* Outfit Recommendation */}
      <View style={styles.recommendationContainer}>
        <View style={styles.recommendationHeader}>
          <LansiaText style={[styles.recommendationTitle, darkMode && styles.darkText]}>
            {t("home.weather.recommendationTitle")}
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

      {/* Divider */}
      <View style={[styles.divider, darkMode && styles.darkDivider]} />

      {/* Search & Location Controls - INSIDE WEATHER CARD */}
      <View>
        {/* Search Box */}
        {isSearching && (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, darkMode && styles.darkInput]}
              placeholder={t("home.weather.searchPlaceholder")}
              placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchLocation(text);
              }}
            />
            {searchResults.map((loc, idx) => (
              <Pressable
                key={idx}
                style={styles.searchResult}
                onPress={() => selectLocationForWeather(loc)}
              >
                <LansiaText style={[styles.searchResultText, darkMode && styles.darkText]}>
                  {loc.name}, {loc.country}
                </LansiaText>
              </Pressable>
            ))}
          </View>
        )}

        {/* Saved Locations */}
        {savedLocations.length > 0 && (
          <View style={styles.savedContainer}>
            <LansiaText style={[styles.savedTitle, darkMode && styles.darkText]}>
              {t("home.weather.savedLocations")}
            </LansiaText>
            {savedLocations.map((loc, idx) => (
              <View key={idx} style={styles.savedRow}>
                <Pressable onPress={() => selectLocationForWeather(loc)}>
                  <LansiaText style={[styles.savedText, darkMode && styles.darkText]}>
                    📍 {loc.name}, {loc.country}
                  </LansiaText>
                </Pressable>
                <Pressable onPress={() => deleteLocation(loc)}>
                  <LansiaText style={styles.deleteText}>❌</LansiaText>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Button Row */}
        <View style={styles.buttonRow}>
          {/* Button to Toggle Search */}
          <Pressable
            style={[styles.locationButton, darkMode && styles.darkLocationButton]}
            onPress={() => setIsSearching(!isSearching)}
          >
            <LansiaText style={[styles.locationButtonText, darkMode && styles.darkText]}>
              {isSearching ? t("home.weather.closeSearch") : t("home.weather.addLocation")}
            </LansiaText>
          </Pressable>

          {/* Button GPS location */}
          <Pressable
            style={[styles.gpsButtonSmall, darkMode && styles.darkGpsButtonSmall]}
            onPress={async () => {
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                
                const deviceLoc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Low,
                });
                const normalized = normalizeLocation(deviceLoc);
                if (normalized) {
                  setSelectedLocation(normalized);
                  await fetchWeather(normalized);
                  
                  const cityName = await getCityNameFromCoords(normalized.lat, normalized.lon);
                  const updatedLocation = { ...normalized, name: cityName };
                  
                  setSelectedLocation(updatedLocation);
                  await AsyncStorage.removeItem('lastSelectedLocation');
                }
              } catch (error) {
                console.error('Error getting current location:', error);
              }
            }}
          >
            <LansiaText style={[styles.gpsButtonSmallText]}>
              📍 {t("home.weather.useCurrentLocation")}
            </LansiaText>
          </Pressable>
        </View>
      </View>
    </>
  ) : (
    <View style={styles.errorContainer}>
      <LansiaText style={styles.errorIcon}>⚠️</LansiaText>
      <LansiaText style={[styles.errorText, darkMode && styles.darkText]}>
        {weatherError ?? t("home.weather.generalError")}
      </LansiaText>
    </View>
  )}
</View>
{/* Health Reminder Cards */}
{healthReminders.length > 0 && (
  <View>
    <LansiaText style={[styles.sectionTitle, darkMode && styles.darkText]}>
      {t('home.healthReminders.title')}
    </LansiaText>
    {healthReminders.map((reminder) => (
      <View key={reminder.id} style={[styles.reminderCard, darkMode && styles.darkReminderCard]}>
        <View style={styles.reminderHeader}>
          <View style={[
            styles.reminderIconContainer,
            { backgroundColor: darkMode ? '#444' : '#F2F2F7' } 
          ]}>
           {/* Render icon */}
  {reminder.iconType === "FontAwesome5" && reminder.iconName ? (
    <FontAwesome5
      name={reminder.iconName as any} // simple fix
      size={20}
      color={darkMode ? "#FFFFFF" : reminder.iconColor || "#007AFF"}
    />
  ) : reminder.iconType === "MaterialCommunityIcons" && reminder.iconName ? (
    <MaterialCommunityIcons
      name={reminder.iconName as any} // simple fix juga
      size={20}
      color={darkMode ? "#FFFFFF" : reminder.iconColor || "#007AFF"}
    />
  ) : (
    <LansiaText style={styles.reminderIcon}>💡</LansiaText>
  )}
</View>
          <View style={styles.reminderContent}>
            {/* <LansiaText style={[styles.reminderTitle, darkMode && styles.darkText]}>
              {t('home.healthReminders.tip')}
            </LansiaText> */}
            <LansiaText style={[styles.reminderText, darkMode && styles.darkSubText]}>
              {reminder.tip}
            </LansiaText>
          </View>
        </View>
      </View>
    ))}
  </View>
)}


      {/* Default Daily Reminder Card jika tidak ada health reminders dan tidak ada medicine reminder */}
      {healthReminders.length === 0 && !nextMedicineReminder && !loadingMedicine && (
        <View
          style={[
            styles.reminderCard,
            darkMode && styles.darkReminderCard,
            {
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 6,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.reminderHeader}>
            {/* Ikon Lingkaran */}
            <View
              style={[
                styles.reminderIconContainer,
                { backgroundColor: darkMode ? '#444' : '#E3F2FD', borderRadius: 30, padding: 12 },
              ]}
            >
              <LansiaText style={{ fontSize: 22 }}>🕙</LansiaText>
            </View>

            {/* Konten */}
            <View style={[styles.reminderContent, { marginLeft: 12 }]}>
              <LansiaText
                style={[
                  styles.reminderTitle,
                  darkMode && styles.darkText,
                  { fontWeight: '600', fontSize: 16 },
                ]}
              >
                {t('home.reminders.dailyReminder')}
              </LansiaText>
              <LansiaText
                style={[
                  styles.reminderText,
                  darkMode && styles.darkSubText,
                  { fontSize: 13, marginTop: 2 },
                ]}
              >
                {t('home.reminders.noReminders')}
              </LansiaText>
            </View>

            {/* Badge */}
            <View
              style={[
                styles.reminderBadge,
                {
                  backgroundColor: darkMode ? '#F48FB1' : '#42A5F5',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 'auto',
                },
              ]}
            >
              <LansiaText style={[styles.reminderBadgeText, { color: '#fff', fontWeight: '600' }]}>
                !
              </LansiaText>
            </View>
          </View>
        </View>
      )}

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
    color: '#DDDDDD',
  },
  smallLabel: {
    fontSize: 16,
    marginRight: 8,
  },

  // Greeting Card 
  greetingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },

  //  Medicine Reminder Card 
  medicineReminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  darkMedicineReminderCard: {
    backgroundColor: '#1C1C1E',
    borderLeftColor: '#007AFF',
  },
  medicineNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },

  // Section Title 
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    marginTop: 8,
  },

  // Weather Card 
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

  //  Recommendation 
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

  // Error State 
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

  //  Reminder Card
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    color: '#333333',
    fontWeight: '400',
  },
  reminderBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reminderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  //  Menu Grid 
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
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

  // Search 
  searchContainer: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  darkInput: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
  },
  searchResult: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchResultText: {
    fontSize: 16,
    color: "#1D1D1F",
  },
  savedContainer: {
    marginTop: 12,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  savedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  savedText: {
    fontSize: 15,
  },
  deleteText: {
    fontSize: 14,
    color: "#FF3B30",
  },
  searchToggle: {
    marginTop: 12,
    alignSelf: "flex-start",
    padding: 8,
  },
  searchToggleText: {
    color: "#007AFF",
    fontWeight: "500",
  },

  // GPS & Location Buttons 
  gpsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  darkGpsButton: {
    backgroundColor: '#0A84FF',
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  locationButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  darkLocationButton: {
    backgroundColor: '#2C2C2E',
  },
  locationButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  gpsButtonSmall: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  darkGpsButtonSmall: {
    backgroundColor: '#0A84FF',
  },
  gpsButtonSmallText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
});