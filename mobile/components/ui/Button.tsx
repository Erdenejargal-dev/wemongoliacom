import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { C } from '@/constants/Colors';

type Variant = 'primary' | 'dark' | 'outline';

export function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    variant === 'primary' ? C.blue
    : variant === 'dark'  ? C.navy
    : '#FFFFFF';

  const textColor =
    variant === 'primary' ? '#FFFFFF'
    : variant === 'dark'  ? C.textAccent
    : C.navy;

  return (
    <Animated.View style={[animStyle, fullWidth && { width: '100%' }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 120 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.base,
          { backgroundColor: disabled ? C.borderDefault : bg },
          variant === 'outline' && styles.outline,
          fullWidth && styles.fullWidth,
        ]}
      >
        <Text style={[styles.label, { color: disabled ? C.textSubtle : textColor }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 100,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: C.navy,
  },
  fullWidth: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
