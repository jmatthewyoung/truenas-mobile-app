import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { Pool, PoolVdev } from '@/services/api/types';
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

// Recursively count disks in vdev tree
function countDisks(vdevs: PoolVdev[]): number {
  let count = 0;
  for (const vdev of vdevs) {
    if (vdev.children && vdev.children.length > 0) {
      // This is a vdev group (mirror, raidz, etc.) - count children
      count += countDisks(vdev.children);
    } else if (vdev.type === 'DISK' || vdev.disk) {
      // This is an actual disk
      count += 1;
    }
  }
  return count;
}

// Recursively count disks with errors in vdev tree
function countDisksWithErrors(vdevs: PoolVdev[]): number {
  let count = 0;
  for (const vdev of vdevs) {
    if (vdev.children && vdev.children.length > 0) {
      count += countDisksWithErrors(vdev.children);
    } else if (vdev.type === 'DISK' || vdev.disk) {
      const stats = vdev.stats;
      if (stats && (stats.read_errors > 0 || stats.write_errors > 0 || stats.checksum_errors > 0)) {
        count += 1;
      }
    }
  }
  return count;
}

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

          // Count all disks across all vdev types
          const dataDisks = countDisks(pool.topology?.data ?? []);
          const cacheDisks = countDisks(pool.topology?.cache ?? []);
          const logDisks = countDisks(pool.topology?.log ?? []);
          const spareDisks = countDisks(pool.topology?.spare ?? []);
          const totalDisks = dataDisks + cacheDisks + logDisks + spareDisks;

          // Count disks with errors
          const disksWithErrors =
            countDisksWithErrors(pool.topology?.data ?? []) +
            countDisksWithErrors(pool.topology?.cache ?? []) +
            countDisksWithErrors(pool.topology?.log ?? []) +
            countDisksWithErrors(pool.topology?.spare ?? []);

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
                  <View style={[styles.checkDot, { backgroundColor: statusColor }]} />
                  <Text style={styles.infoLabel}>Pool Status:</Text>
                  <Text style={styles.infoValue}>{pool.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.checkItem}>
                  <View
                    style={[
                      styles.checkDot,
                      { backgroundColor: '#22C55E' },
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
                      { backgroundColor: disksWithErrors === 0 ? '#22C55E' : colors.danger },
                    ]}
                  />
                  <Text style={styles.infoLabel}>Disks with Errors:</Text>
                  <Text style={styles.infoValue}>
                    {disksWithErrors} of {totalDisks}
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
