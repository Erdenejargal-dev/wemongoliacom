// Design.md §8.9 — Location & Maps
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useDestinations } from '@/hooks/useDestinations';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';

const MAP_TYPES = ['Standard', 'Hybrid'] as const;
type MapType = 'standard' | 'hybrid';

const MONGOLIA_CENTER = {
  latitude: 46.8625,
  longitude: 103.8467,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data } = useDestinations({ limit: 20 });
  const destinations = data?.data ?? [];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  return (
    <View style={styles.screen}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={MONGOLIA_CENTER}
        mapType={mapType}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {destinations.map((dest) => (
          <Marker
            key={dest.id}
            coordinate={{
              // Fallback coords — real data would include lat/lng
              // eslint-disable-next-line react-hooks/purity
              latitude: MONGOLIA_CENTER.latitude + (Math.random() * 4 - 2),
              // eslint-disable-next-line react-hooks/purity
              longitude: MONGOLIA_CENTER.longitude + (Math.random() * 8 - 4),
            }}
            onPress={() => router.push(`/destination/${dest.slug}` as any)}
            accessibilityLabel={dest.name}
          >
            {/* Custom pin — Design.md §7.15 */}
            <View style={styles.pin}>
              <View style={styles.pinInner} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map type toggle — top overlay */}
      <View style={styles.mapToggle}>
        {MAP_TYPES.map((t) => (
          <FilterPill
            key={t}
            label={t}
            active={mapType === t.toLowerCase() as MapType}
            onPress={() => setMapType(t.toLowerCase() as MapType)}
          />
        ))}
      </View>

      {/* My location button */}
      <TouchableOpacity
        style={styles.locBtn}
        onPress={() => {
          if (userLocation) {
            mapRef.current?.animateToRegion({
              ...userLocation,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            });
          } else {
            Alert.alert('Location', 'Enable location access in settings.');
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="My location"
      >
        <IconSymbol name="location.fill" size={18} color={C.blue} />
      </TouchableOpacity>

      {/* Preference card — bottom overlay, Design.md §8.9 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Explore Mongolia</Text>
        <Text style={styles.cardSub}>{destinations.length} destinations on map</Text>
        <TouchableOpacity
          style={styles.cardBtn}
          onPress={() => router.push('/search' as any)}
          accessibilityRole="button"
        >
          <Text style={styles.cardBtnText}>Search destinations</Text>
          <IconSymbol name="magnifyingglass" size={14} color={C.blue} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Pin — Design.md §7.15
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
  },

  // Map type toggle — top
  mapToggle: {
    position: 'absolute',
    top: 60,
    left: S[5],
    flexDirection: 'row',
    gap: S[2],
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 100,
    padding: 4,
  },

  // My location button
  locBtn: {
    position: 'absolute',
    right: S[5],
    top: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },

  // Bottom preference card
  card: {
    position: 'absolute',
    bottom: 100,
    left: S[5],
    right: S[5],
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold', marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginBottom: 14 },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bgPage,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardBtnText: { fontSize: 13, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
