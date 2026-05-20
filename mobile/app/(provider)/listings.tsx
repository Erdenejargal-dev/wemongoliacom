import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useProviderLimits } from '@/hooks/useProvider';
import {
  useProviderTours,
  useArchiveTour,
  useProviderAccommodations,
  ProviderTour,
  ProviderAccommodation,
} from '@/hooks/useProviderTours';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Tours', 'Stays'] as const;
type Tab = typeof TABS[number];

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  draft:  '#F59E0B',
  paused: C.error,
};

const TYPE_LABEL: Record<string, string> = {
  ger_camp:    'Ger Camp',
  hotel:       'Hotel',
  lodge:       'Lodge',
  guesthouse:  'Guesthouse',
  resort:      'Resort',
  hostel:      'Hostel',
  homestay:    'Homestay',
};

// ─── Tour card ────────────────────────────────────────────────────────────────

function TourCard({ tour }: { tour: ProviderTour }) {
  const router  = useRouter();
  const archive = useArchiveTour();
  const thumb   = tour.images?.[0]?.imageUrl;
  const status  = tour.status as string;
  const price   = tour.baseAmount ?? tour.basePrice ?? 0;
  const sym     = tour.baseCurrency === 'MNT' ? '₮' : '$';

  function handleArchive() {
    Alert.alert(
      'Archive tour',
      `Archive "${tour.title}"? It will be hidden from travelers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => archive.mutate(tour.id) },
      ]
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={() => router.push(`/provider/tour/${tour.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={tour.title}
    >
      {/* Image */}
      <View style={styles.cardImage}>
        {thumb
          ? <Image source={{ uri: thumb }} style={styles.cardImageFill} contentFit="cover" />
          : <View style={[styles.cardImageFill, styles.imagePlaceholder]} />
        }
        {/* Status badge — top left */}
        <View style={[styles.statusOverlay, { backgroundColor: STATUS_COLOR[status] + 'EE' }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusOverlayText}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        {/* Archive — top right */}
        <TouchableOpacity
          style={styles.archiveOverlay}
          onPress={handleArchive}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Archive"
        >
          <IconSymbol name="trash" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Info row */}
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{tour.title}</Text>
          <View style={styles.cardMeta}>
            {tour.durationDays
              ? <Text style={styles.metaChip}>{tour.durationDays}d</Text>
              : null
            }
            {price > 0
              ? <Text style={styles.metaPrice}>{sym}{price.toLocaleString()} / person</Text>
              : null
            }
          </View>
        </View>
        <IconSymbol name="chevron.right" size={14} color={C.textSubtle} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Stay card ────────────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 9, color: i <= n ? '#F59E0B' : '#D5E8F5' }}>★</Text>
      ))}
    </View>
  );
}

