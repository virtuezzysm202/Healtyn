import { Stack } from "expo-router";
import { SettingsProvider } from "../contexts/SettingsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Hanya render tab layout, bukan index langsung */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SettingsProvider>
  );
}
