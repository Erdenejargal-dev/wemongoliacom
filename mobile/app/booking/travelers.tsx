import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';

const BUDGET_OPTIONS = ['Budget', 'Standard', 'Luxury'];

function Counter({
  label,
  value,
  onDecrement,
  onIncrement,
  min = 0,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
}) {
  return (
    <View style={cStyles.row}>
      <View>
        <Text style={cStyles.label}>{label}</Text>
      </View>
      <View style={cStyles.controls}>
        <TouchableOpacity
          onPress={onDecrement}
          style={[cStyles.btn, value <= min && cStyles.btnDisabled]}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={cStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={cStyles.count}>{value}</Text>
        <TouchableOpacity
          onPress={onIncrement}
          style={cStyles.btn}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={cStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
    minHeight: 54,
  },
  label: { fontSize: 14, color: C.textPrimary, fontFamily: 'Manrope_400Regular' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 20, color: C.textPrimary, lineHeight: 24 },
  count: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold', minWidth: 24, textAlign: 'center' },
});

export default function TravelersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [budget, setBudget] = useState('Standard');

  const total = adults + children + infants;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Travelers</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Counter
            label="Adults"
            value={adults}
            onDecrement={() => setAdults(Math.max(1, adults - 1))}
            onIncrement={() => setAdults(adults + 1)}
            min={1}
          />
          <Counter
            label="Children (2–12)"
            value={children}
            onDecrement={() => setChildren(Math.max(0, children - 1))}
            onIncrement={() => setChildren(children + 1)}
          />
          <Counter
            label="Infants (< 2)"
            value={infants}
            onDecrement={() => setInfants(Math.max(0, infants - 1))}
            onIncrement={() => setInfants(infants + 1)}
          />
        </View>

        {/* Budget selector — Design.md §7.13 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget level</Text>
          <View style={styles.budgetRow}>
            {BUDGET_OPTIONS.map((b) => (
              <FilterPill
                key={b}
                label={b}
                active={budget === b}
                onPress={() => setBudget(b)}
              />
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLine}>
            {total} traveler{total !== 1 ? 's' : ''} · {budget}
          </Text>
          {params.startDate && (
            <Text style={styles.summaryMuted}>
              {params.startDate}{params.endDate ? ` – ${params.endDate}` : ''}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          label="Review booking"
          onPress={() =>
            router.push({
              pathname: '/booking/confirm',
              params: { ...params, adults, children, infants, budget },
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
  scroll: { paddingHorizontal: S[5], paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    paddingHorizontal: S[4],
    marginBottom: S[4],
  },
  section: { marginBottom: S[4] },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: S[3],
  },
  budgetRow: { flexDirection: 'row', gap: S[2] },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    padding: 16,
  },
  summaryLine: { fontSize: 14, fontWeight: '600', color: C.textPrimary, fontFamily: 'Manrope_600SemiBold' },
  summaryMuted: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginTop: 4 },
  ctaBar: {
    padding: S[5],
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
  },
});
