// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbol to Material Icon mappings.
 * @see Material Icons: https://icons.expo.fyi
 * @see SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING = {
  'house.fill': 'home',
  'internaldrive.fill': 'storage',
  'square.grid.2x2.fill': 'apps',
  'gearshape.fill': 'settings',
  'chevron.right': 'chevron-right',
  'plus': 'add',
  'arrow.left.square': 'logout',
} as IconMapping;

/**
 * Icon component using native SF Symbols on iOS, Material Icons on Android/web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
