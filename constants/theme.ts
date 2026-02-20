import { Platform } from 'react-native';

// TrueNAS brand colors — electric cyan accent on dark navy backgrounds
const tint = '#0099FF';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#F5F8FA',
    tint,
    icon: '#687076',
    card: '#FFFFFF',
    border: '#DDE3E9',
    danger: '#D92B2B',
    tabIconDefault: '#687076',
    tabIconSelected: tint,
  },
  dark: {
    // Navy palette extracted from TrueNAS Scale dashboard screenshot
    text: '#E8EDF2',
    textSecondary: '#7A8EA8',
    background: '#0D1520',  // deep navy page background
    tint,
    icon: '#7A8EA8',
    card: '#16202E',        // slightly lighter navy for cards/panels
    border: '#253347',      // subtle navy border
    danger: '#E05252',
    tabIconDefault: '#7A8EA8',
    tabIconSelected: tint,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
