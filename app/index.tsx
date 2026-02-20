import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { Colors } from '@/constants/theme';
import { getSystemInfo } from '@/services/api/system';
import { addServer, deleteServer, getServers } from '@/storage/servers';
import { Server, detectSupportedVersion } from '@/types/server';

// Login screen always uses the dark TrueNAS navy palette
const colors = Colors.dark;

export default function LoginScreen() {
  const router = useRouter();

  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [protocol, setProtocol] = useState<'http://' | 'https://'>('https://');
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getServers().then((data) => {
      setServers(data);
      setIsLoading(false);
    });
  }, []);

  const handleSelectServer = (server: Server) => {
    router.push({
      pathname: '/(tabs)',
      params: {
        id: server.id,
        protocol: server.protocol,
        host: server.host,
        username: server.username,
        password: server.password,
        version: server.version,
      },
    });
  };

  const confirmDeleteServer = async (id: string) => {
    await deleteServer(id);
    setServers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteServer = (id: string) => {
    Alert.alert('Remove Server', 'Remove this server from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => { void confirmDeleteServer(id); },
      },
    ]);
  };

  const handleAddServer = async () => {
    if (!host.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);

    const baseUrl = `${protocol}${host.trim()}`;
    const trimmedUsername = username.trim();

    try {
      // Verify credentials and get version from server
      const systemInfo = await getSystemInfo(baseUrl, trimmedUsername, password);
      const detectedPattern = detectSupportedVersion(systemInfo.version);

      const saveServer = async () => {
        const newServer = await addServer({
          protocol,
          host: host.trim(),
          username: trimmedUsername,
          password,
          version: systemInfo.version,
          detectedPattern,
        });
        setServers((prev) => [...prev, newServer]);
        setHost('');
        setUsername('');
        setPassword('');
        setProtocol('https://');
      };

      if (!detectedPattern) {
        // Unsupported version - show warning but allow proceeding
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

  const renderServerList = () => {
    if (isLoading) {
      return <ActivityIndicator color={colors.tint} style={styles.loader} />;
    }
    if (servers.length === 0) {
      return (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No servers yet. Add one below.
          </Text>
        </View>
      );
    }
    return servers.map((server) => (
      <TouchableOpacity
        key={server.id}
        style={[styles.serverCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleSelectServer(server)}
        onLongPress={() => handleDeleteServer(server.id)}
        activeOpacity={0.7}
      >
        <View style={styles.serverCardContent}>
          <Text style={[styles.serverUrl, { color: colors.text }]}>
            {server.protocol}{server.host}
          </Text>
          <Text style={[styles.serverUsername, { color: colors.textSecondary }]}>
            {server.username}
          </Text>
        </View>
        <View style={[styles.serverArrow, { borderColor: colors.tint }]}>
          <Text style={[styles.serverArrowText, { color: colors.tint }]}>›</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Server list section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SERVERS
            </Text>
            {renderServerList()}
            {servers.length > 0 && (
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Hold to remove a server
              </Text>
            )}
          </View>

          {/* Add server form */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ADD SERVER
            </Text>

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  loader: {
    marginTop: 24,
  },
  emptyCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  serverCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverCardContent: {
    flex: 1,
  },
  serverUrl: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serverUsername: {
    fontSize: 13,
  },
  serverArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverArrowText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '300',
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
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
    marginTop: 12,
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
