// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="medicine" options={{ title: 'Pengingat Obat' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan Teks' }} />
    </Tabs>
  )
}
