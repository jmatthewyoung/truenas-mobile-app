import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceholderPane } from '@/components/dashboard/PlaceholderPane';
import { SystemInfoPane } from '@/components/dashboard/SystemInfoPane';
import { Colors } from '@/constants/theme';
import { generateToken } from '@/services/api/auth';
import { getSystemInfo } from '@/services/api/system';
import { SystemInfo } from '@/services/api/types';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/storage/auth';
import { Server, TrueNASVersion } from '@/types/server';

const colors = Colors.dark;

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    protocol: string;
    host: string;
    username: string;
    password: string;
    version: string;
  }>();

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    if (!params.id || !params.protocol || !params.host || !params.username || !params.password) {
      router.replace('/');
      return;
    }

    const server: Server = {
      id: params.id,
      protocol: params.protocol as 'http://' | 'https://',
      host: params.host,
      username: params.username,
      password: params.password,
      version: (params.version || '24.10.2.3') as TrueNASVersion,
    };

    const baseUrl = `${server.protocol}${server.host}`;

    try {
      setIsLoading(true);
      setError(null);

      // Check for existing token
      let token = await getAuthToken(server.id);

      // If no token, generate one
      if (!token) {
        token = await generateToken(server);
        await setAuthToken(server.id, token);
      }

      // Fetch system info
      try {
        const info = await getSystemInfo(baseUrl, token);
        setSystemInfo(info);
      } catch (err) {
        // If token is invalid, try regenerating
        if (err instanceof Error && err.message.includes('401')) {
          await clearAuthToken(server.id);
          token = await generateToken(server);
          await setAuthToken(server.id, token);
          const info = await getSystemInfo(baseUrl, token);
          setSystemInfo(info);
        } else {
          throw err;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';

      // If auth failed completely, redirect to login
      if (message.includes('Invalid credentials') || message.includes('401')) {
        await clearAuthToken(params.id);
        router.replace('/');
        return;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.serverLabel}>{params.host}</Text>

        <SystemInfoPane
          data={systemInfo}
          isLoading={isLoading}
          error={error}
        />

        <PlaceholderPane title="CPU Usage" />
        <PlaceholderPane title="Memory Usage" />
        <PlaceholderPane title="Network" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  serverLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
});
