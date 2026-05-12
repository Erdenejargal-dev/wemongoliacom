// Design.md §8.10 — Payment Screen
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';

const METHODS = [
  { id: 'card',     label: 'Credit / Debit Card', icon: 'creditcard.fill' },
  { id: 'paypal',   label: 'PayPal',               icon: 'globe'           },
  { id: 'bank',     label: 'Bank Transfer',         icon: 'building.2.fill' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [selected, setSelected] = useState('card');
  const [processing, setProcessing] = useState(false);

  const total = params.total ?? '0';

  async function handlePay() {
    setProcessing(true);
    try {
      const { data } = await api.post('/payments/initiate', {
        listingId: params.listingId,
        listingType: params.listingType,
        method: selected,
        amount: Number(total),
        currency: 'USD',
        startDate: params.startDate,
        endDate: params.endDate,
        adults: Number(params.adults ?? 1),
        children: Number(params.children ?? 0),
        infants: Number(params.infants ?? 0),
      });

      Alert.alert(
        'Booking confirmed!',
        'Check My Trips for your booking details.',
        [{ text: 'View trips', onPress: () => router.replace('/(tabs)/trips') }]
      );
    } catch (err: any) {
      Alert.alert(
        'Payment failed',
        err.response?.data?.message ?? 'Please try again or use a different method.'
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Card mockup — Design.md §8.10 */}
        <View style={styles.cardMockup}>
          <Text style={styles.cardLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.cardAmount}>${total} USD</Text>
          <View style={styles.cardDots}>
            <Text style={styles.cardDotsText}>•••• •••• •••• 4242</Text>
          </View>
        </View>

        {/* Payment method list */}
        <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
        <View style={styles.methodList}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelected(m.id)}
              style={[styles.methodRow, selected === m.id && styles.methodRowActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === m.id }}
              accessibilityLabel={m.label}
            >
              <View style={[styles.methodIcon, { backgroundColor: selected === m.id ? C.blueLight : C.bgPage }]}>
                <IconSymbol name={m.icon as any} size={18} color={selected === m.id ? C.blue : C.textMuted} />
              </View>
              <Text style={[styles.methodLabel, selected === m.id && styles.methodLabelActive]}>
                {m.label}
              </Text>
              <View style={[styles.radio, selected === m.id && styles.radioActive]}>
                {selected === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Secure badge */}
        <View style={styles.secureBadge}>
          <IconSymbol name="checkmark" size={12} color={C.success} />
          <Text style={styles.secureText}>Secured by 256-bit SSL encryption</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          label={processing ? 'Processing...' : `Pay $${total}`}
          onPress={handlePay}
          fullWidth
          disabled={processing}
        />
      </View>
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
  title: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  scroll: { padding: S[5], gap: S[4] },

  // Card mockup
  cardMockup: {
    backgroundColor: C.navy,
    borderRadius: 20,
    padding: 24,
    height: 140,
    justifyContent: 'space-between',
    marginBottom: S[4],
  },
  cardLabel: {
    fontSize: 10,
    color: C.textAccent,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
  },
  cardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
  },
  cardDots: { alignSelf: 'flex-end' },
  cardDotsText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
    marginBottom: S[2],
  },
  methodList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
    minHeight: 64,
  },
  methodRowActive: { backgroundColor: '#FAFCFF' },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    flex: 1,
    fontSize: 14,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },
  methodLabelActive: {
    color: C.textPrimary,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: C.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.blue },

  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  secureText: { fontSize: 11, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },

  ctaBar: {
    padding: S[5],
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
  },
});
