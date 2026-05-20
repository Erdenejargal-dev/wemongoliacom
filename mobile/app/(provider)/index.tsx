import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useAuthStore } from '@/stores/auth.store';
import { useProviderAnalytics, useProviderProfile } from '@/hooks/useProvider';
import { useProviderBookings as useBookings, ProviderBooking } from '@/hooks/useProviderBookings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ─── Pulse skeleton ──────────────────────────────────────────────────────────

function Pulse({ style }: { style?: any }) {
  // eslint-disable-next-line react-hooks/refs
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8 }, style, { opacity }]}
    />
  );
}

function PulseLight({ style }: { style?: any }) {
  // eslint-disable-next-line react-hooks/refs
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ backgroundColor: '#D5E8F5', borderRadius: 8 }, style, { opacity }]}
    />
  );
}

// ─── Revenue card ─────────────────────────────────────────────────────────────

function RevenueCard({
  loading, thisUSD, thisMNT, lastUSD, lastMNT,
}: {
  loading: boolean;
  thisUSD: number; thisMNT: number;
  lastUSD: number; lastMNT: number;
}) {
  const useUSD     = thisUSD > 0 || lastUSD > 0;
  const current    = useUSD ? thisUSD : thisMNT;
  const last       = useUSD ? lastUSD : lastMNT;
  const sym        = useUSD ? '$' : '₮';
  const pct        = last > 0 ? Math.round(((current - last) / last) * 100) : null;
  const up         = (pct ?? 0) >= 0;
  const month      = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueTopRow}>
        <Text style={styles.revenueEyebrow}>REVENUE · {month.toUpperCase()}</Text>
        {!loading && pct !== null && (
          <View style={[styles.trendBadge, { backgroundColor: up ? '#10B98124' : '#E8404024' }]}>
            <Text style={[styles.trendText, { color: up ? '#4ADE80' : '#FC8181' }]}>
              {up ? '↑' : '↓'} {Math.abs(pct)}%
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <>
          <Pulse style={{ height: 44, width: '52%', marginTop: 14, marginBottom: 10, borderRadius: 10 }} />
          <Pulse style={{ height: 13, width: '38%', borderRadius: 6 }} />
        </>
      ) : (
        <>
          <Text style={styles.revenueAmount}>
            {sym}{current.toLocaleString()}
          </Text>
          {last > 0 ? (
            <Text style={styles.revenueCompare}>
              {sym}{last.toLocaleString()} last month
            </Text>
          ) : (
            <Text style={styles.revenueCompare}>First month of tracking</Text>
          )}
        </>
      )}
    </View>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────

function StatsStrip({
  loading, pending, confirmed, avgRating, ratingCount, completed,
}: {
  loading: boolean;
  pending: number; confirmed: number; completed: number;
  avgRating: number | null; ratingCount: number;
}) {
  return (
    <View style={styles.statsCard}>
      {/* Pending */}
      <View style={styles.statCell}>
        {loading
          ? <PulseLight style={{ height: 30, width: 44, marginBottom: 6, borderRadius: 8 }} />
          : <Text style={[styles.statNum, pending > 0 && { color: C.warning }]}>{pending}</Text>
        }
        <Text style={styles.statLabel}>Pending</Text>
      </View>

      <View style={styles.statLine} />

      {/* Confirmed */}
      <View style={styles.statCell}>
        {loading
          ? <PulseLight style={{ height: 30, width: 44, marginBottom: 6, borderRadius: 8 }} />
          : <Text style={[styles.statNum, { color: C.blue }]}>{confirmed}</Text>
        }
        <Text style={styles.statLabel}>Confirmed</Text>
      </View>

      <View style={styles.statLine} />

      {/* Rating */}
      <View style={styles.statCell}>
        {loading
          ? <PulseLight style={{ height: 30, width: 44, marginBottom: 6, borderRadius: 8 }} />
          : <Text style={[styles.statNum, { color: C.warning }]}>
              {avgRating ? `★ ${avgRating.toFixed(1)}` : '★ —'}
            </Text>
        }
        <Text style={styles.statLabel}>
          {ratingCount > 0 ? `${ratingCount} reviews` : 'Rating'}
        </Text>
      </View>
    </View>
  );
}

// ─── Attention row ────────────────────────────────────────────────────────────

