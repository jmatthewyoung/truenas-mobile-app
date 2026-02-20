import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CpuUsagePane } from '@/components/dashboard/CpuUsagePane';
import { PlaceholderPane } from '@/components/dashboard/PlaceholderPane';
import { SystemInfoPane } from '@/components/dashboard/SystemInfoPane';
import { Colors } from '@/constants/theme';
import { useRealtimeStats } from '@/hooks/use-realtime-stats';
import { getSystemInfo } from '@/services/api/system';
import { SystemInfo } from '@/services/api/types';

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

  const baseUrl = params.protocol && params.host
    ? `${params.protocol}${params.host}`
    : undefined;

  const { stats: realtimeStats } = useRealtimeStats(
    baseUrl,
    params.username,
    params.password
  );

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    if (!baseUrl || !params.username || !params.password) {
      router.replace('/');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const info = await getSystemInfo(baseUrl, params.username, params.password);
      setSystemInfo(info);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';

      if (message.includes('Invalid credentials')) {
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

        <CpuUsagePane
          data={realtimeStats?.cpu}
          isLoading={!realtimeStats}
        />
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
