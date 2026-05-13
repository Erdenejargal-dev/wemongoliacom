import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useProviderAnalytics } from '@/hooks/useProvider';
import { useProviderReviews, useReplyToReview, ProviderReview } from '@/hooks/useProviderReviews';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ color: i < rating ? '#F59E0B' : '#D5E8F5', fontSize: 12 }}>★</Text>
      ))}
    </View>
  );
}

function ReviewCard({ review, onReply }: { review: ProviderReview; onReply: () => void }) {
  const name = `${review.reviewer.firstName} ${review.reviewer.lastName}`;
  const date = new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.reviewer.firstName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.reviewerName}>{name}</Text>
          <Text style={styles.reviewDate}>{date} · {review.listingType}</Text>
        </View>
        <Stars rating={review.rating} />
      </View>

      {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}

      {review.providerReply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Your reply</Text>
          <Text style={styles.replyText}>{review.providerReply}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.replyBtn} onPress={onReply} accessibilityRole="button">
          <Text style={styles.replyBtnText}>Reply to review</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ProviderReviewsScreen() {
  const { data, isLoading, refetch } = useProviderReviews();
  const { data: analytics } = useProviderAnalytics();
  const replyMutation = useReplyToReview();
  const reviews = data?.data ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const [replySheet, setReplySheet] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProviderReview | null>(null);
  const [replyText, setReplyText] = useState('');

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function openReply(review: ProviderReview) {
    setSelectedReview(review);
    setReplyText('');
    setReplySheet(true);
  }

  async function submitReply() {
    if (!selectedReview || !replyText.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: selectedReview.id, reply: replyText.trim() });
      setReplySheet(false);
    } catch {
      Alert.alert('Error', 'Failed to submit reply.');
    }
  }

  const avgRating = analytics?.reviews.avgRating;
  const totalReviews = analytics?.reviews.total ?? reviews.length;
  const avgDisplay = avgRating ? avgRating.toFixed(1) : '—';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Reviews</Text>
        <View style={styles.avgBadge}>
          <Text style={styles.avgText}>★ {avgDisplay}</Text>
          <Text style={styles.avgCount}> ({totalReviews})</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyMuted}>Reviews appear after guests complete their bookings</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <ReviewCard review={item} onReply={() => openReply(item)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
        />
      )}

      <BottomSheet visible={replySheet} onClose={() => setReplySheet(false)}>
        <Text style={styles.sheetTitle}>Reply to review</Text>
        <Input
          label="Your reply"
          placeholder="Thank the guest and address any feedback..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
          style={{ height: undefined, minHeight: 100 }}
          containerStyle={{ marginBottom: S[4] }}
        />
        <Button
          label={replyMutation.isPending ? 'Submitting...' : 'Submit reply'}
          onPress={submitReply}
          disabled={!replyText.trim() || replyMutation.isPending}
          fullWidth
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingTop: 60,
    paddingBottom: S[3],
  },
  heading: { fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  avgBadge: { flexDirection: 'row', alignItems: 'baseline' },
  avgText: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  avgCount: { fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },

  list: { paddingHorizontal: S[5], paddingBottom: 32 },
  skeletons: { flex: 1 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#D5E8F5',
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: S[3] },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', fontFamily: 'Manrope_700Bold' },
  cardMeta: { flex: 1 },
  reviewerName: { fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  reviewDate: { fontSize: 11, color: C.textSubtle, fontFamily: 'Manrope_400Regular', marginTop: 1 },
  stars: { flexDirection: 'row', gap: 1 },

  reviewTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold', marginBottom: 4 },
  reviewComment: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', lineHeight: 19, marginBottom: 10 },

  replyBox: {
    backgroundColor: '#EFF7FD',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  replyLabel: { fontSize: 9, color: C.blue, fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.5, marginBottom: 3 },
  replyText: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', lineHeight: 18 },

  replyBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: C.blue,
  },
  replyBtnText: { fontSize: 11, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', textAlign: 'center', paddingHorizontal: 40 },

  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold', marginBottom: S[4] },
});
