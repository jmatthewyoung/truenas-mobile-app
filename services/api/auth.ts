import { Server } from '@/types/server';

interface GenerateTokenResponse {
  token: string;
}

export async function generateToken(server: Server): Promise<string> {
  const baseUrl = `${server.protocol}${server.host}`;
  const credentials = btoa(`${server.username}:${server.password}`);

  const response = await fetch(`${baseUrl}/api/v2.0/auth/generate_token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ttl: 600 }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.text();
  // The API returns the token as a plain string, not JSON
  return data.replace(/^"|"$/g, '');
}
