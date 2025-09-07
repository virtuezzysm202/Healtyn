import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";

// Translation object
const translations = {
  id: {
    title: "Profil",
    name: "Nama",
    age: "Usia",
    gender: "Jenis Kelamin",
    genderOptions: ["Laki-laki", "Perempuan"],
    address: "Alamat",
    save: "Simpan",
    edit: "Edit",
    cancel: "Batal",
    saved: "Profil berhasil disimpan!",
    updated: "Profil berhasil diperbarui!",
    namePlaceholder: "Masukkan nama Anda",
    agePlaceholder: "Masukkan usia Anda",
    addressPlaceholder: "Masukkan alamat lengkap Anda",
    back: "Kembali",
    emptyProfile: "Belum ada data profil",
    fillProfile: "Silakan isi profil Anda",
  },
  en: {
    title: "Profile",
    name: "Name",
    age: "Age",
    gender: "Gender",
    genderOptions: ["Male", "Female"],
    address: "Address",
    save: "Save",
    edit: "Edit",
    cancel: "Cancel",
    saved: "Profile saved successfully!",
    updated: "Profile updated successfully!",
    namePlaceholder: "Enter your name",
    agePlaceholder: "Enter your age",
    addressPlaceholder: "Enter your full address",
    back: "Back",
    emptyProfile: "No profile data yet",
    fillProfile: "Please fill your profile",
  },
};

export default function ProfileOfflineSettings() {
  const { language } = useSettings();
  const t = translations[language];
  const router = useRouter();

  // State form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setName("");
      setAge("");
      setAddress("");
      setGender(null);
      setHasProfile(false);
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", language === 'id' ? "Nama tidak boleh kosong" : "Name cannot be empty");
      return;
    }

    if (!gender) {
      Alert.alert("Error", language === 'id' ? "Pilih jenis kelamin" : "Please select gender");
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    Animated.sequence([
      Animated.timing(fadeAnim, { duration: 200, toValue: 0.7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { duration: 200, toValue: 1, useNativeDriver: true }),
    ]).start();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const message = hasProfile ? t.updated : t.saved;
      Alert.alert("Sukses", message);
      setHasProfile(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", language === 'id' ? "Gagal menyimpan profil" : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    loadProfileData();
  };

  const goBack = () => {
    try {
      router.push("/(tabs)/settings"); 
    } catch (error) {
      console.error("Navigation error:", error);
      router.push("/(tabs)/settings");
    }
  };

  const renderViewMode = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {name ? (
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person-circle-outline" size={64} color="#3b82f6" />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name || t.emptyProfile}</Text>
          {!name && <Text style={styles.profileSubtext}>{t.fillProfile}</Text>}
        </View>
      </View>

      {(name || age || gender || address) ? (
        <View style={styles.profileDetails}>
          {name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.name}</Text>
              <Text style={styles.detailValue}>{name}</Text>
            </View>
          )}

          {age && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.age}</Text>
              <Text style={styles.detailValue}>{age} tahun</Text>
            </View>
          )}

          {gender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.gender}</Text>
              <Text style={styles.detailValue}>{gender}</Text>
            </View>
          )}

          {address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.address}</Text>
              <Text style={styles.detailValue}>{address}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={[styles.profileSubtext, { textAlign: "center" }]}>
          {t.fillProfile}
        </Text>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
        activeOpacity={0.8}
      >
        <Text style={styles.editButtonText}>✏️ {t.edit}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditMode = () => (
    <View style={styles.form}>
      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.name} *</Text>
        <TextInput
          style={[styles.input, !name.trim() && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder={t.namePlaceholder}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Age */}
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

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.address}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder={t.addressPlaceholder}
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.gender}</Text>
        <View style={styles.optionRow}>
          {t.genderOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                gender === option && styles.optionButtonSelected
              ]}
              onPress={() => setGender(option)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === option && styles.optionTextSelected
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>{t.cancel}</Text>
        </TouchableOpacity>

        <Animated.View style={{ flex: 2, opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaving ? "time-outline" : "save-outline"}
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.saveButtonText}>
              {isSaving ? "Menyimpan..." : t.save}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <ScrollView 
  style={[styles.container]}
  contentContainerStyle={{ paddingBottom: 50 }}
>
      <View style={styles.content}>
       {/* Header */}
       <View style={styles.header}>
  <TouchableOpacity onPress={goBack} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#3b82f6" />
  </TouchableOpacity>
  <Text style={styles.title}>{t.title}</Text>
</View>

        {/* Content */}
        {!hasProfile || isEditing ? renderEditMode() : renderViewMode()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    marginBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    borderRadius: 12,
    zIndex: 10, 
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    flex: 1,
    zIndex: 1,
  },

  // Profile card
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 2,
  },
  profileSubtext: {
    fontSize: 14,
    color: "#718096",
    fontStyle: "italic",
  },
  profileDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#1a202c",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Form
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a202c",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  inputError: {
    borderColor: "#e53e3e",
    backgroundColor: "#fed7d7",
  },
  textArea: {
    height: 80,
    paddingTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4a5568",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 2,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
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
    fontWeight: "700",
  },

  // Gender option
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f7fafc",
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  optionText: {
    fontSize: 16,
    color: "#1a202c",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
