import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useProviderBookings, BookingStatusFilter, ProviderBooking } from '@/hooks/useProviderBookings';

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: BookingStatusFilter; color: string }[] = [
  { label: 'Pending',   value: 'pending',   color: '#F59E0B' },
  { label: 'Confirmed', value: 'confirmed', color: C.blue    },
  { label: 'Completed', value: 'completed', color: '#10B981' },
  { label: 'Cancelled', value: 'cancelled', color: C.error   },
  { label: 'All',       value: undefined,   color: C.navy    },
];

const LISTING_TYPE_LABEL: Record<string, string> = {
  tour:          'Tour',
  accommodation: 'Stay',
  vehicle:       'Vehicle',
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

function CardSkeleton() {
  // eslint-disable-next-line react-hooks/refs
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonStripe} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonBlock, { width: '50%', height: 14, borderRadius: 7 }]} />
          <View style={[styles.skeletonBlock, { width: 60, height: 22, borderRadius: 11 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: '35%', height: 10, borderRadius: 5, marginTop: 8 }]} />
        <View style={styles.skeletonDivider} />
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonBlock, { width: '40%', height: 10, borderRadius: 5 }]} />
          <View style={[styles.skeletonBlock, { width: '20%', height: 10, borderRadius: 5 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Booking card ────────────────────────────────────────────────────────────

function GuestAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function BookingCard({ booking }: { booking: ProviderBooking }) {
  const router = useRouter();
  const filter = STATUS_FILTERS.find((f) => f.value === booking.bookingStatus);
  const accentColor = filter?.color ?? C.textSubtle;
  const guestName = `${booking.user.firstName} ${booking.user.lastName}`.trim();
  const typeLabel = LISTING_TYPE_LABEL[booking.listingType] ?? booking.listingType;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.72}
      onPress={() => router.push(`/provider/booking/${booking.bookingCode}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`Booking ${booking.bookingCode}`}
    >
      {/* Left status stripe */}
      <View style={[styles.cardStripe, { backgroundColor: accentColor }]} />

      <View style={styles.cardBody}>
        {/* Row 1: type + status pill */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTypeWrap}>
            <Text style={styles.cardTypeText}>{typeLabel} Booking</Text>
            <Text style={styles.cardCode}>#{booking.bookingCode}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: accentColor + '1A' }]}>
            <View style={[styles.statusPillDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.statusPillText, { color: accentColor }]}>
              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Row 2: guest + date */}
        <View style={styles.cardMidRow}>
          <GuestAvatar name={guestName} />
          <View style={styles.cardGuestInfo}>
            <Text style={styles.guestName}>{guestName}</Text>
            <Text style={styles.guestSub}>
              {booking.guests} guest{booking.guests !== 1 ? 's' : ''} · {formatDate(booking.startDate)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Row 3: type tag + amount */}
        <View style={styles.cardBottomRow}>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{booking.listingType.toUpperCase()}</Text>
          </View>
          <Text style={styles.cardAmount}>
            {booking.currency} {booking.totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Filter tab bar ──────────────────────────────────────────────────────────

function FilterBar({
  active,
  onSelect,
}: {
  active: BookingStatusFilter;
  onSelect: (v: BookingStatusFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterBar}
    >
      {STATUS_FILTERS.map((f) => {
        const isActive = active === f.value;
        return (
          <TouchableOpacity
            key={f.label}
            style={[
              styles.filterTab,
              isActive && { backgroundColor: f.color + '14', borderColor: f.color },
            ]}
            onPress={() => onSelect(f.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.filterTabText,
                isActive && { color: f.color, fontFamily: 'Manrope_600SemiBold' },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ status }: { status: BookingStatusFilter }) {
  const msg = status
    ? `No ${status} bookings right now`
    : 'No bookings yet';
  const sub = status === 'pending'
    ? 'New booking requests will appear here'
    : 'Completed bookings appear once guests check out';
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 32 }}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>{msg}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProviderBookingsScreen() {
  const [activeStatus, setActiveStatus] = useState<BookingStatusFilter>('pending');
  const { data, isLoading, refetch } = useProviderBookings(activeStatus);
  const bookings = data?.data ?? [];
  const total = data?.pagination?.total;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Bookings</Text>
          {total != null && (
            <Text style={styles.headingSub}>
              {total} {activeStatus ?? 'total'}
            </Text>
          )}
        </View>
      </View>

      {/* Filter bar */}
      <FilterBar active={activeStatus} onSelect={setActiveStatus} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </View>
      ) : bookings.length === 0 ? (
        <EmptyState status={activeStatus} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  header: {
    paddingHorizontal: S[5],
    paddingTop: 60,
    paddingBottom: S[3],
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
  },
  headingSub: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
    textTransform: 'capitalize',
  },

  // ── Filter bar ──
  filterBar: {
    gap: 8,
    paddingHorizontal: S[5],
    paddingBottom: S[3],
  },
  filterTab: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#D5E8F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabText: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },

  // ── Card ──
  list: { paddingHorizontal: S[5], paddingBottom: 32 },
  skeletonList: { paddingHorizontal: S[5] },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#4A90C4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTypeWrap: { flex: 1 },
  cardTypeText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.2,
  },
  cardCode: {
    fontSize: 11,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
    letterSpacing: 0.2,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillDot: { width: 5, height: 5, borderRadius: 3 },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: '600',
  },

  cardDivider: {
    height: 0.5,
    backgroundColor: '#EBF3FA',
    marginVertical: 12,
  },

  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
  },
  cardGuestInfo: { flex: 1 },
  guestName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  guestSub: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    backgroundColor: '#EFF7FD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagText: {
    fontSize: 9,
    color: C.blue,
    fontFamily: 'Manrope_600SemiBold',
    letterSpacing: 0.8,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.2,
  },

  // ── Skeleton ──
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginBottom: 12,
    overflow: 'hidden',
    height: 150,
  },
  skeletonStripe: {
    width: 4,
    backgroundColor: '#D5E8F5',
  },
  skeletonBody: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonBlock: { backgroundColor: '#E8F3FA' },
  skeletonDivider: { height: 0.5, backgroundColor: '#EBF3FA', marginVertical: 10 },

  // ── Empty ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF7FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
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
});
