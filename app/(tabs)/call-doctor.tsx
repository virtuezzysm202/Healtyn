import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import LansiaText from '../../components/ui/LansiaText';
import i18n from "../../utils/i18n";

export default function CallDoctorPage() {
  const emergencyNumbers = [
    { id: '1', label: '🚑 Ambulans 118/119', phone: 'tel:118' },
    { id: '2', label: 'PMI Pusat (021-7992325)', phone: 'tel:0217992325' },
  ];

  const [favDoctors, setFavDoctors] = useState<{id: string, name: string, phone: string}[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const loadFav = async () => {
      const data = await AsyncStorage.getItem('favDoctors');
      if (data) setFavDoctors(JSON.parse(data));
    };
    loadFav();
  }, []);

  const saveFavDoctors = async (list: any) => {
    setFavDoctors(list);
    await AsyncStorage.setItem('favDoctors', JSON.stringify(list));
  };

  const addDoctor = () => {
    if (!newName || !newPhone) {
      Alert.alert(
        i18n.translate("callDoctor.alertIncompleteTitle"),
        i18n.translate("callDoctor.alertIncompleteMessage")
      );
      return;
    }
    const newDoc = { id: Date.now().toString(), name: newName, phone: `tel:${newPhone}` };
    saveFavDoctors([...favDoctors, newDoc]);
    setNewName('');
    setNewPhone('');
  };

  const confirmDeleteDoctor = (id: string) => {
    Alert.alert(
      i18n.translate("callDoctor.confirmDeleteTitle") || "Confirm Delete",
      i18n.translate("callDoctor.confirmDeleteMessage") || "Are you sure you want to remove this doctor?",
      [
        { text: i18n.translate("callDoctor.cancel") || "Cancel", style: 'cancel' },
        { text: i18n.translate("callDoctor.delete") || "Delete", style: 'destructive', onPress: () => deleteDoctor(id) }
      ]
    );
  };

  const deleteDoctor = (id: string) => {
    const updated = favDoctors.filter(doc => doc.id !== id);
    saveFavDoctors(updated);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(phone).catch(() => {
      Alert.alert(
        i18n.translate("callDoctor.callErrorTitle"),
        i18n.translate("callDoctor.callErrorMessage")
      );
    });
  };

  const renderDoctorItem = ({ item }: { item: {id: string, name: string, phone: string} }) => (
    <View style={styles.doctorItem}>
      <Pressable style={styles.callButton} onPress={() => handleCall(item.phone)}>
        <LansiaText style={styles.callText}>
          {item.name} ({item.phone.replace('tel:', '')})
        </LansiaText>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={() => confirmDeleteDoctor(item.id)}>
        <Feather name="trash-2" size={24} color="#fff" />
      </Pressable>
    </View>
  );

  const ListHeader = useMemo(() => (
    <>
      <LansiaText style={styles.title}>{i18n.translate("callDoctor.title")}</LansiaText>
      <LansiaText style={styles.desc}>{i18n.translate("callDoctor.subtitle")}</LansiaText>

      {emergencyNumbers.map(item => (
        <Pressable key={item.id} style={styles.callButton} onPress={() => handleCall(item.phone)}>
          <LansiaText style={styles.callText}>{item.label}</LansiaText>
        </Pressable>
      ))}

      <LansiaText style={[styles.title, { fontSize: 22, marginTop: 30 }]}>
        {i18n.translate("callDoctor.favoriteTitle")}
      </LansiaText>

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
    </>
  ), [newName, newPhone, favDoctors]); // hanya re-render jika state input berubah

  return (
    <KeyboardAwareFlatList
      data={favDoctors}
      keyExtractor={item => item.id}
      renderItem={renderDoctorItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <LansiaText style={[styles.desc, { marginTop: 12 }]}>
          {i18n.translate("callDoctor.noFavorites")}
        </LansiaText>
      }
      contentContainerStyle={{ padding: 24, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 80 : 40}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', color: '#002147', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, textAlign: 'center', marginBottom: 16, color: '#1B2631', lineHeight: 22 },
  callButton: { backgroundColor: '#004B8D', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, marginVertical: 6 },
  callText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  inputContainer: { marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 16 },
  doctorItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  deleteButton: { marginLeft: 8, backgroundColor: '#E74C3C', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
