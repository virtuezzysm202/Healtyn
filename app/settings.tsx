import { View, Text, StyleSheet } from 'react-native'

export default function SettingsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Pengaturan</Text>
      <Text style={styles.text}>Fitur ini akan datang segera!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004B8D',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
})
