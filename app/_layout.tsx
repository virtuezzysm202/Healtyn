import { Stack } from 'expo-router';
import { SettingsProvider } from './contexts/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SettingsProvider>
  );
}