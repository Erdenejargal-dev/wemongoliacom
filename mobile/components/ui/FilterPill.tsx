import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { C } from '@/constants/Colors';

function usePressScale() {
  'use no memo';
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withTiming(0.93, { duration: 100 }); };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); };
  return { animStyle, onPressIn, onPressOut };
}

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
  const { animStyle, onPressIn, onPressOut } = usePressScale();

  const bg = dark
    ? active ? C.blue   : C.navy
    : active ? C.blue   : C.bgPage;

  const color = dark
    ? active ? '#FFFFFF' : C.textAccent
    : active ? '#FFFFFF' : C.textMuted;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.pill, { backgroundColor: bg }, !dark && !active && styles.lightBorder]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        <Text style={[styles.text, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
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
