import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useVehicle } from '@/hooks/useVehicles';

export default function VehicleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: vehicle, isLoading, isError } = useVehicle(slug);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color={C.blue} size="large" /></View>;
  }

  if (isError || !vehicle) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errText}>Could not load vehicle.</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.backLink}>← Go back</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={vehicle.image ? { uri: vehicle.image } : require('@/assets/images/splash-icon.png')}
            style={styles.heroImg}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
            <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{vehicle.name}</Text>

          {/* Specs row */}
          <View style={styles.specsRow}>
            <View style={styles.spec}>
              <IconSymbol name="person.fill" size={16} color={C.blue} />
              <Text style={styles.specNum}>{vehicle.seats}</Text>
              <Text style={styles.specLabel}>SEATS</Text>
            </View>
            {vehicle.transmission && (
              <View style={styles.spec}>
                <IconSymbol name="car.fill" size={16} color={C.blue} />
                <Text style={styles.specNum}>{vehicle.transmission}</Text>
                <Text style={styles.specLabel}>GEARBOX</Text>
              </View>
            )}
            {vehicle.fuelType && (
              <View style={styles.spec}>
                <Text style={styles.specNum}>{vehicle.fuelType}</Text>
                <Text style={styles.specLabel}>FUEL</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${vehicle.pricePerDay} {vehicle.currency}</Text>
            <Text style={styles.perDay}>/ day</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Per day</Text>
          <Text style={styles.ctaPrice}>${vehicle.pricePerDay} {vehicle.currency}</Text>
        </View>
        <Button
          label="Rent vehicle"
          onPress={() =>
            router.push({ pathname: '/booking/select-dates', params: { listingId: vehicle.id, listingType: 'vehicle', listingName: vehicle.name } } as any)
          }
          style={{ minWidth: 130 }}
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
  hero: { height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,32,48,0.25)' },
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
  specsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    marginBottom: S[4],
    overflow: 'hidden',
  },
  spec: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
    borderRightWidth: 0.5,
    borderRightColor: '#D5E8F5',
  },
  specNum: { fontSize: 14, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  specLabel: { fontSize: 9, color: C.textSubtle, fontFamily: 'Manrope_400Regular', letterSpacing: 0.7 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 24, fontWeight: '700', color: C.blue, fontFamily: 'Manrope_700Bold' },
  perDay: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
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
});
