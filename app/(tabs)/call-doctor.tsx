import { View, StyleSheet, Linking, Alert, Pressable } from 'react-native'
import LansiaText from '../../components/ui/LansiaText'

export default function CallDoctorPage() {
  const phoneNumber = 'tel:081234567890' // Ganti dengan nomor dokter asli

  const handleCall = () => {
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Gagal melakukan panggilan', 'Periksa sambungan telepon Anda.')
    })
  }

  return (
    <View style={styles.container}>
      <LansiaText style={styles.title}>Hubungi Dokter</LansiaText>
      <LansiaText style={styles.desc}>Tekan tombol di bawah untuk langsung menelepon dokter Anda.</LansiaText>
      <Pressable style={styles.callButton} onPress={handleCall}>
        <LansiaText style={styles.callText}>☎️ Panggil Sekarang</LansiaText>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002147',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#1B2631',
    lineHeight: 26,
  },
  callButton: {
    backgroundColor: '#004B8D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  callText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})
