import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useStay } from '@/hooks/useStays';

export default function StayDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: stay, isLoading, isError } = useStay(slug);

  if (isLoading) return <SkeletonDetail />;
  if (isError || !stay) {
    return (
      <ErrorState
        title="Could not load stay"
        message="Check your connection and try again."
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={stay.image ? { uri: stay.image } : require('@/assets/images/splash-icon.png')}
            style={styles.heroImg}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
            <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{stay.name}</Text>

          {stay.location && (
            <View style={styles.locationRow}>
              <IconSymbol name="location.fill" size={12} color={C.textSubtle} />
              <Text style={styles.location}>{stay.location}</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${stay.pricePerNight} {stay.currency}</Text>
            <Text style={styles.perNight}>/ night</Text>
          </View>

          {/* Rating */}
          {stay.rating != null && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>★ {stay.rating.toFixed(1)}</Text>
              {stay.reviewCount != null && (
                <Text style={styles.reviews}>({stay.reviewCount} reviews)</Text>
              )}
            </View>
          )}

          <SectionHeader title="About this stay" />
          <Text style={styles.description}>
            A comfortable and authentic accommodation experience in the heart of Mongolia.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Per night</Text>
          <Text style={styles.ctaPrice}>${stay.pricePerNight} {stay.currency}</Text>
        </View>
        <Button
          label="Book stay"
          onPress={() =>
            router.push({ pathname: '/booking/select-dates', params: { listingId: stay.id, listingType: 'stay', listingName: stay.name } } as any)
          }
          style={{ minWidth: 120 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgPage },
  errText: { fontSize: 15, color: C.error, fontFamily: 'Manrope_600SemiBold' },
  backLink: { fontSize: 13, color: C.blue, marginTop: 12 },
  hero: { height: 280, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,32,48,0.3)' },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: S[5] },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    marginBottom: S[2],
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: S[3] },
  location: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: S[2] },
  price: { fontSize: 24, fontWeight: '700', color: C.blue, fontFamily: 'Manrope_700Bold' },
  perNight: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S[4] },
  ratingText: { fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  reviews: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  description: { fontSize: 13, color: C.textMuted, lineHeight: 20, fontFamily: 'Manrope_400Regular' },
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
    paddingBottom: 32,
  },
  ctaLabel: { fontSize: 11, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },
  ctaPrice: { fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
});
