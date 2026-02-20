import AsyncStorage from '@react-native-async-storage/async-storage';

import { Server, detectSupportedVersion } from '@/types/server';

const STORAGE_KEY = '@truenas/servers';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function getServers(): Promise<Server[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const servers = JSON.parse(raw) as Server[];

    // Migrate old servers that don't have the new version fields
    return servers.map((server) => {
      if (server.detectedPattern === undefined) {
        // Old format - version was the pattern, now we need both fields
        return {
          ...server,
          detectedPattern: detectSupportedVersion(server.version),
        };
      }
      return server;
    });
  } catch {
    return [];
  }
}

export async function addServer(data: Omit<Server, 'id'>): Promise<Server> {
  const servers = await getServers();
  const newServer: Server = { ...data, id: generateId() };
  const updated = [...servers, newServer];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newServer;
}

export async function deleteServer(id: string): Promise<void> {
  const servers = await getServers();
  const updated = servers.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
