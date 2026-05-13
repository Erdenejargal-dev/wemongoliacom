import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { C } from '@/constants/Colors';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [mode, setMode] = useState<'traveler' | 'provider'>('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      Alert.alert(
        'Sign in failed',
        err.response?.data?.error ?? 'Check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={styles.brand}>
          <Text style={styles.brandName}>WeMongolia</Text>
          <Text style={styles.brandTagline}>Discover Mongolia's wonders</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeWrap}>
          {(['traveler', 'provider'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeTab, mode === m && styles.modeTabActive]}
              onPress={() => setMode(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === m }}
            >
              <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
                {m === 'traveler' ? 'Traveler' : 'Provider'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            containerStyle={styles.field}
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotRow}
            accessibilityRole="link"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            label={loading ? 'Signing in...' : 'Sign in'}
            onPress={handleLogin}
            fullWidth
            disabled={loading}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Register link */}
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerRow}
          accessibilityRole="link"
        >
          <Text style={styles.registerText}>
            No account?{' '}
            <Text style={styles.registerLink}>Create one</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPage },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  brand: { marginBottom: 48 },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
    fontFamily: 'Manrope_400Regular',
  },
  modeWrap: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FC',
    borderRadius: 12,
    padding: 3,
    marginBottom: 28,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSubtle,
    fontFamily: 'Manrope_600SemiBold',
  },
  modeTextActive: { color: C.textPrimary },
  form: {},
  field: { marginBottom: 16 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: {
    fontSize: 12,
    color: C.blue,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  line: { flex: 1, height: 0.5, backgroundColor: C.borderDefault },
  or: { fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },
  registerRow: { alignItems: 'center' },
  registerText: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },
  registerLink: {
    color: C.blue,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
