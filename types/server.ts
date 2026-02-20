export interface Server {
  id: string;
  protocol: 'http://' | 'https://';
  host: string;
  username: string;
  password: string;
}
