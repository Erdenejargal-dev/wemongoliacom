// Type scale from Design.md Section 3

import { TextStyle } from 'react-native';

export const T: Record<string, TextStyle> = {
  display: { fontSize: 28, fontWeight: '700', lineHeight: 32, letterSpacing: -0.5 },
  h1:      { fontSize: 22, fontWeight: '700', lineHeight: 26, letterSpacing: -0.3 },
  h2:      { fontSize: 18, fontWeight: '700', lineHeight: 23, letterSpacing: -0.2 },
  h3:      { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  body:    { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  label:   { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  caption: { fontSize: 11, fontWeight: '400', lineHeight: 15 },
  overline:{ fontSize: 10, fontWeight: '500', lineHeight: 12, letterSpacing: 0.7 },
  micro:   { fontSize: 9,  fontWeight: '500', lineHeight: 11 },
};
