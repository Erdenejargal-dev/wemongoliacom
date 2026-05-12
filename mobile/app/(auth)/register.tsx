import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { C } from '@/constants/Colors';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) return;
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      Alert.alert('Registration failed', err.response?.data?.error ?? 'Please try again.');
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

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Join WeMongolia to book tours, stays & vehicles</Text>

        <Input
          label="First name"
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
          containerStyle={styles.field}
        />
        <Input
          label="Last name"
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoComplete="family-name"
          containerStyle={styles.field}
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={styles.field}
        />
        <Input
          label="Password"
          placeholder="Min 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          containerStyle={styles.field}
        />

        <Button
          label={loading ? 'Creating account...' : 'Create account'}
          onPress={handleRegister}
          fullWidth
          disabled={loading}
          style={{ marginTop: 8 }}
        />

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginRow}
          accessibilityRole="link"
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>Sign in</Text>
          </Text>
        </Pressable>
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
  sub: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 32,
    fontFamily: 'Manrope_400Regular',
  },
  field: { marginBottom: 16 },
  loginRow: { alignItems: 'center', marginTop: 28 },
  loginText: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  loginLink: { color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
});
