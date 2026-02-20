import AsyncStorage from '@react-native-async-storage/async-storage';

import { Server } from '@/types/server';

const STORAGE_KEY = '@truenas/servers';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function getServers(): Promise<Server[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw) as Server[];
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
