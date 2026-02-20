import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';

const colors = Colors.dark;

interface CpuModelPaneProps {
  cpuModel: string | null | undefined;
  isLoading: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CpuModelPane({ cpuModel, isLoading, style }: CpuModelPaneProps) {
  if (isLoading && !cpuModel) {
    return (
      <DashboardCard title="CPU Model" style={style}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="CPU Model" style={style}>
      <View style={styles.container}>
        <Text style={styles.modelText}>{cpuModel ?? 'Unknown'}</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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
