import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY_PREFIX = '@truenas/auth/';

export async function getAuthToken(serverId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${AUTH_KEY_PREFIX}${serverId}`);
  } catch {
    return null;
  }
}

export async function setAuthToken(serverId: string, token: string): Promise<void> {
  await AsyncStorage.setItem(`${AUTH_KEY_PREFIX}${serverId}`, token);
}

export async function clearAuthToken(serverId: string): Promise<void> {
  await AsyncStorage.removeItem(`${AUTH_KEY_PREFIX}${serverId}`);
}
