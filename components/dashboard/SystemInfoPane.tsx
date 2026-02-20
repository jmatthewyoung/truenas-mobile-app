import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';
import { SystemInfo } from '@/services/api/types';

const colors = Colors.dark;

interface SystemInfoPaneProps {
  data: SystemInfo | null;
  isLoading: boolean;
  error: string | null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.tint} />
      <Text style={styles.loadingText}>Loading system info...</Text>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}

export function SystemInfoPane({ data, isLoading, error }: SystemInfoPaneProps) {
  if (isLoading) {
    return (
      <DashboardCard title="System Information">
        <LoadingSkeleton />
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="System Information">
        <ErrorState message={error} />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard title="System Information">
        <Text style={styles.noData}>No data available</Text>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="System Information">
      <InfoRow label="Platform" value={data.platform} />
      <InfoRow label="Version" value={data.version} />
      <InfoRow label="Hostname" value={data.hostname} />
      <InfoRow label="Uptime" value={formatUptime(data.uptime_seconds)} />
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    paddingVertical: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  noData: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
