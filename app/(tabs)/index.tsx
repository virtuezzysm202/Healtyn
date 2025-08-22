import { Feather, FontAwesome5 } from '@expo/vector-icons';
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
  View,
} from 'react-native';
import LansiaText from '../../components/ui/LansiaText';
import { getAllSchedules } from '../services/medicineStorage';

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

interface HealthTip {
  id: string;
  tip: string;
  showOnHome?: boolean;
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

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  
  // State untuk health data
  const [healthCondition, setHealthCondition] = useState<"healthy" | "sick" | null>(null);
  const [healthReminders, setHealthReminders] = useState<HealthTip[]>([]);
  
  // State untuk medicine reminders
  const [medicineSchedules, setMedicineSchedules] = useState<MedicineSchedule[]>([]);
  const [loadingMedicine, setLoadingMedicine] = useState(true);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const menuItems: MenuItem[] = [
    { icon: 'medkit', label: t('home.menu.medicineReminder'), route: '/medicine' },
    { icon: 'book', label: t('home.menu.scanBook'), route: '/scan' },
    { icon: 'user-md', label: t('home.menu.callDoctor'), route: '/call-doctor' },
    { icon: 'users', label: t('home.menu.callFamily'), route: '/family' },
    { icon: 'heartbeat', label: t('home.menu.health'), route: '/health' },
    { icon: 'music', label: t('home.menu.relaxMusic'), route: '/relax-music' },
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
    if (temp > 30) return { icon: '🩳', text: t('home.weather.outfit.hot') };
    if (temp > 25) return { icon: '👕', text: t('home.weather.outfit.warm') };
    if (temp > 20) return { icon: '👔', text: t('home.weather.outfit.mild') };
    if (temp > 15) return { icon: '🧥', text: t('home.weather.outfit.cool') };
    return { icon: '🧥', text: t('home.weather.outfit.cold') };
  };

  // Get next medicine reminder
  const getNextMedicineReminder = () => {
    if (medicineSchedules.length === 0) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextReminder = null;
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
            isToday: timeDiff < 24 * 60
          };
        }
      }
    }
    
    return nextReminder;
  };

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
    
    // Refresh medicine schedules
    const interval = setInterval(loadMedicineSchedules, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load health data
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const savedCondition = await AsyncStorage.getItem("healthCondition");
        if (savedCondition) {
          setHealthCondition(savedCondition as "healthy" | "sick");
        }

        // Load default tips
        const savedDefaultTips = await AsyncStorage.getItem("defaultHealthTips");
        const defaultTips = savedDefaultTips ? JSON.parse(savedDefaultTips) : { healthy: [], sick: [] };
        
        // Load custom tips
        const savedCustomTips = await AsyncStorage.getItem("customTipsByCondition");
        const customTips = savedCustomTips ? JSON.parse(savedCustomTips) : { healthy: [], sick: [] };

        if (savedCondition) {
          const condition = savedCondition as "healthy" | "sick";
          const defaultReminders = defaultTips[condition]?.filter((tip: HealthTip) => tip.showOnHome) || [];
          const customReminders = customTips[condition]?.filter((tip: HealthTip) => tip.showOnHome) || [];
          
          setHealthReminders([...defaultReminders, ...customReminders]);
        }
      } catch (error) {
        console.error('Error loading health data:', error);
      }
    };

    loadHealthData();
    
   
    const interval = setInterval(loadHealthData, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!API_KEY) {
          setWeatherError(t('home.weather.apiError'));
          setLoadingWeather(false);
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherError(t('home.weather.permissionError'));
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
        setWeatherError(err.message ?? t('home.weather.generalError'));
      } finally {
        if (mounted) setLoadingWeather(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getGreetingMessage = () => {
    if (!healthCondition) return null;
    
    if (healthCondition === 'sick') {
      return {
        title: t('home.greeting.sickTitle'),
        subtitle: t('home.greeting.sickSubtitle'),
        bgColor: '#FFE5E5',
        textColor: '#D32F2F'
      };
    } else {
      return {
        title: t('home.greeting.healthyTitle'),
        subtitle: t('home.greeting.healthySubtitle'),
        bgColor: '#E8F5E8',
        textColor: '#2E7D32'
      };
    }
  };

  const greeting = getGreetingMessage();
  const nextMedicineReminder = getNextMedicineReminder();

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
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

      {/* Weather Card - iOS Modern Design */}
      <View style={[styles.weatherCard, darkMode && styles.darkWeatherCard]}>
        {loadingWeather ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <LansiaText style={[styles.loadingText, darkMode && styles.darkText]}>
              {t('home.weather.loading')}
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
                  📍 {weather.name ?? t('home.weather.yourLocation')}
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
                  {t('home.weather.recommendationTitle')}
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
              {weatherError ?? t('home.weather.generalError')}
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
                <View style={styles.reminderIconContainer}>
                  <LansiaText style={styles.reminderIcon}>💡</LansiaText>
                </View>
                <View style={styles.reminderContent}>
                  <LansiaText style={[styles.reminderTitle, darkMode && styles.darkText]}>
                    {t('home.healthReminders.tip')}
                  </LansiaText>
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
    color: '#8E8E93',
  },
  smallLabel: {
    fontSize: 16,
    marginRight: 8,
  },

  // Greeting Card Styles
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

  // Medicine Reminder Card Styles
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
    color: '#8E8E93',
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

  // Menu Grid Styles
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
});

