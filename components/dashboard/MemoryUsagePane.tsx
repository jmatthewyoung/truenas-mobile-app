import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { RealtimeStats } from '@/services/api/types';
import { formatBytes } from '@/utils/format-bytes';

const colors = Colors.dark;

// Chart colors matching TrueNAS dashboard
const CHART_COLORS = {
  free: '#0099FF',      // cyan
  zfsCache: '#C850C0',  // magenta
  services: '#F5A623',  // orange/amber
};

interface MemoryUsagePaneProps {
  data: RealtimeStats | null | undefined;
  isLoading: boolean;
}

interface MemorySegment {
  label: string;
  value: number;
  color: string;
}

export function MemoryUsagePane({ data, isLoading }: MemoryUsagePaneProps) {
  const memoryData = useMemo(() => {
    if (!data?.virtual_memory || !data?.memory) {
      return null;
    }

    const total = data.virtual_memory.total;
    const classes = data.memory.classes;

    // Calculate memory segments
    const free = classes.unused ?? 0;
    const arc = classes.arc ?? 0;
    const apps = classes.apps ?? 0;

    return {
      total,
      segments: [
        { label: 'Free', value: free, color: CHART_COLORS.free },
        { label: 'ZFS Cache', value: arc, color: CHART_COLORS.zfsCache },
        { label: 'Services', value: apps, color: CHART_COLORS.services },
      ] as MemorySegment[],
    };
  }, [data]);

  if (isLoading && !data) {
    return (
      <DashboardCard title="Memory">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </DashboardCard>
    );
  }

  if (!memoryData) {
    return (
      <DashboardCard title="Memory">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Waiting for data...</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Memory">
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <DonutChart
            segments={memoryData.segments}
            total={memoryData.total}
            size={140}
            strokeWidth={20}
          />
          <View style={styles.centerText}>
            <Text style={styles.totalValue}>{formatBytes(memoryData.total, 1)}</Text>
            <Text style={styles.totalLabel}>total available</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {memoryData.segments.map((segment) => (
            <View key={segment.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendLabel}>{segment.label}:</Text>
              <Text style={styles.legendValue}>{formatBytes(segment.value, 1)}</Text>
            </View>
          ))}
        </View>
      </View>
    </DashboardCard>
  );
}

interface DonutChartProps {
  segments: MemorySegment[];
  total: number;
  size: number;
  strokeWidth: number;
}

function DonutChart({ segments, total, size, strokeWidth }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate the total of all segments
  const segmentTotal = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Build segments with their start positions
  let currentOffset = 0;
  const segmentData = segments.map((segment) => {
    const percentage = segmentTotal > 0 ? segment.value / segmentTotal : 0;
    const length = circumference * percentage;
    const offset = currentOffset;
    currentOffset += length;
    return {
      ...segment,
      length,
      offset,
      percentage,
    };
  });

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
        {/* Segment circles */}
        {segmentData.map((segment, index) => (
          <Circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${segment.length} ${circumference - segment.length}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
          />
        ))}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  totalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
