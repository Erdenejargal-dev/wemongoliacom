import { Image } from 'expo-image';
import splashIcon from '@/assets/images/splash-icon.png';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { Booking } from '@/types/api';

type Props = {
  booking: Booking;
  onPress?: () => void;
};

export function TripCard({ booking, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={booking.listingName}
    >
      <View style={styles.imgWrap}>
        <Image
          source={
            booking.listingImage
              ? { uri: booking.listingImage }
              : splashIcon
          }
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.badge}>
          <Badge
            label={booking.status === 'confirmed' ? 'Confirmed' : booking.status}
            variant={booking.status === 'confirmed' ? 'confirmed' : 'inProgress'}
          />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{booking.listingName}</Text>
        <Text style={styles.date}>
          {booking.startDate}
          {booking.endDate ? ` – ${booking.endDate}` : ''}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${booking.totalPrice} {booking.currency}</Text>
          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View itinerary</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function TripCardSkeleton() {
  return (
    <View style={[styles.card, { overflow: 'hidden' }]}>
      <SkeletonCard style={{ height: 160, borderRadius: 0 }} />
      <View style={{ padding: 14, gap: 8 }}>
        <SkeletonText width="70%" />
        <SkeletonText width="45%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
    marginBottom: S[3],
  },
  imgWrap: { height: 160, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,32,48,0.3)' },
  badge: { position: 'absolute', top: 12, left: 12 },
  info: { padding: 14 },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
  },
  viewBtn: {
    backgroundColor: C.blue,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
