import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const colors = Colors.dark;

export default function SystemScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>System</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
