// Design.md §7.2 — Destination Cards
import { Image } from 'expo-image';
import splashIcon from '@/assets/images/splash-icon.png';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';

export type DestinationCardData = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  location?: string;
  rating?: number;
};

export function DestinationCard({
  item,
  onPress,
  style,
}: {
  item: DestinationCardData;
  onPress: () => void;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.card, style, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        // eslint-disable-next-line react-hooks/immutability
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 120 }); }}
        // eslint-disable-next-line react-hooks/immutability
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${item.location ? ', ' + item.location : ''}`}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image
            source={item.image ? { uri: item.image } : splashIcon}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {/* Arrow — top-right */}
          <View style={styles.arrowBtn} pointerEvents="none">
            <IconSymbol name="arrow.up.right" size={12} color="#FFFFFF" />
          </View>
          {/* Rating — bottom-left overlay */}
          {item.rating != null && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          {item.location && (
            <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function DestinationCardSkeleton({ style }: { style?: object }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton style={styles.imageWrap} />
      <View style={styles.info}>
        <Skeleton style={{ height: 13, width: '75%', borderRadius: 6 }} />
        <Skeleton style={{ height: 11, width: '50%', borderRadius: 5, marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
  },
  imageWrap: {
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrowBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  info: {
    padding: 10,
    paddingHorizontal: 12,
    gap: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  location: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    fontFamily: 'Manrope_400Regular',
  },
});
