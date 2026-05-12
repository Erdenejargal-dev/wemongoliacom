import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { C } from '@/constants/Colors';
import { useAuthStore } from '@/stores/auth.store';

const ITEMS = [
  { label: 'Profile & Settings', route: '/account' },
  { label: 'Notifications',      route: '/notifications' },
  { label: 'Saved Places',       route: '/wishlist' },
];

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}` : 'Traveler'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.row}
          onPress={() => router.push(item.route as any)}
          accessibilityRole="button"
        >
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.row, styles.logoutRow]}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blueLight,
  },
  name: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  email: { fontSize: 12, color: C.textMuted, marginTop: 2, fontFamily: 'Manrope_400Regular' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
    minHeight: 44,
  },
  rowLabel: { fontSize: 14, color: C.textPrimary, fontFamily: 'Manrope_400Regular' },
  chevron: { fontSize: 18, color: C.textSubtle },
  logoutRow: { borderBottomWidth: 0, marginTop: 24 },
  logoutText: { fontSize: 14, color: C.error, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
