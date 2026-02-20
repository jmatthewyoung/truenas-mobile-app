import { StyleSheet, Text, View } from 'react-native';

import { DashboardCard } from './DashboardCard';
import { Colors } from '@/constants/theme';

const colors = Colors.dark;

interface PlaceholderPaneProps {
  title: string;
}

export function PlaceholderPane({ title }: PlaceholderPaneProps) {
  return (
    <DashboardCard title={title}>
      <View style={styles.container}>
        <Text style={styles.text}>Coming Soon</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
