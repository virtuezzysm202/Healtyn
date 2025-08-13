import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

type TextBlock = {
  text: string;
  [key: string]: any;
};

type OCRFunction = (uri: string) => Promise<any>;

// Coba import module OCR, kalau gagal pakai dummy fallback
let ocrFunction: OCRFunction;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OCRModule = require('expo-mlkit-ocr');
  const possibleFunction = OCRModule.recognizeFromUri || 
                          OCRModule.scanFromURLAsync || 
                          OCRModule.default?.recognizeFromUri ||
                          OCRModule.default;
  
  if (typeof possibleFunction === 'function') {
    ocrFunction = possibleFunction;
  } else {
    throw new Error('No OCR function found in module');
  }
} catch (error) {
  console.warn('expo-mlkit-ocr module not found, using fallback dummy OCR function');
  
  // Dummy OCR function, hanya mengembalikan teks dummy saja
  ocrFunction = async (uri: string) => {
    return [{ text: 'OCR tidak tersedia di Expo Go. Gunakan Development Build untuk fitur penuh.' }];
  };
}

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
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        if (!uri) throw new Error('URI gambar tidak valid');

        console.log('Starting OCR process for:', uri);
        const ocrResult = await ocrFunction(uri);
        console.log('Raw OCR result:', ocrResult);

        let extractedBlocks: TextBlock[] = [];

        if (ocrResult) {
          if (Array.isArray(ocrResult)) {
            extractedBlocks = ocrResult.map((block: any) => {
              if (typeof block === 'string') {
                return { text: block };
              }
              return { text: block.text || 'No text', ...block };
            });
          } else if (ocrResult.blocks && Array.isArray(ocrResult.blocks)) {
            extractedBlocks = ocrResult.blocks.map((block: any) => ({
              text: block.text || 'No text',
              ...block
            }));
          } else if (ocrResult.text) {
            extractedBlocks = [{ text: ocrResult.text }];
          } else if (typeof ocrResult === 'string') {
            extractedBlocks = [{ text: ocrResult }];
          }
        }

        setTextBlocks(extractedBlocks);
        console.log(`OCR completed. Found ${extractedBlocks.length} text blocks.`);
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert(
        'Error',
        `Gagal memproses gambar: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setTextBlocks([]);
      setImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTextBlocks = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Memproses gambar...</Text>
        </View>
      );
    }

    if (textBlocks.length === 0) {
      return (
        <Text style={styles.noTextMessage}>
          {image ? 'Tidak ada teks terdeteksi' : 'Pilih gambar untuk memulai'}
        </Text>
      );
    }

    return (
      <View style={styles.textContainer}>
        <Text style={styles.resultHeader}>Hasil OCR:</Text>
        {textBlocks.map((block, index) => (
          <View key={index} style={styles.textBlock}>
            <Text style={styles.blockText}>
              {block.text || 'No text'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button 
        title={isLoading ? "Memproses..." : "Pilih Gambar"} 
        onPress={pickImage} 
        disabled={isLoading}
      />
      
      {image && (
        <Image 
          source={{ uri: image }} 
          style={styles.imagePreview} 
          resizeMode="contain"
          onError={(error) => {
            console.error('Error loading image:', error);
            Alert.alert('Error', 'Gagal memuat gambar');
          }}
        />
      )}
      
      {renderTextBlocks()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noTextMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  textContainer: {
    marginTop: 20,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
  blockText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
