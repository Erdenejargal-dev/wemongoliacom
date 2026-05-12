import { useRouter } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SkeletonText } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type?: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/read/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.data ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skeletonItem}>
              <SkeletonText width="80%" style={{ marginBottom: 8 }} />
              <SkeletonText width="55%" />
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyMuted}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifRow, !item.read && styles.notifRowUnread]}
              onPress={() => !item.read && markRead.mutate(item.id)}
              accessibilityRole="button"
            >
              <View style={[styles.dot, item.read && styles.dotRead]} />
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
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
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  badge: {
    backgroundColor: C.error,
    borderRadius: 100,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', fontFamily: 'Manrope_700Bold' },
  list: { paddingBottom: 32 },
  skeletons: { padding: S[5], gap: S[4] },
  skeletonItem: {},
  notifRow: {
    flexDirection: 'row',
    padding: S[5],
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EBF3FA',
    minHeight: 72,
  },
  notifRowUnread: { backgroundColor: '#FAFCFF' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
    marginTop: 5,
  },
  dotRead: { backgroundColor: C.borderDefault },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold', marginBottom: 3 },
  notifBody: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 10, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
});
