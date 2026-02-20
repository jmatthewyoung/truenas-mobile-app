import { SystemInfo } from './types';

export async function getSystemInfo(baseUrl: string, token: string): Promise<SystemInfo> {
  const response = await fetch(`${baseUrl}/api/v2.0/system/info`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token expired or invalid');
    }
    throw new Error(`Failed to fetch system info: ${response.status}`);
  }

  const data = await response.json();

  return {
    version: data.version || 'Unknown',
    hostname: data.hostname || 'Unknown',
    platform: data.system_product || 'TrueNAS',
    uptime: data.uptime || 'Unknown',
    uptime_seconds: data.uptime_seconds || 0,
  };
}
