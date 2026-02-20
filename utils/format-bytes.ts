/**
 * Format bytes to human-readable string (KB, MB, GB, TB, etc.)
 * Uses binary units (1024 base) with GiB/TiB suffixes for storage consistency with TrueNAS
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${(bytes / Math.pow(k, index)).toFixed(dm)} ${sizes[index]}`;
}

/**
 * Format bytes per second to human-readable rate string
 */
export function formatBytesPerSecond(bytesPerSecond: number, decimals = 2): string {
  if (bytesPerSecond === 0) return '0 B/s';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];

  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${(bytesPerSecond / Math.pow(k, index)).toFixed(dm)} ${sizes[index]}`;
}

/**
 * Format bits per second to human-readable rate string (for network speeds)
 */
export function formatBitsPerSecond(bitsPerSecond: number, decimals = 2): string {
  if (bitsPerSecond === 0) return '0 b/s';

  const k = 1000; // Network speeds use decimal (1000) not binary (1024)
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['b/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s'];

  const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${(bitsPerSecond / Math.pow(k, index)).toFixed(dm)} ${sizes[index]}`;
}
