import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { C } from '@/constants/Colors';

type Variant = 'confirmed' | 'daysLeft' | 'economy' | 'deal' | 'inProgress';

const STYLES: Record<Variant, { bg: string; color: string }> = {
  confirmed:  { bg: C.success,    color: '#FFFFFF'  },
  daysLeft:   { bg: C.blue,       color: '#FFFFFF'  },
  economy:    { bg: C.navy,       color: C.textAccent },
  deal:       { bg: '#FFF3DC',    color: '#B87B0A'  },
  inProgress: { bg: C.blueLight,  color: C.blueDark },
};

export function Badge({
  label,
  variant,
  style,
}: {
  label: string;
  variant: Variant;
  style?: ViewStyle;
}) {
  const { bg, color } = STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
});
