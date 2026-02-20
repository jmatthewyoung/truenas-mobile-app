import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getSystemInfo } from '@/services/api/system';
import { addServer } from '@/storage/servers';
import { detectSupportedVersion } from '@/types/server';

const colors = Colors.dark;

export default function AddServerModal() {
  const router = useRouter();

  const [protocol, setProtocol] = useState<'http://' | 'https://'>('https://');
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddServer = async () => {
    if (!host.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);

    const baseUrl = `${protocol}${host.trim()}`;
    const trimmedUsername = username.trim();

    try {
      const systemInfo = await getSystemInfo(baseUrl, trimmedUsername, password);
      const detectedPattern = detectSupportedVersion(systemInfo.version);

      const saveServer = async () => {
        await addServer({
          protocol,
          host: host.trim(),
          username: trimmedUsername,
          password,
          version: systemInfo.version,
          detectedPattern,
        });
        router.back();
      };

      if (!detectedPattern) {
        Alert.alert(
          'Unsupported Version',
          `This server is running TrueNAS ${systemInfo.version}, which is not officially supported. You may experience issues or missing features.\n\nDo you want to add it anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Anyway',
              onPress: () => { void saveServer(); },
            },
          ]
        );
      } else {
        await saveServer();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      Alert.alert('Connection Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
            <Text style={[styles.backText, { color: colors.tint }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Protocol + Host row */}
          <View style={styles.protocolRow}>
            <TouchableOpacity
              style={[
                styles.protocolBtn,
                { borderColor: colors.border },
                protocol === 'http://' && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => setProtocol('http://')}
            >
              <Text
                style={[
                  styles.protocolBtnText,
                  { color: colors.textSecondary },
                  protocol === 'http://' && styles.protocolBtnTextActive,
                ]}
              >
                http://
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.protocolBtn,
                { borderColor: colors.border },
                protocol === 'https://' && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => setProtocol('https://')}
            >
              <Text
                style={[
                  styles.protocolBtnText,
                  { color: colors.textSecondary },
                  protocol === 'https://' && styles.protocolBtnTextActive,
                ]}
              >
                https://
              </Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.hostInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="192.168.1.100"
              placeholderTextColor={colors.textSecondary}
              value={host}
              onChangeText={setHost}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Username"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.tint },
            isSubmitting && styles.addButtonDisabled,
          ]}
          onPress={handleAddServer}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>
            {isSubmitting ? 'Adding...' : 'Add Server'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 17,
    marginLeft: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  protocolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  protocolBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  protocolBtnTextActive: {
    color: '#FFFFFF',
  },
  hostInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  input: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
