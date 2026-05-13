// Design.md §8.8 — My Trips
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FilterPill } from '@/components/ui/FilterPill';
import { TripCard, TripCardSkeleton } from '@/components/cards/TripCard';
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
