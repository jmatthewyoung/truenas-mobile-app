import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CpuGaugePane } from '@/components/dashboard/CpuGaugePane';
import { CpuModelPane } from '@/components/dashboard/CpuModelPane';
import { CpuUsagePane } from '@/components/dashboard/CpuUsagePane';
import { MemoryUsagePane } from '@/components/dashboard/MemoryUsagePane';
import { NetworkInterfacePane } from '@/components/dashboard/NetworkInterfacePane';
import { StoragePoolsPane } from '@/components/dashboard/StoragePoolsPane';
import { SystemInfoPane } from '@/components/dashboard/SystemInfoPane';
import { Colors } from '@/constants/theme';
import { useRealtimeStats } from '@/hooks/use-realtime-stats';
import { getNetworkInterfaces } from '@/services/api/network';
import { getPools } from '@/services/api/pool';
import { getSystemInfo } from '@/services/api/system';
import { NetworkInterface, Pool, SystemInfo } from '@/services/api/types';

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
  const [pools, setPools] = useState<Pool[] | null>(null);
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[] | null>(null);
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

      // Fetch all REST data in parallel
      const [info, poolsData, interfacesData] = await Promise.all([
        getSystemInfo(baseUrl, params.username, params.password),
        getPools(baseUrl, params.username, params.password),
        getNetworkInterfaces(baseUrl, params.username, params.password),
      ]);

      setSystemInfo(info);
      setPools(poolsData);
      setNetworkInterfaces(interfacesData);
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

        {/* CPU Section */}
        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <CpuGaugePane
              data={realtimeStats?.cpu}
              isLoading={!realtimeStats}
              style={styles.rowCard}
            />
          </View>
          <View style={styles.halfWidth}>
            <CpuModelPane
              cpuModel={systemInfo?.cpuModel}
              isLoading={isLoading}
              style={styles.rowCard}
            />
          </View>
        </View>

        <CpuUsagePane
          data={realtimeStats?.cpu}
          isLoading={!realtimeStats}
        />

        <MemoryUsagePane
          data={realtimeStats}
          isLoading={!realtimeStats}
        />

        <StoragePoolsPane
          pools={pools}
          isLoading={isLoading}
        />

        <NetworkInterfacePane
          interfaces={networkInterfaces}
          realtimeStats={realtimeStats}
          isLoading={isLoading}
        />
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
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  halfWidth: {
    flex: 1,
  },
  rowCard: {
    flex: 1,
    marginBottom: 0,
  },
});
