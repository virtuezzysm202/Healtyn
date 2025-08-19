import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Import library OCR baru
import TextRecognition from '@react-native-ml-kit/text-recognition';

type TextBlock = { text: string };

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Aplikasi memerlukan akses ke galeri untuk memilih gambar.'
        );
      }
    })();
  }, []);

  const runOCR = async (uri: string) => {
    // Jalankan OCR dengan library baru
    const result = await TextRecognition.recognize(uri);
    console.log('OCR Result:', result);

    return result;
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setTextBlocks([]);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        const ocrResult = await runOCR(uri);
        let extracted: TextBlock[] = [];

        if (ocrResult?.text) {
          extracted = [{ text: ocrResult.text }];
        }

        if (extracted.length === 0) {
          Alert.alert('No Text Found', 'Tidak ada teks yang terdeteksi dalam gambar.');
        } else {
          setTextBlocks(extracted);
        }
      }
    } catch (error: any) {
      console.error('OCR Error:', error);
      Alert.alert('Error', `Gagal memproses gambar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Aplikasi memerlukan akses ke kamera.');
        return;
      }

      setIsLoading(true);
      setTextBlocks([]);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        const ocrResult = await runOCR(uri);
        let extracted: TextBlock[] = [];

        if (ocrResult?.text) {
          extracted = [{ text: ocrResult.text }];
        }

        if (extracted.length > 0) {
          setTextBlocks(extracted);
        }
      }
    } catch (error: any) {
      console.error('Camera OCR Error:', error);
      Alert.alert('Error', `Gagal mengambil foto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.platformInfo}>
        Platform: {Platform.OS} | OCR: Native (@react-native-ml-kit/text-recognition)
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Memproses...' : 'Pilih Gambar'}
          onPress={pickImage}
          disabled={isLoading}
        />
        {Platform.OS !== 'web' && (
          <View style={styles.buttonSpacer}>
            <Button
              title="Ambil Foto"
              onPress={takePhoto}
              disabled={isLoading}
            />
          </View>
        )}
      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" />
          <Text style={styles.loadingText}>Sedang membaca teks...</Text>
        </View>
      )}

      {!isLoading && textBlocks.length > 0 && (
        <View style={styles.textContainer}>
          <Text style={styles.resultHeader}>Hasil OCR:</Text>
          {textBlocks.map((block, i) => (
            <View key={i} style={styles.textBlockContainer}>
              <Text style={styles.blockText}>{block.text}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  platformInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  buttonSpacer: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  textContainer: { marginTop: 20 },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textBlockContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  blockText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
