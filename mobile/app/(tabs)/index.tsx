// Design.md §8.2 — Dashboard, 6 state variants
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AIBanner } from '@/components/cards/AIBanner';
import {
  DestinationCard,
  DestinationCardSkeleton,
} from '@/components/cards/DestinationCard';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useDestinations } from '@/hooks/useDestinations';
import { useAuthStore } from '@/stores/auth.store';

const FILTERS = ['Trending', 'Top Picks', 'Nearby'];
const SUB_FILTERS = ['All', 'Popular', 'Nearby', 'Top Picks'];

const CATEGORIES = [
  { label: 'Tours',   icon: 'airplane'      },
  { label: 'Stays',   icon: 'building.2.fill'},
  { label: 'Vehicles',icon: 'car.fill'      },
  { label: 'Saved',   icon: 'bookmark.fill' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [activeSub, setActiveSub] = useState('All');

  const { data, isLoading, isError } = useDestinations({ limit: 8 });
  const destinations = data?.data ?? [];

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── User header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.city}>Ulaanbaatar, MN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/notifications' as any)}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <IconSymbol name="bell" size={20} color={C.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => router.push('/(tabs)/more' as any)}
              accessibilityLabel="Profile"
              accessibilityRole="button"
            >
              {user?.avatarUrl ? null : (
                <Text style={styles.avatarInitial}>
                  {user?.firstName?.charAt(0).toUpperCase() ?? 'T'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Primary filter pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>

        {/* ── Search bar (navigates to /search) ── */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push('/search' as any)}
          accessibilityRole="search"
          accessibilityLabel="Search destinations"
        >
          <IconSymbol name="magnifyingglass" size={18} color={C.textSubtle} />
          <Text style={styles.searchPlaceholder}>Search destinations...</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push('/search' as any)}
            accessibilityLabel="Open filters"
          >
            <IconSymbol name="slider.horizontal.3" size={16} color={C.textAccent} />
          </TouchableOpacity>
        </Pressable>

        {/* ── Explore section + sub-filters ── */}
        <View style={{ marginTop: S[6] }}>
          <SectionHeader title="Explore Mongolia" onSeeAll={() => router.push('/search' as any)} />

          {/* Sub-filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subPillRow}
          >
            {SUB_FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={activeSub === f}
                onPress={() => setActiveSub(f)}
              />
            ))}
          </ScrollView>

          {/* Destination card grid */}
          {isLoading ? (
            <View style={styles.grid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <DestinationCardSkeleton key={i} style={styles.gridCard} />
              ))}
            </View>
          ) : isError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Could not load destinations. Pull to retry.</Text>
            </View>
          ) : destinations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No destinations found.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  item={dest}
                  style={styles.gridCard}
                  onPress={() => router.push(`/destination/${dest.slug}` as any)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Categories ── */}
        <View style={{ marginTop: S[6] }}>
          <SectionHeader title="Browse by type" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={styles.catChip}
                accessibilityRole="button"
                accessibilityLabel={cat.label}
              >
                <View style={styles.catIcon}>
                  <IconSymbol name={cat.icon as any} size={18} color={C.blue} />
                </View>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── AI banner ── */}
        <View style={{ marginTop: S[6] }}>
          <AIBanner onPress={() => router.push('/(tabs)/ai' as any)} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: S[6],
  },
  locationLabel: {
    fontSize: 11,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
  },
  city: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: C.blue,
    fontFamily: 'Manrope_700Bold',
  },

  // Filter pills
  pillRow: { gap: S[2], paddingBottom: S[4] },
  subPillRow: { gap: S[2], marginBottom: S[4] },

  // Search bar (fake input — taps navigate to /search)
  searchBar: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: { width: '47.5%' },

  // Error / empty
  errorBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
  },
  errorText: { fontSize: 13, color: C.error, fontFamily: 'Manrope_400Regular' },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },

  // Categories
  catRow: { gap: 10 },
  catChip: { alignItems: 'center', gap: 6 },
  catIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },
});
