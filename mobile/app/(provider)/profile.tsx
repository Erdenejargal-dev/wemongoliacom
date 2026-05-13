import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonText } from '@/components/ui/Skeleton';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useAuthStore } from '@/stores/auth.store';
import { useProviderProfile, useUpdateProviderProfile } from '@/hooks/useProvider';
import { api } from '@/lib/api';

const VERIFICATION_LABEL: Record<string, { label: string; color: string }> = {
  unverified:     { label: 'Not verified',   color: C.textSubtle },
  pending:        { label: 'Pending review', color: '#F59E0B'    },
  pending_review: { label: 'Pending review', color: '#F59E0B'    },
  verified:       { label: 'Verified',       color: '#10B981'    },
  rejected:       { label: 'Rejected',       color: C.error      },
};

export default function ProviderProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const { data: profile, isLoading, refetch } = useProviderProfile();
  const updateProfile = useUpdateProviderProfile();

  const [name,       setName]       = useState('');
  const [tagline,    setTagline]    = useState('');
  const [phone,      setPhone]      = useState('');
  const [email,      setEmail]      = useState('');
  const [address,    setAddress]    = useState('');
  const [city,       setCity]       = useState('');
  const [website,    setWebsite]    = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setTagline(profile.tagline ?? '');
    setPhone(profile.phone ?? '');
    setEmail(profile.email ?? '');
    setAddress(profile.address ?? '');
    setCity(profile.city ?? '');
    setWebsite(profile.websiteUrl ?? '');
  }, [profile]);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        name:       name.trim() || undefined,
        tagline:    tagline.trim() || undefined,
        phone:      phone.trim() || undefined,
        email:      email.trim() || undefined,
        address:    address.trim() || undefined,
        city:       city.trim() || undefined,
        websiteUrl: website.trim() || undefined,
      });
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save.');
    }
  }

  async function handleSubmitVerification() {
    Alert.alert(
      'Submit for verification',
      'Your business profile will be reviewed by our team. You will be notified by email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              await api.post('/provider/verify/submit');
              await refetch();
              Alert.alert('Submitted', 'Your verification request has been submitted.');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error ?? 'Failed to submit.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  }

  function handleLogout() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => logout() },
      ]
    );
  }

  const status = profile?.verificationStatus ?? '';
  const verif = VERIFICATION_LABEL[status] ?? { label: status || 'Unknown', color: C.textSubtle };
  const canSubmitVerification = status === 'unverified' || status === 'rejected' || status === '';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Business profile</Text>
          {profile && (
            <View style={[styles.verifBadge, { backgroundColor: verif.color + '20' }]}>
              <Text style={[styles.verifText, { color: verif.color }]}>{verif.label}</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={{ gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ gap: 8 }}>
                <SkeletonText width="30%" />
                <SkeletonText width="100%" style={{ height: 44, borderRadius: 12 }} />
              </View>
            ))}
          </View>
        ) : (
          <>
            <Input label="Business name"    value={name}    onChangeText={setName}    containerStyle={styles.field} />
            <Input label="Tagline"          value={tagline} onChangeText={setTagline} containerStyle={styles.field} placeholder="Short description for travelers" />
            <Input label="Phone"            value={phone}   onChangeText={setPhone}   containerStyle={styles.field} keyboardType="phone-pad" />
            <Input label="Contact email"    value={email}   onChangeText={setEmail}   containerStyle={styles.field} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Address"          value={address} onChangeText={setAddress} containerStyle={styles.field} />
            <Input label="City"             value={city}    onChangeText={setCity}    containerStyle={styles.field} />
            <Input label="Website URL"      value={website} onChangeText={setWebsite} containerStyle={styles.field} keyboardType="url" autoCapitalize="none" />

            <Button
              label={updateProfile.isPending ? 'Saving...' : 'Save changes'}
              onPress={handleSave}
              disabled={updateProfile.isPending}
              fullWidth
              style={styles.saveBtn}
            />

            {canSubmitVerification && (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleSubmitVerification}
                disabled={submitting}
                accessibilityRole="button"
              >
                <Text style={styles.verifyText}>
                  {submitting ? 'Submitting...' : 'Submit for verification'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  scroll: { paddingHorizontal: S[5], paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: S[4],
  },
  heading: { fontSize: 22, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  verifBadge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  verifText: { fontSize: 11, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  field: { marginBottom: 14 },
  saveBtn: { marginTop: 8, marginBottom: 12 },
  verifyBtn: {
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyText: { color: C.blue, fontSize: 14, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  logoutBtn: {
    height: 48,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: C.error, fontSize: 14, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
