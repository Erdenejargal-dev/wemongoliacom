// Design.md §7.2 — Destination Cards
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, style]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}${item.location ? ', ' + item.location : ''}`}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={item.image ? { uri: item.image } : require('@/assets/images/splash-icon.png')}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {/* Arrow — top-right */}
        <TouchableOpacity
          onPress={onPress}
          style={styles.arrowBtn}
          accessibilityLabel={`Open ${item.name}`}
          accessibilityRole="button"
          hitSlop={8}
        >
          <IconSymbol name="arrow.up.right" size={12} color="#FFFFFF" />
        </TouchableOpacity>
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
    </Pressable>
  );
}

export function DestinationCardSkeleton({ style }: { style?: object }) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.imageWrap, styles.skeletonImg]} />
      <View style={styles.info}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSub} />
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
    position: 'relative',
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
  // skeleton
  skeletonImg: { backgroundColor: '#D0ECFA' },
  skeletonTitle: {
    height: 12,
    width: '75%',
    backgroundColor: '#D0ECFA',
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonSub: {
    height: 10,
    width: '50%',
    backgroundColor: '#EFF7FD',
    borderRadius: 5,
  },
});
