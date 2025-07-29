import { View, StyleSheet, ScrollView, Switch, Pressable } from 'react-native'
import { useState } from 'react'
import LansiaText from '../../components/ui/LansiaText'
import { router } from 'expo-router'
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons'

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const menuItems = [
    { icon: 'medkit', label: 'Pengingat Obat', route: '/medicine' },
    { icon: 'book', label: 'Pindai Buku', route: '/scan' },
    { icon: 'user-md', label: 'Hubungi Dokter', route: '/call-doctor' },
    { icon: 'users', label: 'Hubungi Keluarga', route: '/family' },
    { icon: 'heartbeat', label: 'Kesehatan Hari Ini', route: '/health' },
  ]

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <LansiaText style={styles.appName}>Lansia Helper</LansiaText>
        <View style={styles.rightHeader}>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
          <Pressable onPress={() => router.push('/settings')} style={styles.profileButton}>
            <Feather name="settings" size={24} color={darkMode ? '#fff' : '#004B8D'} />
          </Pressable>
        </View>
      </View>

      {/* Cuaca & Reminder */}
      <View style={styles.statusCard}>
        <LansiaText style={styles.statusText}>☀️ Cuaca Hari Ini: Cerah, 30°C</LansiaText>
        <LansiaText style={styles.statusText}>👕 Rekomendasi: Gunakan topi & pakaian tipis</LansiaText>
        <LansiaText style={styles.statusText}>🕙 Reminder: Minum air jam 10:00</LansiaText>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable key={index} style={styles.menuItem} onPress={() => router.push(item.route)}>
            <FontAwesome5 name={item.icon} size={28} color="#004B8D" />
            <LansiaText style={styles.menuLabel}>{item.label}</LansiaText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileButton: {
    padding: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004B8D',
  },
  statusCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  menuLabel: {
    marginTop: 10,
    fontSize: 16,
    color: '#004B8D',
    textAlign: 'center',
  },
})
