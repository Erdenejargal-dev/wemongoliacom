// Design.md §8.8 — My Trips
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { FilterPill } from '@/components/ui/FilterPill';
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';
import { Booking } from '@/types/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TABS = ['Saved', 'Plans'];
const SUB_FILTERS = ['All', 'Upcoming', 'Past'];

function useBookings() {
  return useQuery<{ data: Booking[] }>({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then((r) => r.data),
  });
}

function TripCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => {}}
      accessibilityRole="button"
      accessibilityLabel={booking.listingName}
    >
      <View style={styles.tripImg}>
        <Image
          source={booking.listingImage ? { uri: booking.listingImage } : require('@/assets/images/splash-icon.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <View style={styles.tripOverlay} />
        {/* Confirmed badge */}
        <View style={styles.tripBadge}>
          <Badge
            label={booking.status === 'confirmed' ? 'Confirmed' : booking.status}
            variant={booking.status === 'confirmed' ? 'confirmed' : 'inProgress'}
          />
        </View>
      </View>
      <View style={styles.tripInfo}>
        <Text style={styles.tripName} numberOfLines={1}>{booking.listingName}</Text>
        <Text style={styles.tripDate}>{booking.startDate}{booking.endDate ? ` – ${booking.endDate}` : ''}</Text>
        <View style={styles.tripFooter}>
          <Text style={styles.tripPrice}>${booking.totalPrice} {booking.currency}</Text>
          <TouchableOpacity style={styles.viewBtn} accessibilityRole="button">
            <Text style={styles.viewBtnText}>View itinerary</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TripCardSkeleton() {
  return (
    <View style={[styles.tripCard, { overflow: 'hidden' }]}>
      <SkeletonCard style={{ height: 160, borderRadius: 0 }} />
      <View style={{ padding: 14, gap: 8 }}>
        <SkeletonText width="70%" />
        <SkeletonText width="45%" />
      </View>
    </View>
  );
}

export default function TripsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Plans');
  const [activeSub, setActiveSub] = useState('All');
  const { data, isLoading } = useBookings();
  const bookings = data?.data ?? [];

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>My Trips</Text>
          <TouchableOpacity
            onPress={() => router.push('/wishlist' as any)}
            style={styles.wishBtn}
            accessibilityRole="button"
            accessibilityLabel="Wishlist"
          >
            <IconSymbol name="heart.fill" size={18} color={C.blue} />
          </TouchableOpacity>
        </View>

        {/* Stats row — Design.md §7.10 */}
        <View style={styles.statsRow}>
          {[
            { num: '3',  label: 'COUNTRIES'    },
            { num: bookings.length.toString(), label: 'BOOKINGS' },
            { num: bookings.filter(b => b.status === 'confirmed').length.toString(), label: 'UPCOMING' },
          ].map((s, i, arr) => (
            <View key={s.label} style={[styles.stat, i < arr.length - 1 && styles.statBorder]}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab bar */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <FilterPill key={t} label={t} active={activeTab === t} onPress={() => setActiveTab(t)} />
          ))}
        </View>

        {/* Sub-filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
          {SUB_FILTERS.map((f) => (
            <FilterPill key={f} label={f} active={activeSub === f} onPress={() => setActiveSub(f)} />
          ))}
        </ScrollView>

        {/* Trips list */}
        {isLoading ? (
          <>
            <TripCardSkeleton />
            <TripCardSkeleton />
          </>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyMuted}>Book a tour, stay, or vehicle to get started</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/' as any)}
              accessibilityRole="button"
            >
              <Text style={styles.exploreBtnText}>Explore Mongolia</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((b) => <TripCard key={b.id} booking={b} />)
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: S[4],
  },
  heading: { fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  wishBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
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
  statBorder: { borderRightWidth: 0.5, borderRightColor: '#D5E8F5' },
  statNum: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  statLabel: {
    fontSize: 9,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
    marginTop: 2,
  },

  tabRow: { flexDirection: 'row', gap: S[2], marginBottom: S[3] },
  subRow: { gap: S[2], marginBottom: S[4] },

  // Trip card
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
    marginBottom: S[3],
  },
  tripImg: { height: 160, position: 'relative' },
  tripOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,32,48,0.3)' },
  tripBadge: { position: 'absolute', top: 12, left: 12 },
  tripInfo: { padding: 14 },
  tripName: { fontSize: 15, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold', marginBottom: 4 },
  tripDate: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginBottom: 10 },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tripPrice: { fontSize: 14, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  viewBtn: {
    backgroundColor: C.blue,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  viewBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', textAlign: 'center' },
  exploreBtn: {
    marginTop: 12,
    backgroundColor: C.blue,
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
