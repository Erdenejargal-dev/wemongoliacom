import { useRouter } from 'expo-router';
import splashIcon from '@/assets/images/splash-icon.png';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';

type WishlistItem = {
  id: string;
  listingId: string;
  listingType: string;
  listingName: string;
  listingImage?: string;
  listingSlug: string;
};

export default function WishlistScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: WishlistItem[] }>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then((r) => r.data),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/wishlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const items = data?.data ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved places</Text>
      </View>

      {isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} style={styles.gridCard} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyMuted}>Tap the heart icon on any listing to save it</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/${item.listingType}/${item.listingSlug}` as any)}
              accessibilityRole="button"
              accessibilityLabel={item.listingName}
            >
              <View style={styles.cardImg}>
                <Image
                  source={item.listingImage ? { uri: item.listingImage } : splashIcon}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => remove.mutate(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.listingName} from saved`}
                  hitSlop={8}
                >
                  <IconSymbol name="heart.fill" size={14} color={C.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{item.listingName}</Text>
                <Text style={styles.cardType}>{item.listingType}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: S[5],
    paddingBottom: S[3],
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: S[5] },
  list: { padding: S[5], paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },
  gridCard: { width: '47%', height: 160 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
  },
  cardImg: { height: 120, position: 'relative' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 12, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  cardType: { fontSize: 10, color: C.textSubtle, fontFamily: 'Manrope_400Regular', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', textAlign: 'center', paddingHorizontal: 40 },
});
