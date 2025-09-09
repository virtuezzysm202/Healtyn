import { Feather } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LansiaText from '../../components/ui/LansiaText';
import i18n from "../../utils/i18n";

interface MusicItem {
  id: number;
  title: string;
  description: string;
  duration?: number;
  uri: any;
}

export default function LifestyleScreen() {
  const [musicList, setMusicList] = useState<MusicItem[]>([
    {
      id: 1,
      title: i18n.translate("music.tracks.nature.title"),
      description: i18n.translate("music.tracks.nature.desc"),
      uri: require('../../assets/audio/nature-sounds.mp3'),
    },
    {
      id: 2,
      title: i18n.translate("music.tracks.piano.title"),
      description: i18n.translate("music.tracks.piano.desc"),
      uri: require('../../assets/audio/piano-relaxing.mp3'),
    },
    {
      id: 3,
      title: i18n.translate("music.tracks.rain.title"),
      description: i18n.translate("music.tracks.rain.desc"),
      uri: require('../../assets/audio/rain-sounds.mp3'),
    },
  ]);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const stopMusic = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setCurrentTrack(null);
      setIsPlaying(false);
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  };

  const playSound = async (musicItem: MusicItem) => {
    try {
      setIsLoading(true);

      if (currentTrack?.id === musicItem.id && isPlaying) {
        await stopMusic();
        setIsLoading(false);
        return;
      }

      if (sound) await stopMusic();

      const { sound: newSound } = await Audio.Sound.createAsync(
        musicItem.uri,
        { shouldPlay: true, isLooping: true }
      );

      const status = await newSound.getStatusAsync();
      if ((status as any).isLoaded && (status as any).durationMillis) {
        setMusicList((prev) =>
          prev.map((m) =>
            m.id === musicItem.id ? { ...m, duration: (status as any).durationMillis } : m
          )
        );
      }

      setSound(newSound);
      setCurrentTrack(musicItem);
      setIsPlaying(true);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
      setIsLoading(false);
      Alert.alert(
        i18n.translate("music.errorTitle"),
        i18n.translate("music.errorMessage")
      );
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const [timer, setTimer] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (remaining > 0) {
      interval = setInterval(() => setRemaining(prev => prev - 1), 1000);
    } else if (remaining === 0 && timer) {
      Alert.alert(i18n.translate("meditation.completed") || "Meditation completed 🙏");
      setTimer(null);
    }
    return () => clearInterval(interval);
  }, [remaining]);

  const startMeditation = (minutes: number) => {
    setTimer(minutes);
    setRemaining(minutes * 60);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const days = [
    i18n.translate("workout.days.monday") || "Monday",
    i18n.translate("workout.days.tuesday") || "Tuesday",
    i18n.translate("workout.days.wednesday") || "Wednesday",
    i18n.translate("workout.days.thursday") || "Thursday",
    i18n.translate("workout.days.friday") || "Friday",
    i18n.translate("workout.days.saturday") || "Saturday",
    i18n.translate("workout.days.sunday") || "Sunday"
  ];
  const [workouts, setWorkouts] = useState<{[key: string]: string}>({});

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        {/* MUSIC */}
        <LansiaText style={styles.title}>{i18n.translate("music.title")}</LansiaText>
        {musicList.map(item => (
          <MusicCard
            key={item.id}
            item={item}
            isActive={currentTrack?.id === item.id && isPlaying}
            isLoading={isLoading && currentTrack?.id === item.id}
            onPress={() => playSound(item)}
            formatDuration={formatDuration}
          />
        ))}

        {/* MEDITATION */}
        <LansiaText style={styles.title}>{i18n.translate("meditation.title") || "Meditation"}</LansiaText>
        <View style={styles.card}>
          {timer ? (
            <LansiaText style={styles.meditationTimer}>{formatTime(remaining)}</LansiaText>
          ) : (
            <LansiaText style={styles.musicDesc}>
              {i18n.translate("meditation.selectDuration") || "Select meditation duration"}
            </LansiaText>
          )}
          <View style={styles.meditationButtons}>
            {[5, 10, 15].map(m => (
              <Pressable key={m} style={styles.meditationBtn} onPress={() => startMeditation(m)}>
                <LansiaText style={styles.meditationBtnText}>
                  {m} {i18n.translate("meditation.minutes") || "min"}
                </LansiaText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* WORKOUT */}
        <LansiaText style={styles.title}>{i18n.translate("workout.title") || "Workout Plan"}</LansiaText>
        <View style={styles.card}>
          {days.map(day => (
            <View key={day} style={styles.workoutRow}>
              <LansiaText style={styles.dayLabel}>{day}</LansiaText>
              <TextInput
                style={styles.input}
                placeholder={i18n.translate("workout.placeholder") || "Enter workout..."}
                value={workouts[day] || ''}
                onChangeText={text => setWorkouts(prev => ({ ...prev, [day]: text }))}
              />
            </View>
          ))}
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

function MusicCard({ item, isActive, isLoading, onPress, formatDuration }: any) {
  return (
    <Pressable style={[styles.card, isActive && styles.cardActive]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <LansiaText style={styles.musicTitle}>{item.title}</LansiaText>
          <LansiaText style={styles.musicDesc}>{item.description}</LansiaText>
          <LansiaText style={styles.musicDuration}>
            {i18n.translate("music.duration")}: {item.duration ? formatDuration(item.duration) : '...'}
          </LansiaText>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Feather
            name={isActive ? 'pause-circle' : 'play-circle'}
            size={40}
            color={isActive ? '#FF6B6B' : '#007AFF'}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', marginVertical: 12, color: '#111827' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: { borderWidth: 2, borderColor: '#007AFF' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  musicTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#1F2937' },
  musicDesc: { fontSize: 14, color: '#4B5563', marginBottom: 6 },
  musicDuration: { fontSize: 13, color: '#6B7280' },

  meditationTimer: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' },
  meditationButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  meditationBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  meditationBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  workoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dayLabel: { width: 80, fontWeight: '600', color: '#111827' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    fontSize: 14,
    color: '#111827'
  }
});
