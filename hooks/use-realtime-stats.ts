import { useEffect, useState, useRef } from 'react';

import { RealtimeStats } from '@/services/api/types';
import { getWebSocket, TrueNASWebSocket } from '@/services/api/websocket';

interface UseRealtimeStatsResult {
  stats: RealtimeStats | null;
  isConnected: boolean;
  error: string | null;
}

export function useRealtimeStats(
  baseUrl: string | undefined,
  username: string | undefined,
  password: string | undefined
): UseRealtimeStatsResult {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<TrueNASWebSocket | null>(null);

  useEffect(() => {
    if (!baseUrl || !username || !password) {
      return;
    }

    try {
      const ws = getWebSocket(baseUrl, username, password);
      wsRef.current = ws;

      const unsubscribe = ws.subscribeRealtime((data) => {
        setStats(data);
        setIsConnected(true);
        setError(null);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WebSocket connection failed');
      setIsConnected(false);
    }
  }, [baseUrl, username, password]);

  return { stats, isConnected, error };
}
