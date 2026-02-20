import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { protocol, host, username, password } = useLocalSearchParams<{
    protocol: string;
    host: string;
    username: string;
    password: string;
  }>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.placeholderLabel, { color: colors.textSecondary }]}>
        Placeholder
      </Text>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>URL</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{protocol}{host}</Text>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Username</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{username}</Text>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Password</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{password}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoCard: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    marginBottom: 14,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
