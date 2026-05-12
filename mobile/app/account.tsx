// Design.md §8.11 — User Profile
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

type AccountData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export default function AccountScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const storeUser = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: account, isLoading } = useQuery<AccountData>({
    queryKey: ['account'],
    queryFn: () => api.get('/account').then((r) => r.data),
  });

  const [name, setName] = useState(account?.name ?? storeUser?.name ?? '');
  const [phone, setPhone] = useState(account?.phone ?? '');

  const update = useMutation({
    mutationFn: (data: Partial<AccountData>) => api.patch('/account', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] });
      Alert.alert('Saved', 'Profile updated.');
    },
    onError: () => Alert.alert('Error', 'Could not save changes.'),
  });

  function handleLogout() {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }

  const displayName = account?.name ?? storeUser?.name ?? 'Traveler';
  const email = account?.email ?? storeUser?.email ?? '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        {/* Profile completion */}
        <View style={styles.completionCard}>
          <Text style={styles.completionLabel}>Travel AI Profile</Text>
          <View style={styles.completionBar}>
            <View style={[styles.completionFill, { width: '65%' }]} />
          </View>
          <Text style={styles.completionPct}>65% complete</Text>
        </View>

        {/* Edit form */}
        <View style={styles.form}>
          <Input
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            containerStyle={styles.field}
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            containerStyle={styles.field}
          />

          <Button
            label={update.isPending ? 'Saving...' : 'Save changes'}
            onPress={() => update.mutate({ name, phone })}
            fullWidth
            disabled={update.isPending}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scroll: { padding: S[5], paddingBottom: 48 },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[3],
    marginBottom: S[4],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 28, fontWeight: '700', color: C.blue, fontFamily: 'Manrope_700Bold' },
  displayName: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  email: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginTop: 2 },
  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    padding: 16,
    marginBottom: S[4],
  },
  completionLabel: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginBottom: 10 },
  completionBar: {
    height: 6,
    backgroundColor: C.blueLight,
    borderRadius: 3,
    marginBottom: 8,
  },
  completionFill: { height: '100%', backgroundColor: C.blue, borderRadius: 3 },
  completionPct: { fontSize: 11, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  form: { gap: 0 },
  field: { marginBottom: 16 },
  logoutBtn: {
    marginTop: S[6],
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: C.error, fontSize: 14, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
