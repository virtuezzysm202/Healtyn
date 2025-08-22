import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../contexts/SettingsContext";

// Translation object
const translations = {
  id: {
    title: "Profil Offline",
    name: "Nama",
    age: "Usia",
    address: "Alamat",
    save: "Simpan",
    saved: "Tersimpan!",
    namePlaceholder: "Masukkan nama Anda",
    agePlaceholder: "Masukkan usia Anda",
    addressPlaceholder: "Masukkan alamat lengkap Anda",
    back: "Kembali",
  },
  en: {
    title: "Offline Profile",
    name: "Name",
    age: "Age",
    address: "Address",
    save: "Save",
    saved: "Saved!",
    namePlaceholder: "Enter your name",
    agePlaceholder: "Enter your age",
    addressPlaceholder: "Enter your full address",
    back: "Back",
  },
};

export default function ProfileOfflineSettings() {
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();

  // State untuk form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load data saat komponen mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Implementasi load dari storage
      // Contoh menggunakan AsyncStorage atau storage lainnya
      // const savedName = await AsyncStorage.getItem('offline_name');
      // const savedAge = await AsyncStorage.getItem('offline_age');
      // const savedAddress = await AsyncStorage.getItem('offline_address');
      
      // setName(savedName || '');
      // setAge(savedAge || '');
      // setAddress(savedAddress || '');
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    
    try {
      // Implementasi save ke storage
      // await AsyncStorage.setItem('offline_name', name);
      // await AsyncStorage.setItem('offline_age', age);
      // await AsyncStorage.setItem('offline_address', address);
      
      Alert.alert("Sukses", t.saved);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/settings");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/(tabs)/settings");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.name}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.namePlaceholder}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.age}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder={t.agePlaceholder}
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.address}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder={t.addressPlaceholder}
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Menyimpan..." : t.save}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 80,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});