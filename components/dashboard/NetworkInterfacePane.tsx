import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { NetworkInterface, RealtimeStats } from '@/services/api/types';
import { formatBytesPerSecond } from '@/utils/format-bytes';

const colors = Colors.dark;

interface NetworkInterfacePaneProps {
  interfaces: NetworkInterface[] | null;
  realtimeStats: RealtimeStats | null | undefined;
  isLoading: boolean;
}

export function NetworkInterfacePane({
  interfaces,
  realtimeStats,
  isLoading,
}: NetworkInterfacePaneProps) {
  // Merge REST API interface data with WebSocket realtime data
  const mergedInterfaces = useMemo(() => {
    const wsInterfaces = realtimeStats?.interfaces ?? {};
    const restInterfaces = interfaces ?? [];

    // Create a map of REST interfaces by name for quick lookup
    const restByName = new Map(restInterfaces.map((i) => [i.name, i]));

    // Build merged list - prefer REST interfaces but add WebSocket-only ones
    const result: Array<{
      id: string;
      name: string;
      ipAddress: string;
      linkState: string;
      inRate: number;
      outRate: number;
    }> = [];

    // First, add all REST interfaces with their WebSocket data
    for (const iface of restInterfaces) {
      const wsData = wsInterfaces[iface.name];
      const ipv4Alias = iface.aliases.find((a) => a.type === 'INET');

      result.push({
        id: iface.id,
        name: iface.name,
        ipAddress: ipv4Alias?.address ?? 'No IP',
        // Prefer WebSocket link_state (real-time) over REST (static)
        linkState: wsData?.link_state ?? iface.state?.link_state ?? 'UNKNOWN',
        // WebSocket provides rates directly
        inRate: wsData?.received_bytes_rate ?? 0,
        outRate: wsData?.sent_bytes_rate ?? 0,
      });
    }

    // Add any WebSocket-only interfaces (not in REST data)
    for (const [name, wsData] of Object.entries(wsInterfaces)) {
      if (!restByName.has(name)) {
        // Skip loopback
        if (name === 'lo0' || name === 'lo') continue;

        result.push({
          id: name,
          name,
          ipAddress: 'N/A',
          linkState: wsData.link_state ?? 'UNKNOWN',
          inRate: wsData.received_bytes_rate ?? 0,
          outRate: wsData.sent_bytes_rate ?? 0,
        });
      }
    }

    return result;
  }, [interfaces, realtimeStats?.interfaces]);

  if (isLoading && !interfaces && !realtimeStats) {
    return (
      <DashboardCard title="Network">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DashboardCard>
    );
  }

  if (mergedInterfaces.length === 0) {
    return (
      <DashboardCard title="Network">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No interfaces found</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Network">
      <View style={styles.container}>
        {mergedInterfaces.map((iface) => {
          const isUp = iface.linkState === 'LINK_STATE_UP';

          return (
            <View key={iface.id} style={styles.interfaceCard}>
              <View style={styles.interfaceHeader}>
                <Text style={styles.interfaceName}>{iface.name}</Text>
                <View style={styles.linkStateContainer}>
                  <View
                    style={[
                      styles.linkStateDot,
                      { backgroundColor: isUp ? '#22C55E' : iface.linkState === 'UNKNOWN' ? colors.textSecondary : colors.danger },
                    ]}
                  />
                  <Text style={styles.linkStateText}>
                    {isUp ? 'UP' : iface.linkState === 'UNKNOWN' ? '—' : 'DOWN'}
                  </Text>
                </View>
              </View>

              <Text style={styles.ipAddress}>{iface.ipAddress}</Text>

              <View style={styles.trafficRow}>
                <View style={styles.trafficItem}>
                  <Text style={styles.trafficLabel}>In:</Text>
                  <Text style={styles.trafficValue}>
                    {formatBytesPerSecond(iface.inRate)}
                  </Text>
                </View>
                <View style={styles.trafficItem}>
                  <Text style={styles.trafficLabel}>Out:</Text>
                  <Text style={styles.trafficValue}>
                    {formatBytesPerSecond(iface.outRate)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  interfaceCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  interfaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interfaceName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  linkStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkStateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  linkStateText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  ipAddress: {
    color: colors.tint,
    fontSize: 18,
    fontWeight: '600',
  },
  trafficRow: {
    flexDirection: 'row',
    gap: 24,
  },
  trafficItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trafficLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  trafficValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
});
