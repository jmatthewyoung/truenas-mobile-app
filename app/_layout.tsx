import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// App always renders in dark mode to match TrueNAS navy aesthetic
export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-server-modal"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
