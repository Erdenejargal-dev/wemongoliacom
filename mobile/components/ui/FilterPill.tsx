import { Pressable, StyleSheet, Text } from 'react-native';
import { C } from '@/constants/Colors';

export function FilterPill({
  label,
  active,
  onPress,
  dark = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  dark?: boolean;
}) {
  const bg = dark
    ? active ? C.blue   : C.navy
    : active ? C.blue   : C.bgPage;

  const color = dark
    ? active ? '#FFFFFF' : C.textAccent
    : active ? '#FFFFFF' : C.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, { backgroundColor: bg }, !dark && !active && styles.lightBorder]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 34,
    borderRadius: 100,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightBorder: {
    borderWidth: 0.5,
    borderColor: C.borderDefault,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
