import { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { CpuData, CpuCore } from '@/services/api/types';

const colors = Colors.dark;

interface CpuGaugePaneProps {
  data: CpuData | null | undefined;
  isLoading: boolean;
  style?: StyleProp<ViewStyle>;
}

function isCpuCore(value: unknown): value is CpuCore {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('idle' in value || 'usage' in value)
  );
}

function calculateUsage(core: CpuCore): number {
  if (typeof core.usage === 'number') {
    return core.usage;
  }
  if (typeof core.idle === 'number') {
    return 100 - core.idle;
  }
  return 0;
}

export function CpuGaugePane({ data, isLoading, style }: CpuGaugePaneProps) {
  const avgUsage = useMemo(() => {
    if (!data) return 0;

    // Use API-provided average if available
    if (data.average && isCpuCore(data.average)) {
      return calculateUsage(data.average);
    }

    // Fallback to calculating from cores
    const cores: number[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'temperature' || key === 'temperature_celsius' || key === 'average') continue;
      if (isCpuCore(value)) {
        cores.push(calculateUsage(value));
      }
    }

    if (cores.length === 0) return 0;
    return cores.reduce((sum, usage) => sum + usage, 0) / cores.length;
  }, [data]);

  if (isLoading && !data) {
    return (
      <DashboardCard title="CPU Usage" style={style}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="CPU Usage" style={style}>
      <View style={styles.container}>
        <View style={styles.gaugeContainer}>
          <CircularGauge percentage={avgUsage} size={120} strokeWidth={12} />
          <View style={styles.centerText}>
            <Text style={styles.percentageValue}>{Math.round(avgUsage)}%</Text>
            <Text style={styles.avgLabel}>Avg Usage</Text>
          </View>
        </View>
      </View>
    </DashboardCard>
  );
}

interface CircularGaugeProps {
  percentage: number;
  size: number;
  strokeWidth: number;
}

function CircularGauge({ percentage, size, strokeWidth }: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color based on usage level
  const getColor = (pct: number) => {
    if (pct >= 90) return colors.danger;
    if (pct >= 70) return '#F59E0B'; // amber
    return colors.tint;
  };

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${center}, ${center}`}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColor(progress)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  avgLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
