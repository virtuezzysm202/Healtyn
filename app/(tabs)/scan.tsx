import { View, Button, Image, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import LansiaText from '../../components/ui/LansiaText'

export default function ScanPage() {
  const [image, setImage] = useState(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      // Kirim ke API OCR / tampilkan teks
    }
  }

  return (
    <View style={styles.container}>
      <LansiaText style={styles.title}>📖 Pindai Teks dari Buku</LansiaText>
      <Button title="Pilih Gambar dari Galeri" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  image: {
    width: 280,
    height: 300,
    marginTop: 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
})
