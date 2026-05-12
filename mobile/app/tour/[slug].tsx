import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { useTour } from '@/hooks/useTours';

export default function TourDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: tour, isLoading, isError } = useTour(slug);

  if (isLoading) return <SkeletonDetail />;
  if (isError || !tour) {
    return (
      <ErrorState
        title="Could not load tour"
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
            source={tour.image ? { uri: tour.image } : require('@/assets/images/splash-icon.png')}
            style={styles.heroImg}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{tour.name}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{tour.durationDays}</Text>
              <Text style={styles.statLabel}>DAYS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{tour.maxGroupSize ?? '—'}</Text>
              <Text style={styles.statLabel}>MAX GROUP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{tour.rating?.toFixed(1) ?? '—'}</Text>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${tour.price} {tour.currency}
            </Text>
            <Text style={styles.perPerson}>/ person</Text>
          </View>

          {/* Description */}
          {tour.description && (
            <>
              <SectionHeader title="About this tour" />
              <Text style={styles.description}>{tour.description}</Text>
            </>
          )}

          {/* Destination */}
          {tour.destination && (
            <View style={styles.destCard}>
              <Text style={styles.destLabel}>DESTINATION</Text>
              <Text style={styles.destName}>{tour.destination.name}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Per person</Text>
          <Text style={styles.ctaPrice}>${tour.price} {tour.currency}</Text>
        </View>
        <Button
          label="Book this tour"
          onPress={() =>
            router.push({ pathname: '/booking/select-dates', params: { listingId: tour.id, listingType: 'tour', listingName: tour.name } } as any)
          }
          style={styles.ctaBtn}
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
    marginBottom: S[4],
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginBottom: S[4],
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statNum: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  statLabel: {
    fontSize: 10,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
    marginTop: 2,
  },
  statDivider: { width: 0.5, backgroundColor: '#D5E8F5', marginVertical: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: S[4],
  },
  price: { fontSize: 24, fontWeight: '700', color: C.blue, fontFamily: 'Manrope_700Bold' },
  perPerson: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  description: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
    fontFamily: 'Manrope_400Regular',
    marginBottom: S[4],
  },
  destCard: {
    backgroundColor: C.navy,
    borderRadius: 12,
    padding: 16,
    marginTop: S[2],
  },
  destLabel: {
    fontSize: 10,
    color: C.textAccent,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  destName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold' },
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
  ctaBtn: { minWidth: 140 },
});
