import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import {
  useProviderBooking,
  useCompleteBooking,
  useCancelBookingByProvider,
} from '@/hooks/useProviderBookings';

const STATUS_COLOR: Record<string, string> = {
  pending:   '#F59E0B',
  confirmed: C.blue,
  completed: '#10B981',
  cancelled: C.error,
};

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <IconSymbol name={icon} size={14} color={C.textSubtle} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function listingLabel(type: string) {
  const map: Record<string, string> = { tour: 'Tour', vehicle: 'Vehicle', accommodation: 'Accommodation' };
  return map[type] ?? type;
}

export default function ProviderBookingDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { data: booking, isLoading, isError } = useProviderBooking(code);
  const complete = useCompleteBooking();
  const cancel   = useCancelBookingByProvider();
  const [busy, setBusy] = useState(false);

  if (isLoading) return <SkeletonDetail />;
  if (isError || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        message="Check your connection and try again."
        onRetry={() => router.back()}
      />
    );
  }

  const statusColor = STATUS_COLOR[booking.bookingStatus] ?? C.textSubtle;
  const guestName = `${booking.user.firstName} ${booking.user.lastName}`.trim();

  async function handleAction(action: 'complete' | 'cancel') {
    if (action === 'cancel') {
      Alert.alert(
        'Cancel booking',
        'Are you sure you want to cancel this booking? This cannot be undone.',
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel booking',
            style: 'destructive',
            onPress: async () => {
              setBusy(true);
              try {
                await cancel.mutateAsync({ code: booking.bookingCode });
                router.back();
              } catch {
                Alert.alert('Error', 'Failed to cancel booking.');
              } finally {
                setBusy(false);
              }
            },
          },
        ]
      );
      return;
    }

    setBusy(true);
    try {
      await complete.mutateAsync(booking.bookingCode);
      router.back();
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
            <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Booking detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={[styles.statusBanner, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
            </Text>
          </View>

          <Text style={styles.listingName}>{listingLabel(booking.listingType)}</Text>
          <Text style={styles.bookingCode}>#{booking.bookingCode}</Text>

          <View style={styles.card}>
            <DetailRow icon="person.fill"     label="Guest"    value={guestName} />
            <DetailRow icon="envelope.fill"   label="Email"    value={booking.user.email} />
            <DetailRow icon="person.2.fill"   label="Guests"   value={`${booking.guests} guest${booking.guests !== 1 ? 's' : ''}`} />
            <DetailRow icon="calendar"        label="Check-in" value={formatDate(booking.startDate)} />
            {booking.endDate && (
              <DetailRow icon="calendar"      label="Check-out" value={formatDate(booking.endDate)} />
            )}
            <DetailRow icon="tag.fill"        label="Type"     value={listingLabel(booking.listingType)} />
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Total amount</Text>
            <Text style={styles.priceValue}>{booking.currency} {booking.totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {booking.bookingStatus === 'pending' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.cancelBtn, styles.cancelBtnFull]}
            onPress={() => handleAction('cancel')}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel booking</Text>
          </TouchableOpacity>
        </View>
      )}
      {booking.bookingStatus === 'confirmed' && (
        <View style={styles.actionBar}>
          <Button
            label={busy ? '...' : 'Mark as completed'}
            onPress={() => handleAction('complete')}
            disabled={busy}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingTop: 56,
    paddingBottom: S[3],
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: C.borderDefault,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },

  content: { paddingHorizontal: S[5], paddingBottom: 24 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: S[4],
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },

  listingName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bookingCode: { fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular', marginBottom: S[4] },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    paddingVertical: 4,
    marginBottom: S[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EBF3FA',
  },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 10, color: C.textSubtle, fontFamily: 'Manrope_400Regular', letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold', marginTop: 1 },

  priceCard: {
    backgroundColor: C.navy,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Manrope_400Regular' },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Manrope_700Bold' },

  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: S[5],
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
    paddingBottom: 32,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnFull: { flex: 1 },
  cancelText: { color: C.error, fontSize: 14, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
