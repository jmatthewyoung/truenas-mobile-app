export type TrueNASVersion = '24.10.2.3';

export const SUPPORTED_VERSIONS: TrueNASVersion[] = ['24.10.2.3'];

export interface Server {
  id: string;
  protocol: 'http://' | 'https://';
  host: string;
  username: string;
  password: string;
  version: TrueNASVersion;
}
