// Supported version patterns - the version string from the server must contain one of these
export const SUPPORTED_VERSION_PATTERNS = ['24.10'] as const;

export type SupportedVersionPattern = typeof SUPPORTED_VERSION_PATTERNS[number];

export interface Server {
  id: string;
  protocol: 'http://' | 'https://';
  host: string;
  username: string;
  password: string;
  version: string; // The actual version string from the server
  detectedPattern: SupportedVersionPattern | null; // The matched supported pattern, or null if unsupported
}

/**
 * Checks if a version string matches any supported version pattern.
 * Returns the matched pattern or null if unsupported.
 */
export function detectSupportedVersion(versionString: string): SupportedVersionPattern | null {
  for (const pattern of SUPPORTED_VERSION_PATTERNS) {
    if (versionString.includes(pattern)) {
      return pattern;
    }
  }
  return null;
}
