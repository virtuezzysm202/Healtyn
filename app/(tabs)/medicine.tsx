import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import AdaptivePicker from "../../components/AdaptivePicker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function MedicineScreen() {
  const [medicineName, setMedicineName] = useState("");
  const [medicineForm, setMedicineForm] = useState("");
  const [disease, setDisease] = useState("");
  const [dosagePerTime, setDosagePerTime] = useState("");
  const [frequencyPerDay, setFrequencyPerDay] = useState("");
  const [usageTime, setUsageTime] = useState("");
  const [mustFinish, setMustFinish] = useState(false);
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const medicineForms = [
    { label: "Tablet", value: "tablet" },
    { label: "Kapsul", value: "kapsul" },
    { label: "Sirup", value: "sirup" },
    { label: "Tetes", value: "tetes" },
    { label: "Salep", value: "salep" },
  ];

  const renderDatePicker = (label: string, date: Date, setDate: (d: Date) => void) => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>{label}</Text>
          <input
            type="date"
            value={date.toISOString().split("T")[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            style={styles.webDateInput as React.CSSProperties}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>{label}</Text>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
          />
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pengingat Obat</Text>

      {/* Nama / Jenis Obat */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Jenis Obat</Text>
        <TextInput
          style={styles.input}
          placeholder="Ketik jenis obat (misal: Amoxicillin)"
          value={medicineName}
          onChangeText={setMedicineName}
        />
      </View>

      {/* Bentuk Obat */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Bentuk Obat</Text>
        <AdaptivePicker
          label="Pilih Bentuk Obat"
          selectedValue={medicineForm}
          onValueChange={(value) => {
            setMedicineForm(value);
            // reset related inputs if bentuk obat berubah
            setDosagePerTime("");
            setFrequencyPerDay("");
            setUsageTime("");
          }}
          items={medicineForms}
        />
      </View>

      {/* Penyakit */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Untuk Penyakit</Text>
        <TextInput
          style={styles.input}
          placeholder="Misal: Demam, Batuk, Flu"
          value={disease}
          onChangeText={setDisease}
        />
      </View>

      {/* Dosis Sekali Minum */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dosis Sekali Minum</Text>
        {medicineForm === "tablet" || medicineForm === "kapsul" ? (
          <TextInput
            style={styles.input}
            placeholder="Masukkan jumlah (angka)"
            keyboardType="numeric"
            value={dosagePerTime}
            onChangeText={setDosagePerTime}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Masukkan dosis (misal: 1 sendok, 5 ml)"
            value={dosagePerTime}
            onChangeText={setDosagePerTime}
          />
        )}
      </View>

      {/* Frekuensi Sehari */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Frekuensi Sehari</Text>
        {medicineForm === "tablet" || medicineForm === "kapsul" ? (
          <TextInput
            style={styles.input}
            placeholder="Berapa kali sehari (angka)"
            keyboardType="numeric"
            value={frequencyPerDay}
            onChangeText={setFrequencyPerDay}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Misal: 3 kali sehari"
            value={frequencyPerDay}
            onChangeText={setFrequencyPerDay}
          />
        )}
      </View>

      {/* Waktu Minum/Pakai */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Waktu Minum/Pakai</Text>
        {medicineForm === "tablet" || medicineForm === "kapsul" ? (
          <TextInput
            style={styles.input}
            placeholder="Setiap berapa jam (angka)"
            keyboardType="numeric"
            value={usageTime}
            onChangeText={setUsageTime}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Misal: Sebelum tidur, pagi dan sore"
            value={usageTime}
            onChangeText={setUsageTime}
          />
        )}
      </View>

      {/* Harus Dihabiskan */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Harus Dihabiskan?</Text>
        <Switch value={mustFinish} onValueChange={setMustFinish} />
      </View>

      {/* Tanggal Mulai & Selesai */}
      {renderDatePicker("Tanggal Mulai", startDate, setStartDate)}
      {renderDatePicker("Tanggal Selesai", endDate, setEndDate)}

      {/* Catatan */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Catatan</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Peringatan atau informasi tambahan"
          multiline
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000",
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  webDateInput: {
    height: 40,
    fontSize: 16,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
});
