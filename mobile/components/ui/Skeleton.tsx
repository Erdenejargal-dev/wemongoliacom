import { useEffect } from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_W = Dimensions.get('window').width;

function useShimmerX(): SharedValue<number> {
  'use no memo';
  const x = useSharedValue(-SCREEN_W);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    x.value = withRepeat(
      withTiming(SCREEN_W, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(x);
  }, []);
  return x;
}

export function Skeleton({ style }: { style?: ViewStyle }) {
  const x = useShimmerX();
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View style={[styles.base, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.shimmer, animStyle]} />
    </View>
  );
}

// ── Preset shapes ──────────────────────────────────────────────────────────

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return <Skeleton style={[styles.card, style]} />;
}

export function SkeletonText({ width, style }: { width?: number | string; style?: ViewStyle }) {
  return <Skeleton style={[styles.text, width ? { width } : {}, style]} />;
}

// Full detail-screen skeleton: hero + content lines
export function SkeletonDetail() {
  return (
    <View style={styles.detail}>
      <Skeleton style={styles.detailHero} />
      <View style={styles.detailBody}>
        <Skeleton style={[styles.text, { width: '60%', height: 20, borderRadius: 8 }]} />
        <Skeleton style={[styles.text, { width: '40%', marginTop: 10 }]} />
        <View style={styles.detailRow}>
          <Skeleton style={[styles.badge]} />
          <Skeleton style={[styles.badge]} />
          <Skeleton style={[styles.badge]} />
        </View>
        <Skeleton style={[styles.text, { width: '100%', marginTop: 20, height: 12 }]} />
        <Skeleton style={[styles.text, { width: '90%', marginTop: 8, height: 12 }]} />
        <Skeleton style={[styles.text, { width: '80%', marginTop: 8, height: 12 }]} />
        <Skeleton style={[styles.text, { width: '70%', marginTop: 8, height: 12 }]} />
      </View>
    </View>
  );
}

// Row skeleton for search/list results
export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton style={styles.rowThumb} />
      <View style={styles.rowLines}>
        <Skeleton style={[styles.text, { width: '65%', height: 13 }]} />
        <Skeleton style={[styles.text, { width: '45%', marginTop: 6, height: 11 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#D0ECFA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    width: SCREEN_W,
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
  // Detail
  detail: { flex: 1, backgroundColor: '#EFF7FD' },
  detailHero: { width: '100%', height: 320, borderRadius: 0 },
  detailBody: { padding: 20, gap: 0 },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  badge: { width: 72, height: 28, borderRadius: 100 },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rowThumb: { width: 48, height: 48, borderRadius: 10 },
  rowLines: { flex: 1 },
});