function AttentionRow({ booking, last }: { booking: ProviderBooking; last?: boolean }) {
  const router    = useRouter();
  const guest     = `${booking.user.firstName} ${booking.user.lastName}`.trim();
  const typeColor = { tour: C.warning, accommodation: C.blue, vehicle: '#8B5CF6' }[booking.listingType] ?? C.textSubtle;
  const typeLabel = { tour: 'Tour', accommodation: 'Stay', vehicle: 'Vehicle' }[booking.listingType] ?? booking.listingType;
  const initial   = typeLabel.charAt(0);
  const date      = new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity
      style={[styles.attentionRow, !last && styles.attentionRowBorder]}
      onPress={() => router.push(`/provider/booking/${booking.bookingCode}` as any)}
      activeOpacity={0.68}
      accessibilityRole="button"
    >
      <View style={[styles.typeAvatar, { backgroundColor: typeColor + '1E' }]}>
        <Text style={[styles.typeAvatarText, { color: typeColor }]}>{initial}</Text>
      </View>
      <View style={styles.attentionMeta}>
        <Text style={styles.attentionGuest}>{guest}</Text>
        <Text style={styles.attentionSub}>
          {typeLabel} · {date} · {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.attentionTrail}>
        <Text style={styles.attentionAmt}>
          {booking.currency} {booking.totalAmount.toLocaleString()}
        </Text>
        <IconSymbol name="chevron.right" size={12} color={C.textSubtle} style={{ marginTop: 2 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const { data: profile }    = useProviderProfile();
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useProviderAnalytics();
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings('pending');

  const pendingBookings = bookingsData?.data?.slice(0, 5) ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const thisUSD  = analytics?.revenue.thisMonth.byCurrency?.USD ?? 0;
  const thisMNT  = analytics?.revenue.thisMonth.byCurrency?.MNT ?? 0;
  const lastUSD  = analytics?.revenue.lastMonth.byCurrency?.USD ?? 0;
  const lastMNT  = analytics?.revenue.lastMonth.byCurrency?.MNT ?? 0;
  const pending   = analytics?.bookings.pending    ?? 0;
  const confirmed = analytics?.bookings.confirmed  ?? 0;
  const completed = analytics?.bookings.completed  ?? 0;
  const avgRating = analytics?.reviews.avgRating   ?? null;
  const totalRev  = analytics?.reviews.total       ?? 0;

  const businessName = profile?.name ?? `${user?.firstName ?? 'My'}'s Business`;

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchAnalytics(), refetchBookings()]);
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
    >

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
        <Text style={styles.dateLine}>{todayLabel()} · {greetingWord()}</Text>
      </View>

      {/* ── Revenue hero ── */}
      <RevenueCard
        loading={analyticsLoading}
        thisUSD={thisUSD} thisMNT={thisMNT}
        lastUSD={lastUSD} lastMNT={lastMNT}
      />

      {/* ── Stats ── */}
      <StatsStrip
        loading={analyticsLoading}
        pending={pending}
        confirmed={confirmed}
        completed={completed}
        avgRating={avgRating}
        ratingCount={totalRev}
      />

      {/* ── Needs attention ── */}
      <View style={styles.attentionSection}>
        <View style={styles.attentionHeader}>
          <Text style={styles.attentionTitle}>
            {bookingsLoading || pending > 0 ? 'Needs attention' : 'All caught up'}
          </Text>
          {pending > 0 && (
            <View style={styles.pendingBadgeRow}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pending}</Text>
              </View>
              {pending > 5 && (
                <TouchableOpacity onPress={() => router.push('/(provider)/bookings' as any)}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {bookingsLoading ? (
          <View style={styles.attentionCard}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.attentionRow, i === 0 && styles.attentionRowBorder]}>
                <PulseLight style={{ width: 38, height: 38, borderRadius: 19 }} />
                <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
                  <PulseLight style={{ height: 14, width: '50%', borderRadius: 7 }} />
                  <PulseLight style={{ height: 10, width: '68%', borderRadius: 5 }} />
                </View>
                <PulseLight style={{ height: 14, width: 60, borderRadius: 6 }} />
              </View>
            ))}
          </View>
        ) : pendingBookings.length === 0 ? (
          <View style={styles.caughtUpCard}>
            <View style={styles.caughtUpIcon}>
              <Text style={{ fontSize: 18 }}>✓</Text>
            </View>
            <View>
              <Text style={styles.caughtUpTitle}>No pending requests</Text>
              <Text style={styles.caughtUpSub}>New booking requests will appear here</Text>
            </View>
          </View>
        ) : (
          <View style={styles.attentionCard}>
            {pendingBookings.map((b, i) => (
              <AttentionRow
                key={b.id}
                booking={b}
                last={i === pendingBookings.length - 1}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── View all bookings ── */}
      {!analyticsLoading && analytics && (
        <TouchableOpacity
          style={styles.allBtn}
          onPress={() => router.push('/(provider)/bookings' as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.allBtnLabel}>All bookings</Text>
          <View style={styles.allBtnCount}>
            <Text style={styles.allBtnCountText}>{analytics.bookings.total} total</Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={C.textSubtle} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  scroll: { paddingBottom: 48 },

  // ── Header ──
  header: {
    paddingHorizontal: S[5],
    paddingTop: 62,
    paddingBottom: 20,
  },
  businessName: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.6,
  },
  dateLine: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 4,
  },

  // ── Revenue card ──
  revenueCard: {
    backgroundColor: C.navy,
    borderRadius: 22,
    marginHorizontal: S[5],
    padding: 22,
    marginBottom: 12,
    shadowColor: C.navyDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  revenueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueEyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Manrope_600SemiBold',
    letterSpacing: 1.2,
  },
  trendBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  revenueAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -1.5,
    marginTop: 14,
    marginBottom: 6,
  },
  revenueCompare: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: 'Manrope_400Regular',
  },

  // ── Stats strip ──
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginHorizontal: S[5],
    marginBottom: 24,
    shadowColor: '#4A90C4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 1,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
  statLine: {
    width: 0.5,
    height: 36,
    backgroundColor: '#D5E8F5',
  },

  // ── Needs attention ──
  attentionSection: {
    paddingHorizontal: S[5],
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSubtle,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pendingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
  },
  seeAll: {
    fontSize: 12,
    color: C.blue,
    fontFamily: 'Manrope_600SemiBold',
  },

  attentionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
    shadowColor: '#4A90C4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 1,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  attentionRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#EBF3FA',
  },
  typeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  attentionMeta: { flex: 1 },
  attentionGuest: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  attentionSub: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 3,
  },
  attentionTrail: {
    alignItems: 'flex-end',
    gap: 3,
  },
  attentionAmt: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
  },

  // ── All caught up ──
  caughtUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#4A90C4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  caughtUpIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10B98116',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caughtUpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  caughtUpSub: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },

  // ── All bookings link ──
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: S[5],
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
  },
  allBtnLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  allBtnCount: {
    backgroundColor: C.bgPage,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  allBtnCountText: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_600SemiBold',
  },
});
