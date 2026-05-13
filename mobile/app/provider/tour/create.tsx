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
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useCreateTour } from '@/hooks/useProviderTours';

const CURRENCIES = ['USD', 'MNT'] as const;
type Currency = typeof CURRENCIES[number];

export default function TourCreateScreen() {
  const router = useRouter();
  const createTour = useCreateTour();

  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');

  const valid = title.trim().length >= 2 && Number(price) > 0;

  async function handleCreate() {
    if (!valid) return;
    try {
      await createTour.mutateAsync({
        title:            title.trim(),
        shortDescription: shortDesc.trim() || undefined,
        durationDays:     duration ? Number(duration) : undefined,
        baseAmount:       Number(price),
        baseCurrency:     currency,
        status,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to create tour.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>New tour</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input
          label="Tour title *"
          placeholder="e.g. Gobi Desert Expedition"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.field}
        />

        <Input
          label="Short description"
          placeholder="One-line summary shown in listings"
          value={shortDesc}
          onChangeText={setShortDesc}
          containerStyle={styles.field}
        />

        <Input
          label="Duration (days)"
          placeholder="e.g. 5"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          containerStyle={styles.field}
        />

        <View style={styles.priceRow}>
          <Input
            label="Base price *"
            placeholder="0"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            containerStyle={styles.priceInput}
          />
          <View style={styles.currencyWrap}>
            <Text style={styles.fieldLabel}>Currency</Text>
            <View style={styles.currencyPills}>
              {CURRENCIES.map((c) => (
                <FilterPill key={c} label={c} active={currency === c} onPress={() => setCurrency(c)} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statusWrap}>
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.statusPills}>
            <FilterPill label="Save as draft" active={status === 'draft'} onPress={() => setStatus('draft')} />
            <FilterPill label="Publish now"   active={status === 'active'} onPress={() => setStatus('active')} />
          </View>
        </View>

        <Button
          label={createTour.isPending ? 'Creating...' : 'Create tour'}
          onPress={handleCreate}
          disabled={!valid || createTour.isPending}
          fullWidth
          style={styles.cta}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingTop: 56,
    paddingBottom: S[3],
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: C.borderDefault,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  scroll: { paddingHorizontal: S[5], paddingBottom: 40 },
  field: { marginBottom: 16 },

  priceRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  priceInput: { flex: 1 },
  currencyWrap: { flex: 0.8 },
  currencyPills: { flexDirection: 'row', gap: 6, marginTop: 8 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 4,
  },
  statusWrap: { marginBottom: 24 },
  statusPills: { flexDirection: 'row', gap: 8 },
  cta: { marginTop: 8 },
});
