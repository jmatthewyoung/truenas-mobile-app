import { NetworkInterface } from './types';

export async function getNetworkInterfaces(
  baseUrl: string,
  username: string,
  password: string
): Promise<NetworkInterface[]> {
  const credentials = btoa(`${username}:${password}`);

  const response = await fetch(`${baseUrl}/api/v2.0/interface`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error(`Failed to fetch network interfaces: ${response.status}`);
  }

  const data = await response.json();

  return data.map((iface: Record<string, unknown>) => ({
    id: iface.id as string,
    name: iface.name as string,
    state: iface.state as NetworkInterface['state'],
    aliases: (iface.aliases as NetworkInterface['aliases']) ?? [],
  }));
}
