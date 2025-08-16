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

// OCR function pakai Tesseract.js kalau di web
let ocrFunction: (uri: string) => Promise<any>;

if (Platform.OS === 'web') {
  ocrFunction = async (uri: string) => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng'); // bisa tambah "ind" untuk bahasa Indonesia
    const { data: { text } } = await worker.recognize(uri);
    await worker.terminate();
    return [{ text }];
  };
} else {
  try {
    // Native OCR (Android/iOS pakai expo-mlkit-ocr)
    const OCRModule = require('expo-mlkit-ocr');
    const possibleFunction =
      OCRModule.recognizeFromUri ||
      OCRModule.scanFromURLAsync ||
      OCRModule.default?.recognizeFromUri ||
      OCRModule.default;

    if (typeof possibleFunction === 'function') {
      ocrFunction = possibleFunction;
    } else {
      throw new Error('No OCR function found in module');
    }
  } catch (error) {
    console.warn('OCR tidak tersedia, pakai dummy fallback.');
    ocrFunction = async () => [{ text: 'OCR hanya tersedia di build asli, bukan di Expo Go.' }];
  }
}

type TextBlock = { text: string };

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Aplikasi memerlukan akses ke galeri untuk memilih gambar.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setTextBlocks([]);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        const ocrResult = await ocrFunction(uri);

        let extracted: TextBlock[] = [];
        if (Array.isArray(ocrResult)) {
          extracted = ocrResult.map((b: any) => ({ text: b.text || String(b) }));
        } else if (ocrResult?.text) {
          extracted = [{ text: ocrResult.text }];
        }
        setTextBlocks(extracted);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memproses gambar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title={isLoading ? 'Memproses...' : 'Pilih Gambar'} onPress={pickImage} disabled={isLoading} />

      {image && <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="contain" />}

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
            <Text key={i} style={styles.blockText}>{block.text}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  imagePreview: { width: '100%', height: 300, marginVertical: 20, borderRadius: 8 },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  textContainer: { marginTop: 20 },
  resultHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  blockText: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
});
