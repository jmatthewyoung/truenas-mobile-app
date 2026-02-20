import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';

const colors = Colors.dark;

interface CpuModelPaneProps {
  cpuModel: string | null | undefined;
  isLoading: boolean;
}

export function CpuModelPane({ cpuModel, isLoading }: CpuModelPaneProps) {
  if (isLoading && !cpuModel) {
    return (
      <DashboardCard title="CPU Model">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="CPU Model">
      <View style={styles.container}>
        <Text style={styles.modelText}>{cpuModel ?? 'Unknown'}</Text>
      </View>
    </DashboardCard>
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
  modelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
