import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  deleteServer,
  getSelectedServerId,
  getServerById,
  getServers,
  setSelectedServerId,
} from '@/storage/servers';
import { Server } from '@/types/server';

const colors = Colors.dark;

const logo = require('../assets/images/truenas-logo.png');

export default function LoginScreen() {
  const router = useRouter();

  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadAndCheckSelection = async () => {
        setIsLoading(true);

        // Check for persisted selection first
        const selectedId = await getSelectedServerId();
        if (selectedId && !cancelled) {
          const server = await getServerById(selectedId);
          if (server && !cancelled) {
            router.replace({
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
            return;
          }
        }

        // No valid selection, load server list
        const data = await getServers();
        if (!cancelled) {
          setServers(data);
          setIsLoading(false);
        }
      };

      void loadAndCheckSelection();

      return () => {
        cancelled = true;
      };
    }, [router])
  );

  const handleSelectServer = async (server: Server) => {
    await setSelectedServerId(server.id);
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

  const handleAddServer = () => {
    router.push('/add-server-modal');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.tint} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no servers
  if (servers.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          {/* Logo */}
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Companion Mobile App
          </Text>

          <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddServer} activeOpacity={0.7}>
            <View style={[styles.largePlusCircle, { borderColor: colors.tint }]}>
              <IconSymbol name="plus" size={48} color={colors.tint} />
            </View>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Add a Server
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Server list view
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.centered}>
        {/* Logo */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Companion Mobile App
        </Text>

        {/* Server list section */}
        <View style={styles.listSection}>
          {/* List header with add button */}
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SERVERS
            </Text>
            <TouchableOpacity
              style={[styles.smallAddButton, { backgroundColor: colors.tint }]}
              onPress={handleAddServer}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Server cards */}
          {servers.map((server) => (
            <TouchableOpacity
              key={server.id}
              style={[styles.serverCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { void handleSelectServer(server); }}
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
          ))}
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Hold to remove a server
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    width: 280,
    height: 84,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
  },
  listSection: {
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  smallAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButton: {
    alignItems: 'center',
  },
  largePlusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
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
    marginTop: 8,
  },
});
