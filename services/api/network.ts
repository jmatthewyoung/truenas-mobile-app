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

  return data.map((iface: Record<string, unknown>) => {
    const state = iface.state as Record<string, unknown> | undefined;
    return {
      id: iface.id as string,
      name: iface.name as string,
      state: {
        link_state: state?.link_state as string ?? 'UNKNOWN',
        active_media_type: state?.active_media_type as string | undefined,
        active_media_subtype: state?.active_media_subtype as string | undefined,
      },
      // Aliases are nested under state.aliases in the API response
      aliases: (state?.aliases as NetworkInterface['aliases']) ?? [],
    };
  });
}
