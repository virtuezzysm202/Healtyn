import { Feather } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
  //MUSIC
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

  // format durasi jadi mm:ss
  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const playSound = async (musicItem: MusicItem) => {
    try {
      setIsLoading(true);

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      if (currentTrack?.id === musicItem.id && isPlaying) {
        await sound?.unloadAsync();
        setSound(null);
        setCurrentTrack(null);
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }

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

  //MEDITASI
  const [timer, setTimer] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (remaining > 0) {
      interval = setInterval(() => setRemaining((prev) => prev - 1), 1000);
    } else if (remaining === 0 && timer) {
      Alert.alert("Meditasi selesai 🙏");
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

  // WORKOUT
  const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  const [workouts, setWorkouts] = useState<{[key: string]: string}>({});

  // RENDER 
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      
      {/* MUSIC */}
      <LansiaText style={styles.title}> Musik Relaksasi</LansiaText>
      {musicList.map((item) => (
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
      <LansiaText style={styles.title}> Meditasi</LansiaText>
      <View style={styles.card}>
        {timer ? (
          <LansiaText style={styles.meditationTimer}>{formatTime(remaining)}</LansiaText>
        ) : (
          <LansiaText style={styles.musicDesc}>Pilih durasi meditasi</LansiaText>
        )}
        <View style={styles.meditationButtons}>
          {[5,10,15].map((m) => (
            <Pressable key={m} style={styles.meditationBtn} onPress={() => startMeditation(m)}>
              <LansiaText style={styles.meditationBtnText}>{m} mnt</LansiaText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* WORKOUT */}
      <LansiaText style={styles.title}> Workout Plan</LansiaText>
      <View style={styles.card}>
        {days.map((day) => (
          <View key={day} style={styles.workoutRow}>
            <LansiaText style={styles.dayLabel}>{day}</LansiaText>
            <TextInput
              style={styles.input}
              placeholder="Isi workout..."
              value={workouts[day] || ''}
              onChangeText={(text) => setWorkouts((prev) => ({...prev, [day]: text}))}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

//COMPONENT MUSIC CARD 
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

// STYLES 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, color: '#111827' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: { borderWidth: 2, borderColor: '#007AFF' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  musicTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#1F2937' },
  musicDesc: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
  musicDuration: { fontSize: 13, color: '#6B7280' },

  meditationTimer: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' },
  meditationButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  meditationBtn: {
    backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 8, marginHorizontal: 6
  },
  meditationBtnText: { color: 'white', fontWeight: 'bold' },

  workoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dayLabel: { width: 70, fontWeight: '600' },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 8, backgroundColor: '#F3F4F6'
  }
});
