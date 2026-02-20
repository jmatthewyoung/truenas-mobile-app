import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const colors = Colors.dark;

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
}

export function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  content: {},
});
