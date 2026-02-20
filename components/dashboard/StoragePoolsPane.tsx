import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { Pool } from '@/services/api/types';
import { formatBytes } from '@/utils/format-bytes';

const colors = Colors.dark;

interface StoragePoolsPaneProps {
  pools: Pool[] | null;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#22C55E',
  DEGRADED: '#F59E0B',
  OFFLINE: colors.textSecondary,
  FAULTED: colors.danger,
};

export function StoragePoolsPane({ pools, isLoading }: StoragePoolsPaneProps) {
  if (isLoading && !pools) {
    return (
      <DashboardCard title="Storage">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DashboardCard>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <DashboardCard title="Storage">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No pools found</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Storage">
      <View style={styles.container}>
        {pools.map((pool) => {
          const statusColor = STATUS_COLORS[pool.status] ?? colors.textSecondary;
          const usedSpace = pool.allocated ?? 0;
          const totalSpace = pool.size ?? 0;
          const diskCount = pool.topology?.data?.length ?? 0;
          const scanErrors = pool.scan?.errors ?? 0;
          const scrubState = pool.scan?.state ?? 'NONE';

          return (
            <View key={pool.id} style={styles.poolCard}>
              <View style={styles.poolHeader}>
                <Text style={styles.poolName}>{pool.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{pool.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.checkItem}>
                  <View style={[styles.checkDot, { backgroundColor: '#22C55E' }]} />
                  <Text style={styles.infoLabel}>Pool Status:</Text>
                  <Text style={styles.infoValue}>{pool.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.checkItem}>
                  <View
                    style={[
                      styles.checkDot,
                      { backgroundColor: usedSpace > 0 ? '#22C55E' : colors.textSecondary },
                    ]}
                  />
                  <Text style={styles.infoLabel}>Used Space:</Text>
                  <Text style={styles.infoValue}>
                    {formatBytes(usedSpace, 2)} of {formatBytes(totalSpace, 2)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.checkItem}>
                  <View
                    style={[
                      styles.checkDot,
                      { backgroundColor: scanErrors === 0 ? '#22C55E' : colors.danger },
                    ]}
                  />
                  <Text style={styles.infoLabel}>Disks with Errors:</Text>
                  <Text style={styles.infoValue}>
                    {scanErrors} of {diskCount}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.checkItem}>
                  <View
                    style={[
                      styles.checkDot,
                      {
                        backgroundColor:
                          scrubState === 'FINISHED'
                            ? '#22C55E'
                            : scrubState === 'SCANNING'
                            ? '#F59E0B'
                            : colors.textSecondary,
                      },
                    ]}
                  />
                  <Text style={styles.infoLabel}>Last Scrub</Text>
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
  poolCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  poolName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  infoValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
