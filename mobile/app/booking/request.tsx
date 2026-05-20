// Design.md §8.6 — Booking Request (Inquiry / Lead form)
// Allows travelers to contact a provider without full payment.
// Backend: POST /booking-requests (optionalAuth — works logged-in or anonymous)
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

type Params = {
  listingType: 'tour' | 'vehicle' | 'accommodation';
  listingId: string;
  listingName: string;
};

export default function BookingRequestScreen() {
  const router = useRouter();
  const { listingType, listingId, listingName } = useLocalSearchParams<Params>();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [guests, setGuests] = useState('1');

  const submit = useMutation({
    mutationFn: () =>
      api.post('/booking-requests', {
        listingType,
        listingId,
        name: name.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
        ...(guests ? { guests: Number(guests) } : {}),
      }),
    onSuccess: () => {
      Alert.alert(
        'Request sent!',
        'The provider will get back to you shortly.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.error ?? 'Could not send request. Please try again.');
    },
  });

  function handleSubmit() {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email.'); return; }
    submit.mutate();
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Send inquiry</Text>
            <Text style={styles.sub} numberOfLines={1}>{listingName}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle" size={16} color={C.blue} />
          <Text style={styles.infoText}>
            This sends a message to the provider. You won&apos;t be charged until they confirm.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your details</Text>
          <Input
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            containerStyle={styles.field}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.field}
          />
          <Input
            label="Phone (optional)"
            placeholder="+1 555 000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            containerStyle={styles.field}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trip details</Text>
          <Input
            label="Number of guests"
            placeholder="1"
            value={guests}
            onChangeText={(v) => setGuests(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            containerStyle={styles.field}
          />
          <Input
            label="Message to provider"
            placeholder="Tell them about your plans, questions, or special requests…"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            containerStyle={styles.field}
            style={styles.textarea}
          />
        </View>

        <Button
          label={submit.isPending ? 'Sending…' : 'Send inquiry'}
          onPress={handleSubmit}
          fullWidth
          disabled={submit.isPending}
          style={styles.cta}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: S[5],
    paddingBottom: S[4],
    backgroundColor: C.bgPage,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
  },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  sub: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginTop: 2 },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: S[5],
    backgroundColor: C.blueLight,
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: C.navy,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 18,
  },

  section: { paddingHorizontal: S[5], marginBottom: S[4] },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textSubtle,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: S[3],
  },
  field: { marginBottom: S[3] },
  textarea: { height: undefined, minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },

  cta: { marginHorizontal: S[5], marginTop: S[2] },
});
