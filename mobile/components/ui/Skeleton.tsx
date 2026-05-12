import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function Skeleton({ style }: { style?: ViewStyle }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 600 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.base, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.shimmer, animStyle]} />
    </View>
  );
}

// Preset shapes
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return <Skeleton style={[styles.card, style]} />;
}

export function SkeletonText({ width, style }: { width?: number | string; style?: ViewStyle }) {
  return <Skeleton style={[styles.text, width ? { width } : {}, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#D0ECFA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmer: {
    backgroundColor: '#EFF7FD',
  },
  card: {
    height: 160,
    borderRadius: 16,
  },
  text: {
    height: 12,
    borderRadius: 6,
    width: '70%',
  },
});
