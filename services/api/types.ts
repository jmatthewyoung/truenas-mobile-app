export interface SystemInfo {
  version: string;
  hostname: string;
  platform: string;
  uptime: string;
  uptime_seconds: number;
}

export interface AuthTokenResponse {
  token: string;
}
