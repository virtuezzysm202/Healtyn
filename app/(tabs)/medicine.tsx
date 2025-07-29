import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'

type Medicine = {
  name: string
  disease: string
  note: string
  time: Date
}

export default function MedicinePage() {
  const [medicineName, setMedicineName] = useState('')
  const [disease, setDisease] = useState('')
  const [note, setNote] = useState('')
  const [time, setTime] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])

  const onChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false)
    if (selectedDate) setTime(selectedDate)
  }

  const addMedicine = () => {
    if (!medicineName || !disease) {
      Alert.alert('⚠️ Mohon isi nama obat dan penyakitnya.')
      return
    }

    const newMedicine: Medicine = {
      name: medicineName,
      disease,
      note,
      time,
    }

    setMedicines([...medicines, newMedicine].sort((a, b) => a.time.getTime() - b.time.getTime()))
    setMedicineName('')
    setDisease('')
    setNote('')
    Alert.alert('✅ Obat berhasil ditambahkan.')
  }

  const deleteMedicine = (index: number) => {
    Alert.alert('Hapus Obat', 'Yakin ingin menghapus?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setMedicines(medicines.filter((_, i) => i !== index))
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎗️ Pengingat Obat</Text>

      <TextInput
        value={medicineName}
        onChangeText={setMedicineName}
        placeholder="💊 Nama Obat"
        style={styles.input}
      />

      <TextInput
        value={disease}
        onChangeText={setDisease}
        placeholder="🩺 Untuk Penyakit"
        style={styles.input}
      />

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="📝 Catatan (misal: setelah makan)"
        style={styles.input}
      />

      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeButton}>
        <Text style={styles.timeText}>⏰ Jam: {format(time, 'HH:mm')}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          is24Hour
        />
      )}

      <TouchableOpacity onPress={addMedicine} style={styles.addButton}>
        <Text style={styles.addButtonText}>➕ Tambah Obat</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        keyExtractor={(_, i) => i.toString()}
        style={{ marginTop: 24 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada obat yang ditambahkan.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>💊 {item.name}</Text>
              <Text style={styles.cardDetail}>🩺 {item.disease}</Text>
              <Text style={styles.cardDetail}>🕒 {format(item.time, 'HH:mm')}</Text>
              {item.note ? <Text style={styles.cardNote}>📝 {item.note}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => deleteMedicine(index)}>
              <Text style={styles.deleteButton}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002147',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  timeButton: {
    backgroundColor: '#004B8D',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FFB347',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#002147',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  cardDetail: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  cardNote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  deleteButton: {
    fontSize: 22,
    color: '#DC2626',
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 24,
  },
})
