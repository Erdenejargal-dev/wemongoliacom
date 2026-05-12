// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Nav
  'house.fill':                             'home',
  'sparkles':                               'auto-awesome',
  'map.fill':                               'map',
  'bookmark.fill':                          'bookmark',
  'square.grid.2x2.fill':                   'apps',
  // Common UI
  'magnifyingglass':                        'search',
  'bell':                                   'notifications-none',
  'bell.fill':                              'notifications',
  'person.fill':                            'person',
  'heart.fill':                             'favorite',
  'arrow.up.right':                         'open-in-new',
  'star.fill':                              'star',
  'location.fill':                          'place',
  'xmark':                                  'close',
  'checkmark':                              'check',
  'chevron.left':                           'chevron-left',
  'chevron.right':                          'chevron-right',
  'chevron.down':                           'expand-more',
  'slider.horizontal.3':                    'tune',
  'calendar':                               'calendar-today',
  'creditcard.fill':                        'credit-card',
  'airplane':                               'flight',
  'building.2.fill':                        'apartment',
  'car.fill':                               'directions-car',
  'paperplane.fill':                        'send',
  'chevron.left.forwardslash.chevron.right':'code',
  'globe':                                  'language',
  'phone.fill':                             'phone',
  'envelope.fill':                          'email',
  'trash.fill':                             'delete',
  'pencil':                                 'edit',
  'square.and.arrow.up':                    'share',
  'info.circle':                            'info',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
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
