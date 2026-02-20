import { RealtimeStats } from './types';

type RealtimeCallback = (data: RealtimeStats) => void;

interface WebSocketMessage {
  msg: string;
  id?: string;
  method?: string;
  params?: unknown[];
  result?: unknown;
  name?: string;
  collection?: string;
  fields?: RealtimeStats;
  subs?: string[];
}

export class TrueNASWebSocket {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private username: string;
  private password: string;
  private realtimeCallbacks: Set<RealtimeCallback> = new Set();
  private subscriptionId: string | null = null;
  private isAuthenticated = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageId = 0;

  constructor(baseUrl: string, username: string, password: string) {
    // Convert http(s) to ws(s)
    this.baseUrl = baseUrl.replace(/^http/, 'ws');
    this.username = username;
    this.password = password;
  }

  private generateId(): string {
    return `${++this.messageId}-${Date.now()}`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${this.baseUrl}/websocket`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.sendConnect();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = () => {
      // Errors are typically followed by close events
    };

    this.ws.onclose = () => {
      this.isAuthenticated = false;
      this.subscriptionId = null;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      if (this.realtimeCallbacks.size > 0) {
        this.connect();
      }
    }, 3000);
  }

  private sendConnect(): void {
    this.send({
      msg: 'connect',
      version: '1',
      support: ['1'],
    });
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(data: string): void {
    const message: WebSocketMessage = JSON.parse(data);

    switch (message.msg) {
      case 'connected':
        this.authenticate();
        break;

      case 'result':
        if (message.result === true && !this.isAuthenticated) {
          this.isAuthenticated = true;
          // If we have callbacks waiting, subscribe
          if (this.realtimeCallbacks.size > 0) {
            this.subscribeToRealtime();
          }
        }
        break;

      case 'ready':
        // Subscription confirmed
        if (message.subs && message.subs.length > 0) {
          this.subscriptionId = message.subs[0];
        }
        break;

      case 'added':
        if (message.collection === 'reporting.realtime' && message.fields) {
          this.notifyCallbacks(message.fields);
        }
        break;
    }
  }

  private authenticate(): void {
    this.send({
      id: this.generateId(),
      msg: 'method',
      method: 'auth.login',
      params: [this.username, this.password],
    });
  }

  private subscribeToRealtime(): void {
    const id = this.generateId();
    this.send({
      id,
      name: 'reporting.realtime',
      msg: 'sub',
    });
  }

  private notifyCallbacks(data: RealtimeStats): void {
    this.realtimeCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch {
        // Ignore callback errors
      }
    });
  }

  subscribeRealtime(callback: RealtimeCallback): () => void {
    this.realtimeCallbacks.add(callback);

    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    } else if (this.isAuthenticated && !this.subscriptionId) {
      // Already connected and authenticated, just subscribe
      this.subscribeToRealtime();
    }

    // Return unsubscribe function
    return () => {
      this.realtimeCallbacks.delete(callback);
      if (this.realtimeCallbacks.size === 0) {
        this.unsubscribeRealtime();
      }
    };
  }

  private unsubscribeRealtime(): void {
    if (this.subscriptionId && this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        id: this.subscriptionId,
        msg: 'unsub',
      });
      this.subscriptionId = null;
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.realtimeCallbacks.clear();
    this.subscriptionId = null;
    this.isAuthenticated = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton manager for websocket connections
const connections = new Map<string, TrueNASWebSocket>();

export function getWebSocket(
  baseUrl: string,
  username: string,
  password: string
): TrueNASWebSocket {
  const key = `${baseUrl}:${username}`;

  let connection = connections.get(key);
  if (!connection) {
    connection = new TrueNASWebSocket(baseUrl, username, password);
    connections.set(key, connection);
  }

  return connection;
}
