import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { C } from '@/constants/Colors';
import { api } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bgPage }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Reset password</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Reset link sent to{' '}
              <Text style={styles.successEmail}>{email}</Text>
              {'. Check your inbox.'}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24 }}>
              <Text style={styles.backToLogin}>Back to sign in →</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sub}>
              Enter your email and we&apos;ll send a link to reset your password.
            </Text>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.field}
            />
            <Button
              label={loading ? 'Sending...' : 'Send reset link'}
              onPress={handleSend}
              fullWidth
              disabled={loading}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 32 },
  backText: { fontSize: 13, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 8,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: C.textMuted, marginBottom: 32, fontFamily: 'Manrope_400Regular' },
  field: { marginBottom: 24 },
  successBox: { marginTop: 16 },
  successText: { fontSize: 13, color: C.textMuted, lineHeight: 20, fontFamily: 'Manrope_400Regular' },
  successEmail: { color: C.textPrimary, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  backToLogin: { fontSize: 13, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
