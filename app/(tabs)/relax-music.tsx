import { ScrollView, StyleSheet } from 'react-native';
import LansiaText from '../../components/ui/LansiaText';

export default function RelaxMusicPage() {
  return (
    <ScrollView style={styles.container}>
      <LansiaText style={styles.title}>🎵 Musik Relaksasi & Meditasi</LansiaText>
      <LansiaText style={styles.text}>
        Dengarkan musik relaksasi untuk membantu menenangkan pikiran dan tubuh.
      </LansiaText>
      {/* Di sini nanti bisa tambahkan daftar musik atau player audio */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});
