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
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [promo, setPromo] = useState('');

  const adults = Number(params.adults ?? 1);
  const basePrice = 299; // placeholder — real price would come from listing
  const subtotal = basePrice * adults;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Review booking</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Booking summary card */}
        <View style={styles.summaryCard}>
          {params.listingName && (
            <Text style={styles.listingName}>{params.listingName}</Text>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryVal}>{params.listingType}</Text>
          </View>
          {params.startDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dates</Text>
              <Text style={styles.summaryVal}>
                {params.startDate}{params.endDate ? ` – ${params.endDate}` : ''}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Travelers</Text>
            <Text style={styles.summaryVal}>
              {adults} adult{adults !== 1 ? 's' : ''}
              {Number(params.children ?? 0) > 0 ? `, ${params.children} children` : ''}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryVal}>{params.budget ?? 'Standard'}</Text>
          </View>
        </View>

        {/* Promo code */}
        <View style={styles.promoRow}>
          <Input
            placeholder="Promo code"
            value={promo}
            onChangeText={setPromo}
            autoCapitalize="characters"
            containerStyle={{ flex: 1 }}
          />
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => Alert.alert('Promo', 'Code applied!')}
            accessibilityRole="button"
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base ({adults} × $299)</Text>
            <Text style={styles.priceVal}>${subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform fee (5%)</Text>
            <Text style={styles.priceVal}>${platformFee}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>${total} USD</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          label="Proceed to payment"
          onPress={() =>
            router.push({
              pathname: '/booking/payment',
              params: { ...params, total: String(total) },
            } as any)
          }
          fullWidth
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    padding: S[4],
  },
  listingName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    marginBottom: S[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
  },
  summaryLabel: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  summaryVal: { fontSize: 13, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  promoRow: { flexDirection: 'row', gap: S[2], alignItems: 'flex-end' },
  applyBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: C.textAccent, fontSize: 13, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    padding: S[4],
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    marginBottom: S[3],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  priceVal: { fontSize: 13, color: C.textPrimary, fontFamily: 'Manrope_400Regular' },
  totalRow: {
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
    marginTop: S[2],
    paddingTop: S[3],
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  totalVal: { fontSize: 15, fontWeight: '700', color: C.blue, fontFamily: 'Manrope_700Bold' },
  ctaBar: {
    padding: S[5],
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
  },
});
