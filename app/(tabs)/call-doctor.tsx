import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import LansiaText from '../../components/ui/LansiaText';
import i18n from "../../utils/i18n";

export default function CallDoctorPage() {
  const emergencyNumbers = [
    { id: '1', label: '🚑 Ambulans 118/119', phone: 'tel:118' },
    { id: '2', label: 'PMI Pusat (021-7992325)', phone: 'tel:0217992325' },
  ]

  const [favDoctors, setFavDoctors] = useState<{id: string, name: string, phone: string}[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    const loadFav = async () => {
      const data = await AsyncStorage.getItem('favDoctors')
      if (data) setFavDoctors(JSON.parse(data))
    }
    loadFav()
  }, [])

  const saveFavDoctors = async (list: any) => {
    setFavDoctors(list)
    await AsyncStorage.setItem('favDoctors', JSON.stringify(list))
  }

  const addDoctor = () => {
    if (!newName || !newPhone) {
      Alert.alert(
        i18n.translate("callDoctor.alertIncompleteTitle"),
        i18n.translate("callDoctor.alertIncompleteMessage")
      )
      return
    }
    const newDoc = { id: Date.now().toString(), name: newName, phone: `tel:${newPhone}` }
    const updated = [...favDoctors, newDoc]
    saveFavDoctors(updated)
    setNewName('')
    setNewPhone('')
  }

  const deleteDoctor = (id: string) => {
    const updated = favDoctors.filter(doc => doc.id !== id)
    saveFavDoctors(updated)
  }
  
  const handleCall = (phone: string) => {
    Linking.openURL(phone).catch(() => {
      Alert.alert(
        i18n.translate("callDoctor.callErrorTitle"),
        i18n.translate("callDoctor.callErrorMessage")
      )
    })
  }

  return (
    <View style={styles.container}>
      <LansiaText style={styles.title}>{i18n.translate("callDoctor.title")}</LansiaText>
      <LansiaText style={styles.desc}>{i18n.translate("callDoctor.subtitle")}</LansiaText>

      {/* Emergency Numbers */}
      {emergencyNumbers.map(item => (
        <Pressable key={item.id} style={styles.callButton} onPress={() => handleCall(item.phone)}>
          <LansiaText style={styles.callText}>{item.label}</LansiaText>
        </Pressable>
      ))}

      <LansiaText style={[styles.title, { fontSize: 22, marginTop: 30 }]}>
        {i18n.translate("callDoctor.favoriteTitle")}
      </LansiaText>

      {/* List of saved doctors */}
      <FlatList
  data={favDoctors}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <View style={styles.doctorItem}>
      <Pressable style={styles.callButton} onPress={() => handleCall(item.phone)}>
        <LansiaText style={styles.callText}>
          {item.name} ({item.phone.replace('tel:', '')})
        </LansiaText>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={() => deleteDoctor(item.id)}>
        <LansiaText style={styles.deleteText}>❌</LansiaText>
      </Pressable>
    </View>
  )}
  ListEmptyComponent={
    <LansiaText style={styles.desc}>
      {i18n.translate("callDoctor.noFavorites")}
    </LansiaText>
  }
/>
      {/* Add new doctor */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={i18n.translate("callDoctor.inputName")}
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        <TextInput
          placeholder={i18n.translate("callDoctor.inputPhone")}
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Pressable style={[styles.callButton, { marginTop: 8 }]} onPress={addDoctor}>
          <LansiaText style={styles.callText}>+ {i18n.translate("callDoctor.addDoctor")}</LansiaText>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#002147',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#1B2631',
    lineHeight: 22,
  },
  callButton: {
    backgroundColor: '#004B8D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 6,
  },
  callText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  
  deleteButton: {
    marginLeft: 8,
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
