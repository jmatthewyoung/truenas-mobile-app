import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { CpuData, CpuCore } from '@/services/api/types';

const colors = Colors.dark;

interface CpuUsagePaneProps {
  data: CpuData | null | undefined;
  isLoading: boolean;
}

interface CoreUsage {
  id: string;
  usage: number;
}

function isCpuCore(value: unknown): value is CpuCore {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('idle' in value || 'usage' in value)
  );
}

function calculateUsage(core: CpuCore): number {
  // If usage is provided directly, use it
  if (typeof core.usage === 'number') {
    return core.usage;
  }
  // Otherwise calculate from idle time
  if (typeof core.idle === 'number') {
    return 100 - core.idle;
  }
  return 0;
}

export function CpuUsagePane({ data, isLoading }: CpuUsagePaneProps) {
  const cores = useMemo(() => {
    if (!data) return [];

    const coreList: CoreUsage[] = [];
    for (const [key, value] of Object.entries(data)) {
      // Skip temperature entries
      if (key === 'temperature' || key === 'temperature_celsius') continue;

      // Check if this is a core entry (numeric key or starts with 'cpu')
      if (isCpuCore(value)) {
        coreList.push({
          id: key,
          usage: calculateUsage(value),
        });
      }
    }

    // Sort by core ID numerically
    return coreList.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [data]);

  const avgUsage = useMemo(() => {
    if (cores.length === 0) return 0;
    const total = cores.reduce((sum, core) => sum + core.usage, 0);
    return total / cores.length;
  }, [cores]);

  if (isLoading && !data) {
    return (
      <DashboardCard title="CPU Usage">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="CPU Usage">
      <View style={styles.container}>
        {/* Average usage header */}
        <View style={styles.avgSection}>
          <Text style={styles.avgLabel}>Average</Text>
          <Text style={styles.avgValue}>{avgUsage.toFixed(1)}%</Text>
        </View>

        {/* Core grid */}
        <View style={styles.coreGrid}>
          {cores.map((core) => (
            <View key={core.id} style={styles.coreItem}>
              <View style={styles.coreHeader}>
                <Text style={styles.coreLabel}>{core.id}</Text>
                <Text style={styles.coreValue}>{core.usage.toFixed(0)}%</Text>
              </View>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(core.usage, 100)}%`,
                      backgroundColor: getUsageColor(core.usage),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {cores.length === 0 && (
          <Text style={styles.noDataText}>Waiting for data...</Text>
        )}
      </View>
    </DashboardCard>
  );
}

function getUsageColor(usage: number): string {
  if (usage >= 90) return colors.danger;
  if (usage >= 70) return '#F59E0B'; // amber
  return colors.tint;
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
  avgSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avgLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  avgValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  coreGrid: {
    gap: 8,
  },
  coreItem: {
    gap: 4,
  },
  coreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coreLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  coreValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
  barBackground: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  noDataText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
