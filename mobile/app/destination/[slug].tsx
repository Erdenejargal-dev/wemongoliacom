// Design.md §8.5 — Destination Detail
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { useDestination } from '@/hooks/useDestinations';

const TABS = ['Description', 'Tour Partners', 'Moments'];

export default function DestinationDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: dest, isLoading, isError } = useDestination(slug);
  const [activeTab, setActiveTab] = useState('Description');

  if (isLoading) return <SkeletonDetail />;
  if (isError || !dest) {
    return (
      <ErrorState
        title="Could not load destination"
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
            source={dest.image ? { uri: dest.image } : require('@/assets/images/splash-icon.png')}
            style={styles.heroImg}
            contentFit="cover"
          />
          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Trip count badge */}
          <View style={styles.tripCount}>
            <Text style={styles.tripCountText}>23 Travelers Joined This Trip</Text>
          </View>

          {/* Rating + name bottom of hero */}
          <View style={styles.heroBottom}>
            {dest.rating != null && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {dest.rating.toFixed(1)}</Text>
                {dest.reviewCount != null && (
                  <Text style={styles.reviewCount}> ({dest.reviewCount})</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{dest.name}</Text>
          {dest.location && (
            <View style={styles.locationRow}>
              <IconSymbol name="location.fill" size={12} color={C.textSubtle} />
              <Text style={styles.location}>{dest.location}</Text>
            </View>
          )}

          {/* Dates chip */}
          <View style={styles.datesRow}>
            <View style={styles.dateChip}>
              <IconSymbol name="calendar" size={12} color={C.textAccent} />
              <Text style={styles.dateChipText}>Open year round</Text>
            </View>
          </View>

          {/* Tab bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {TABS.map((tab) => (
              <FilterPill
                key={tab}
                label={tab}
                active={activeTab === tab}
                onPress={() => setActiveTab(tab)}
              />
            ))}
          </ScrollView>

          {/* Tab content */}
          {activeTab === 'Description' && (
            <Text style={styles.description}>
              {dest.description ?? 'Discover the breathtaking landscapes and rich culture of this remarkable destination in Mongolia.'}
            </Text>
          )}
          {activeTab === 'Tour Partners' && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Tour partners listing — Phase 4b</Text>
            </View>
          )}
          {activeTab === 'Moments' && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Photo moments gallery — Phase 4b</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Explore tours</Text>
          <Text style={styles.ctaFrom}>from $299 / person</Text>
        </View>
        <Button
          label="Book now"
          onPress={() => router.push(`/tour/${slug}` as any)}
          style={styles.ctaBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgPage },
  errorText: { fontSize: 15, color: C.error, fontFamily: 'Manrope_600SemiBold' },
  backLink: { fontSize: 13, color: C.blue, marginTop: 12, fontFamily: 'Manrope_400Regular' },

  // Hero
  hero: { height: 320, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    // gradient via solid layers approximation
    backgroundColor: 'rgba(0,32,48,0.45)',
  },
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
  tripCount: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tripCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  reviewCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
  },

  // Content
  content: { padding: S[5], paddingTop: S[4] },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: S[4],
  },
  location: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  datesRow: { flexDirection: 'row', marginBottom: S[4] },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.navy,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateChipText: {
    color: C.textAccent,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  tabRow: { gap: S[2], marginBottom: S[4] },
  description: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
    fontFamily: 'Manrope_400Regular',
  },
  placeholder: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: { fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },

  // CTA bar
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
  ctaFrom: { fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  ctaBtn: { minWidth: 120 },
});
