import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// sementara pakai dummy auth state
const isLoggedIn = false;

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function FamilyScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load contacts dari AsyncStorage
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem("contacts");
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load contacts", err);
    }
  };

  const saveContacts = async (data: Contact[]) => {
    try {
      await AsyncStorage.setItem("contacts", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save contacts", err);
    }
  };

  const addOrUpdateContact = () => {
    if (name.trim() && phone.trim()) {
      if (editingId) {
        // Update
        const updated = contacts.map((c) =>
          c.id === editingId ? { ...c, name, phone } : c
        );
        setContacts(updated);
        saveContacts(updated);
        setEditingId(null);
      } else {
        // Add
        const newContact = { id: Date.now().toString(), name, phone };
        const updated = [...contacts, newContact];
        setContacts(updated);
        saveContacts(updated);
      }
      setName("");
      setPhone("");
    }
  };

  const deleteContact = (id: string) => {
    Alert.alert("Hapus Kontak", "Yakin mau hapus kontak ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          const updated = contacts.filter((c) => c.id !== id);
          setContacts(updated);
          saveContacts(updated);
        },
      },
    ]);
  };

  const editContact = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setEditingId(contact.id);
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Family & Friends</Text>

      {/* Input add/edit contact */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Nama"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="No. Telepon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={addOrUpdateContact}
        >
          <Feather name={editingId ? "check" : "plus"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List contacts */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactInfo}
              onPress={() => callContact(item.phone)}
            >
              <Feather name="phone" size={18} color="#007AFF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => editContact(item)}
                style={styles.iconBtn}
              >
                <Feather name="edit-2" size={18} color="#FF9500" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteContact(item.id)}
                style={styles.iconBtn}
              >
                <Feather name="trash-2" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Extra feature untuk user login */}
      {isLoggedIn ? (
        <TouchableOpacity style={styles.chatBtn}>
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={styles.chatBtnText}>Buat Grup Chat</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.loginBox}>
          <Text style={styles.loginText}>
            Sign in / Login to chat with family members or friends
          </Text>
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
  },

  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  contactName: { fontSize: 16, fontWeight: "600" },
  contactPhone: { fontSize: 14, color: "gray" },
  actions: { flexDirection: "row" },
  iconBtn: { marginLeft: 12 },

  chatBtn: {
    flexDirection: "row",
    backgroundColor: "#34C759",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  chatBtnText: { color: "#fff", fontSize: 16, marginLeft: 8 },

  loginBox: {
    marginTop: 30,
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
  },
  loginText: {
    textAlign: "center",
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  loginBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
