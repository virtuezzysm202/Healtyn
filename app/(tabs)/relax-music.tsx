// app/(tabs)/musik.tsx
import { Feather } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import LansiaText from '../../components/ui/LansiaText';
import i18n from "../../utils/i18n";
interface MusicItem {
  id: number;
  title: string;
  description: string;
  duration?: number; // dalam ms
  uri: any;
}

export default function MusikScreen() {
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

      // stop & unload jika ada sound sebelumnya
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // jika lagu sama diklik saat sedang main → stop
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

      // ambil status (durasi)
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

      // event selesai
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

  // cleanup 
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <ScrollView 
    style={[styles.container]}
    contentContainerStyle={{ paddingBottom: 50 }}
  >
      <LansiaText style={styles.title}>{i18n.translate("music.title")}</LansiaText>
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
    </ScrollView>
  );
}

// 🎵 Kartu Musik
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

// styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
});
