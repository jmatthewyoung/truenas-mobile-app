export interface SystemInfo {
  version: string;
  hostname: string;
  platform: string;
  uptime: string;
  uptime_seconds: number;
  cpuModel: string;
}

// Real-time reporting types from websocket
export interface CpuCore {
  user: number;
  system: number;
  idle: number;
  nice: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
  guest: number;
  guest_nice: number;
  usage: number; // Calculated: 100 - idle
}

export interface CpuData {
  [coreId: string]: CpuCore | Record<string, number> | undefined;
}

export interface NetworkInterface {
  id: string;
  name: string;
  state: {
    link_state: string;
    active_media_type?: string;
    active_media_subtype?: string;
  };
  aliases: Array<{
    type: string;
    address: string;
    netmask?: number;
    broadcast?: string;
  }>;
}

export interface Pool {
  id: number;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'FAULTED';
  size: number | null;
  allocated: number | null;
  free: number | null;
  healthy: boolean;
  scan: {
    state: string;
    end_time: { $date: number } | null;
    errors: number;
  } | null;
  topology: {
    data: Array<{ disk: string }>;
  };
}

export interface RealtimeStats {
  cpu: CpuData;
  disks: {
    busy?: number;
    read_bytes?: number;
    write_bytes?: number;
    read_ops?: number;
    write_ops?: number;
  };
  interfaces: Record<string, {
    received_bytes: number;
    received_bytes_last: number;
    sent_bytes: number;
    sent_bytes_last: number;
  }>;
  memory: {
    classes: {
      apps?: number;
      arc?: number;
      buffers?: number;
      cache?: number;
      page_tables?: number;
      slab_cache?: number;
      unused?: number;
    };
    extra?: Record<string, unknown>;
  };
  virtual_memory: {
    total: number;
    available: number;
    percent: number;
    used: number;
    free: number;
    active: number;
    inactive: number;
    buffers: number;
    cached: number;
    shared: number;
    wired?: number;
  };
  zfs: {
    arc_max_size: number;
    arc_size: number;
    cache_hit_ratio: number;
  };
}
