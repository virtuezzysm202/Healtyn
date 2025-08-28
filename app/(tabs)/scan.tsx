import { Feather } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as OCR from "expo-mlkit-ocr";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import LansiaText from "../../components/ui/LansiaText";
import { useTranslation } from "../../hooks/useTranslation";

type TextBlock = { text: string };

export default function ScanScreen() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("scan.permissionTitle"),
          t("scan.permissionGallery")
        );
      }
    })();
  }, []);

  const runOCR = async (uri: string) => {
    const result = await OCR.scanFromUriAsync(uri);
    console.log("OCR Result:", result);
    return result;
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setTextBlocks([]);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false, // crop dihilangkan
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        const ocrResult = await runOCR(uri);
        let extracted: TextBlock[] = [];

        if (ocrResult?.blocks?.length > 0) {
          extracted = ocrResult.blocks.map((b: any) => ({ text: b.text }));
        }

        if (extracted.length === 0) {
          Alert.alert(
            t("scan.noTextTitle"), 
            t("scan.noTextMessage")
          );
        } else {
          setTextBlocks(extracted);
        }
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      Alert.alert(
        t("scan.errorTitle"), 
        `${t("scan.errorMessage")} ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("scan.permissionTitle"),
          t("scan.permissionCamera")
        );
        return;
      }

      setIsLoading(true);
      setTextBlocks([]);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false, // crop dihilangkan
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);

        const ocrResult = await runOCR(uri);
        let extracted: TextBlock[] = [];

        if (ocrResult?.blocks?.length > 0) {
          extracted = ocrResult.blocks.map((b: any) => ({ text: b.text }));
        }

        if (extracted.length > 0) {
          setTextBlocks(extracted);
        }
      }
    } catch (error: any) {
      console.error("Camera OCR Error:", error);
      Alert.alert(
        t("scan.errorTitle"), 
        `${t("scan.errorMessage")} ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LansiaText style={styles.title}>
            {t("home.menu.scanBook")}
          </LansiaText>
          <LansiaText style={styles.subtitle}>
            Scan text from books, documents, or images
          </LansiaText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled
            ]}
            onPress={pickImage}
            disabled={isLoading}
          >
            <View style={styles.actionButtonContent}>
              <Feather name="image" size={24} color="#FFFFFF" />
              <LansiaText style={styles.actionButtonText}>
                {t("scan.pickImage")}
              </LansiaText>
            </View>
          </Pressable>

          {Platform.OS !== "web" && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled
              ]}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <View style={styles.actionButtonContent}>
                <Feather name="camera" size={24} color="#007AFF" />
                <LansiaText style={styles.actionButtonTextSecondary}>
                  {t("scan.takePhoto")}
                </LansiaText>
              </View>
            </Pressable>
          )}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <LansiaText style={styles.loadingTitle}>
              {t("scan.processing")}
            </LansiaText>
            <LansiaText style={styles.loadingSubtitle}>
              {t("scan.readingText")}
            </LansiaText>
          </View>
        )}

        {/* Image Preview */}
        {image && !isLoading && (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: image }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          </View>
        )}

        {/* OCR Results */}
        {textBlocks.length > 0 && !isLoading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Feather name="file-text" size={20} color="#007AFF" />
              <LansiaText style={styles.resultTitle}>
                {t("scan.resultHeader")}
              </LansiaText>
            </View>
            
            {textBlocks.map((block, i) => (
              <View key={i} style={styles.textBlock}>
                <LansiaText style={styles.blockText}>
                  {block.text}
                </LansiaText>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!image && !isLoading && textBlocks.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="scan" size={64} color="#C7C7CC" />
            <LansiaText style={styles.emptyTitle}>
              Ready to Scan
            </LansiaText>
            <LansiaText style={styles.emptySubtitle}>
              Choose an image or take a photo to extract text
            </LansiaText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  textBlock: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  blockText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
