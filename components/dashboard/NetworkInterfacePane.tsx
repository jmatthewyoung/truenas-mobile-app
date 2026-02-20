import { useEffect, useMemo, useRef } from 'react';
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

interface TrafficRate {
  inRate: number;
  outRate: number;
}

export function NetworkInterfacePane({
  interfaces,
  realtimeStats,
  isLoading,
}: NetworkInterfacePaneProps) {
  // Track previous byte counts to calculate rates
  const prevBytesRef = useRef<Record<string, { received: number; sent: number; timestamp: number }>>({});

  // Calculate traffic rates from WebSocket data
  const trafficRates = useMemo(() => {
    const rates: Record<string, TrafficRate> = {};

    if (!realtimeStats?.interfaces) {
      return rates;
    }

    const now = Date.now();

    for (const [name, data] of Object.entries(realtimeStats.interfaces)) {
      const prev = prevBytesRef.current[name];

      if (prev) {
        const timeDelta = (now - prev.timestamp) / 1000; // seconds
        if (timeDelta > 0) {
          const receivedDelta = data.received_bytes - prev.received;
          const sentDelta = data.sent_bytes - prev.sent;

          rates[name] = {
            inRate: Math.max(0, receivedDelta / timeDelta),
            outRate: Math.max(0, sentDelta / timeDelta),
          };
        }
      }

      // Update previous values
      prevBytesRef.current[name] = {
        received: data.received_bytes,
        sent: data.sent_bytes,
        timestamp: now,
      };
    }

    return rates;
  }, [realtimeStats?.interfaces]);

  // Reset tracking when component unmounts
  useEffect(() => {
    return () => {
      prevBytesRef.current = {};
    };
  }, []);

  if (isLoading && !interfaces) {
    return (
      <DashboardCard title="Network">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DashboardCard>
    );
  }

  if (!interfaces || interfaces.length === 0) {
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
        {interfaces.map((iface) => {
          const ipv4Alias = iface.aliases.find((a) => a.type === 'INET');
          const ipAddress = ipv4Alias?.address ?? 'No IP';
          const linkState = iface.state?.link_state ?? 'UNKNOWN';
          const isUp = linkState === 'LINK_STATE_UP';
          const rate = trafficRates[iface.name];

          return (
            <View key={iface.id} style={styles.interfaceCard}>
              <View style={styles.interfaceHeader}>
                <Text style={styles.interfaceName}>{iface.name}</Text>
                <View style={styles.linkStateContainer}>
                  <View
                    style={[
                      styles.linkStateDot,
                      { backgroundColor: isUp ? '#22C55E' : colors.danger },
                    ]}
                  />
                  <Text style={styles.linkStateText}>
                    {isUp ? 'UP' : 'DOWN'}
                  </Text>
                </View>
              </View>

              <Text style={styles.ipAddress}>{ipAddress}</Text>

              <View style={styles.trafficRow}>
                <View style={styles.trafficItem}>
                  <Text style={styles.trafficLabel}>In:</Text>
                  <Text style={styles.trafficValue}>
                    {rate ? formatBytesPerSecond(rate.inRate) : '-- B/s'}
                  </Text>
                </View>
                <View style={styles.trafficItem}>
                  <Text style={styles.trafficLabel}>Out:</Text>
                  <Text style={styles.trafficValue}>
                    {rate ? formatBytesPerSecond(rate.outRate) : '-- B/s'}
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