function StayCard({ acc }: { acc: ProviderAccommodation }) {
  const router = useRouter();
  const thumb  = acc.images?.[0]?.imageUrl;
  const status = acc.status as string;
  const rooms  = acc._count?.roomTypes ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={() => router.push(`/provider/accommodation/${acc.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={acc.name}
    >
      {/* Image */}
      <View style={styles.cardImage}>
        {thumb
          ? <Image source={{ uri: thumb }} style={styles.cardImageFill} contentFit="cover" />
          : <View style={[styles.cardImageFill, styles.imagePlaceholderStay]} />
        }
        {/* Status badge */}
        <View style={[styles.statusOverlay, { backgroundColor: STATUS_COLOR[status] + 'EE' }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusOverlayText}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        {/* Type + stars — bottom left */}
        <View style={styles.stayBottomOverlay}>
          {acc.accommodationType
            ? <View style={styles.typeChip}>
                <Text style={styles.typeChipText}>
                  {TYPE_LABEL[acc.accommodationType] ?? acc.accommodationType}
                </Text>
              </View>
            : null
          }
          {acc.starRating ? <Stars n={acc.starRating} /> : null}
        </View>
      </View>

      {/* Info row */}
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{acc.name}</Text>
          <View style={styles.cardMeta}>
            {acc.city
              ? <Text style={styles.metaCity}>{acc.city}</Text>
              : null
            }
            {rooms > 0
              ? <Text style={styles.metaChip}>{rooms} room{rooms !== 1 ? 's' : ''}</Text>
              : null
            }
          </View>
        </View>
        {/* Calendar quick-link */}
        <TouchableOpacity
          style={styles.calBtn}
          onPress={() => router.push(`/provider/accommodation/${acc.id}` as any)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Calendar"
        >
          <IconSymbol name="calendar" size={14} color={C.blue} />
          <Text style={styles.calBtnText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onCreateTour }: { tab: Tab; onCreateTour?: () => void }) {
  if (tab === 'Tours') {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏔</Text>
        <Text style={styles.emptyTitle}>No tours yet</Text>
        <Text style={styles.emptySub}>Create your first tour to start accepting bookings</Text>
        {onCreateTour && (
          <TouchableOpacity style={styles.emptyBtn} onPress={onCreateTour} accessibilityRole="button">
            <Text style={styles.emptyBtnText}>Create a tour</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🏠</Text>
      <Text style={styles.emptyTitle}>No stays yet</Text>
      <Text style={styles.emptySub}>Add your first property to get started</Text>
    </View>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct     = Math.min(used / Math.max(limit, 1), 1);
  const atLimit = used >= limit;
  const barColor = atLimit ? C.error : pct > 0.8 ? C.warning : C.blue;
  return (
    <View style={styles.usageWrap}>
      <View style={styles.usageTextRow}>
        <Text style={styles.usageLabel}>{label}</Text>
        <Text style={[styles.usageCount, atLimit && { color: C.error }]}>
          {used} / {limit}
        </Text>
      </View>
      <View style={styles.usageTrack}>
        <View style={[styles.usageFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProviderListingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Tours');

  const { data: toursData,  isLoading: toursLoading,  refetch: refetchTours }  = useProviderTours();
  const { data: staysData,  isLoading: staysLoading,  refetch: refetchStays }  = useProviderAccommodations();
  const { data: limits }                                                         = useProviderLimits();

  const tours   = toursData?.data  ?? [];
  const stays   = staysData?.data  ?? [];
  const loading = activeTab === 'Tours' ? toursLoading : staysLoading;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchTours(), refetchStays()]);
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Listings</Text>
          {limits && (
            <Text style={styles.headingSub}>
              {activeTab === 'Tours'
                ? `${limits.toursUsed} of ${limits.toursLimit} tours`
                : `${limits.accommodationsUsed} of ${limits.accommodationsLimit} stays`
              }
            </Text>
          )}
        </View>
        {activeTab === 'Tours' && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/provider/tour/create' as any)}
            accessibilityRole="button"
            accessibilityLabel="New tour"
          >
            <IconSymbol name="plus" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Usage bar ── */}
      {limits && (
        <View style={styles.usageSection}>
          {activeTab === 'Tours'
            ? <UsageBar used={limits.toursUsed} limit={limits.toursLimit} label="Tours used" />
            : <UsageBar used={limits.accommodationsUsed} limit={limits.accommodationsLimit} label="Stays used" />
          }
        </View>
      )}

      {/* ── Tab switcher ── */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === t }}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </View>
      ) : activeTab === 'Tours' ? (
        tours.length === 0 ? (
          <EmptyState
            tab="Tours"
            onCreateTour={() => router.push('/provider/tour/create' as any)}
          />
        ) : (
          <FlatList
            data={tours}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <TourCard tour={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />
            }
          />
        )
      ) : stays.length === 0 ? (
        <EmptyState tab="Stays" />
      ) : (
        <FlatList
          data={stays}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <StayCard acc={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingTop: 62,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.6,
  },
  headingSub: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 3,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },

  // ── Usage ──
  usageSection: {
    paddingHorizontal: S[5],
    marginBottom: 14,
  },
  usageWrap: { gap: 5 },
  usageTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageLabel: {
    fontSize: 11,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
  },
  usageCount: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_600SemiBold',
  },
  usageTrack: {
    height: 3,
    backgroundColor: '#D5E8F5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: S[5],
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#D5E8F5',
    backgroundColor: '#FFFFFF',
  },
  tabActive: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },
  tabText: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_600SemiBold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // ── Card ──
  list: { paddingHorizontal: S[5], paddingBottom: 32 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#4A90C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    height: 148,
    position: 'relative',
  },
  cardImageFill: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#C8DFF0',
  },
  imagePlaceholderStay: {
    backgroundColor: '#B8D8EC',
  },

  // Status badge (top-left over image)
  statusOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  statusOverlayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
  },

  // Archive button (top-right over image)
  archiveOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stay-specific bottom overlay (type chip + stars)
  stayBottomOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeChipText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
    letterSpacing: 0.3,
  },

  // Card info row
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  cardInfoLeft: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },
  metaPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: C.blue,
    fontFamily: 'Manrope_700Bold',
  },
  metaCity: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },

  // Calendar quick-link
  calBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF7FD',
  },
  calBtnText: {
    fontSize: 11,
    color: C.blue,
    fontFamily: 'Manrope_600SemiBold',
  },

  // ── Skeleton ──
  skeletonCard: {
    shadowOpacity: 0,
    elevation: 0,
  },
  skeletonImage: {
    height: 148,
    backgroundColor: '#E0EDF6',
  },
  skeletonInfo: {
    padding: 14,
  },
  skeletonLine: {
    height: 13,
    backgroundColor: '#E0EDF6',
    borderRadius: 6,
    width: '70%',
  },

  // ── Empty ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: C.navy,
    borderRadius: 100,
    paddingHorizontal: 28,
    paddingVertical: 13,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
  },
});
