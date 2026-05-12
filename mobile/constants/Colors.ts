// Design token source: Design.md (TRU by Brickclay) — do not override these values

export const C = {
  // Primary palette
  blue:          '#0085C9',
  blueDark:      '#005A90',
  navy:          '#003D5C',
  navyDeep:      '#002030',
  blueLight:     '#D0ECFA',
  bgPage:        '#EFF7FD',
  surfaceWhite:  '#FFFFFF',
  borderDefault: '#C5DCF0',
  borderEmphasis:'#A8D0EE',

  // Text
  textPrimary:   '#1A1A1A',
  textMuted:     '#5C6D78',
  textSubtle:    '#A0B4C0',
  textInverse:   '#FFFFFF',
  textAccent:    '#7EC8F0',

  // Status
  success:       '#1FAA70',
  warning:       '#F59B23',
  error:         '#E84040',
} as const;

// Backwards compat for hooks/use-theme-color.ts and existing components
export const Colors = {
  light: {
    text:             C.textPrimary,
    background:       C.bgPage,
    tint:             C.blue,
    icon:             C.textSubtle,
    tabIconDefault:   C.textSubtle,
    tabIconSelected:  C.blue,
  },
  dark: {
    text:             C.textInverse,
    background:       C.navyDeep,
    tint:             C.blue,
    icon:             C.textMuted,
    tabIconDefault:   C.textMuted,
    tabIconSelected:  C.blue,
  },
};
