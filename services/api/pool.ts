import { Pool } from './types';

export async function getPools(
  baseUrl: string,
  username: string,
  password: string
): Promise<Pool[]> {
  const credentials = btoa(`${username}:${password}`);

  const response = await fetch(`${baseUrl}/api/v2.0/pool`, {
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
    throw new Error(`Failed to fetch pools: ${response.status}`);
  }

  const data = await response.json();

  return data.map((pool: Record<string, unknown>) => ({
    id: pool.id as number,
    name: pool.name as string,
    status: pool.status as Pool['status'],
    size: pool.size as number | null,
    allocated: pool.allocated as number | null,
    free: pool.free as number | null,
    healthy: pool.healthy as boolean,
    scan: pool.scan as Pool['scan'],
    topology: pool.topology as Pool['topology'],
  }));
}
