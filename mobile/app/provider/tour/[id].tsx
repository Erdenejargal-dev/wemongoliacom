import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useProviderTour, useUpdateTour, useArchiveTour } from '@/hooks/useProviderTours';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'draft',  label: 'Draft',  color: C.warning   },
  { value: 'active', label: 'Active', color: '#10B981'   },
  { value: 'paused', label: 'Paused', color: C.error     },
] as const;

// ─── Shared UI ───────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function FieldRow({
  label, value, onChangeText, placeholder, multiline, keyboardType, last,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any; last?: boolean;
}) {
  return (
    <View style={[styles.fieldRow, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '—'}
        placeholderTextColor={C.textSubtle}
        keyboardType={keyboardType}
        multiline={multiline}
        scrollEnabled={false}
        autoCorrect={false}
      />
    </View>
  );
}

function FieldRowH({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.fieldRowH, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Stepper({ value, onChange, min = 1, max = 365 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnDis]}
        onPress={() => { if (value > min) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(value - 1); } }}
      >
        <Text style={styles.stepperBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperVal}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, value >= max && styles.stepperBtnDis]}
        onPress={() => { if (value < max) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(value + 1); } }}
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.stepperUnit}>{value === 1 ? 'day' : 'days'}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TourEditScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { data: tour, isLoading, isError } = useProviderTour(id);
  const updateTour  = useUpdateTour();
  const archiveTour = useArchiveTour();

  const [title,        setTitle]        = useState('');
  const [shortDesc,    setShortDesc]    = useState('');
  const [description,  setDescription]  = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [baseAmount,   setBaseAmount]   = useState('');
  const [baseCurrency, setBaseCurrency] = useState<'MNT' | 'USD'>('MNT');
  const [status,       setStatus]       = useState<'draft' | 'active' | 'paused'>('draft');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!tour) return;
    setTitle(tour.title ?? '');
    setShortDesc(tour.shortDescription ?? '');
    setDescription((tour as any).description ?? '');
    setDurationDays(tour.durationDays ?? 1);
    setBaseAmount(String(tour.baseAmount ?? tour.basePrice ?? ''));
    setBaseCurrency((tour.baseCurrency as 'MNT' | 'USD') ?? (tour.currency as 'MNT' | 'USD') ?? 'MNT');
    setStatus(tour.status);
  }, [tour]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (isLoading) return <SkeletonDetail />;
  if (isError || !tour) return <ErrorState title="Tour not found" onRetry={() => router.back()} />;

  const thumb       = tour.images?.[0]?.imageUrl;
  const statusOpt   = STATUS_OPTIONS.find((o) => o.value === status);
  const statusColor = statusOpt?.color ?? C.textSubtle;

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Required', 'Tour title cannot be empty.'); return; }
    const amount = parseFloat(baseAmount);
    if (isNaN(amount) || amount <= 0) { Alert.alert('Required', 'Enter a valid base price.'); return; }
    try {
      await updateTour.mutateAsync({
        id,
        data: {
          title:            title.trim(),
          shortDescription: shortDesc.trim() || undefined,
          description:      description.trim() || undefined,
          durationDays,
          baseAmount:       amount,
          baseCurrency,
          status,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save.');
    }
  }

  function handleArchive() {
    Alert.alert('Archive tour', `Archive "${tour.title}"? It will be hidden from travelers.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive', style: 'destructive',
        onPress: async () => {
          try { await archiveTour.mutateAsync(id); router.back(); }
          catch { Alert.alert('Error', 'Failed to archive.'); }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Hero */}
      <View style={styles.hero}>
        {thumb
          ? <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} contentFit="cover" />
          : <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]} />
        }
        <View style={styles.heroScrim} />

        <View style={styles.heroControls}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={handleArchive}>
            <IconSymbol name="trash" size={16} color={C.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroMeta}>
          <View style={[styles.statusChip, { backgroundColor: statusColor + '28' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusChipText, { color: statusColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{tour.title}</Text>
          {tour.durationDays ? (
            <Text style={styles.heroDuration}>{tour.durationDays} day{tour.durationDays !== 1 ? 's' : ''}</Text>
          ) : null}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tour details */}
        <SectionHeader title="Tour Details" />
        <Card>
          <FieldRow label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Gobi Desert Expedition" />
          <FieldRow label="Short description" value={shortDesc} onChangeText={setShortDesc} placeholder="One-line summary shown in listings" />
          <FieldRow label="Full description" value={description} onChangeText={setDescription} placeholder="Tell travelers what this tour includes, highlights, what to expect…" multiline last />
        </Card>

        {/* Duration */}
        <View style={styles.sectionWrap}>
          <SectionHeader title="Duration" />
          <Card>
            <FieldRowH label="Trip length" last>
              <Stepper value={durationDays} onChange={setDurationDays} min={1} max={365} />
            </FieldRowH>
          </Card>
        </View>

        {/* Pricing */}
        <View style={styles.sectionWrap}>
          <SectionHeader title="Pricing" />
          <Card>
            <FieldRowH label="Currency" last={false}>
              <View style={styles.currencyRow}>
                {(['MNT', 'USD'] as const).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.currencyPill, baseCurrency === c && styles.currencyPillActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBaseCurrency(c); }}
                  >
                    <Text style={[styles.currencyPillText, baseCurrency === c && styles.currencyPillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FieldRowH>
            <FieldRow label="Price per person" value={baseAmount} onChangeText={setBaseAmount} placeholder="0" keyboardType="numeric" last />
          </Card>
        </View>

        {/* Status */}
        <View style={styles.sectionWrap}>
          <SectionHeader title="Listing Status" />
          <Card>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.statusOption, active && { backgroundColor: opt.color + '18', borderColor: opt.color }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStatus(opt.value); }}
                  >
                    <View style={[styles.statusOptionDot, { backgroundColor: active ? opt.color : C.textSubtle }]} />
                    <Text style={[styles.statusOptionText, active && { color: opt.color, fontFamily: 'Manrope_600SemiBold' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        {/* CTA */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, updateTour.isPending && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={updateTour.isPending}
          >
            <Text style={styles.saveBtnText}>{updateTour.isPending ? 'Saving…' : 'Save changes'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
            <Text style={styles.archiveBtnText}>Archive tour</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  // ── Hero ──
  hero:            { height: 220, position: 'relative', backgroundColor: '#C8E8F6' },
  heroPlaceholder: { backgroundColor: '#C8E8F6' },
  heroScrim: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  heroControls: {
    position: 'absolute', top: 52, left: S[5], right: S[5],
    flexDirection: 'row', justifyContent: 'space-between',
  },
  heroBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  heroMeta: { position: 'absolute', bottom: 16, left: S[5], right: S[5], gap: 5 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot:      { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontFamily: 'Manrope_600SemiBold' },
  heroTitle: {
    fontSize: 21, fontWeight: '700', color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold', letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  heroDuration: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Manrope_400Regular',
  },

  // ── Sheet ──
  sheet:        { flex: 1 },
  sheetContent: { paddingHorizontal: S[5], paddingTop: S[4], paddingBottom: 48 },

  sectionWrap: { marginTop: S[4] },
  sectionHeader: {
    fontSize: 11, fontWeight: '600', color: C.textSubtle,
    fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 0.5, borderColor: '#D5E8F5', overflow: 'hidden',
    shadowColor: '#4A90C4', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  fieldRow:       { paddingHorizontal: 16, paddingVertical: 12 },
  fieldRowH: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  fieldRowBorder: { borderBottomWidth: 0.5, borderBottomColor: '#EBF3FA' },
  fieldLabel: {
    fontSize: 11, color: C.textSubtle,
    fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.3, marginBottom: 4,
  },
  fieldInput:      { fontSize: 15, color: C.textPrimary, fontFamily: 'Manrope_400Regular', padding: 0, minHeight: 22 },
  fieldInputMulti: { minHeight: 88, lineHeight: 22 },

  // ── Stepper ──
  stepperRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EBF3FA', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#D5E8F5',
  },
  stepperBtnDis:  { opacity: 0.35 },
  stepperBtnText: { fontSize: 18, color: C.navy, lineHeight: 22 },
  stepperVal:     { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: C.textPrimary, minWidth: 28, textAlign: 'center' },
  stepperUnit:    { fontSize: 13, fontFamily: 'Manrope_400Regular', color: C.textMuted },

  // ── Currency ──
  currencyRow:           { flexDirection: 'row', gap: 8 },
  currencyPill:          { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F4FAFF' },
  currencyPillActive:    { backgroundColor: C.navy, borderColor: C.navy },
  currencyPillText:      { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: C.textMuted },
  currencyPillTextActive:{ color: '#FFFFFF' },

  // ── Status ──
  statusRow: { flexDirection: 'row', padding: 10, gap: 8 },
  statusOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F8FCFF',
  },
  statusOptionDot:  { width: 7, height: 7, borderRadius: 4 },
  statusOptionText: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular' },

  // ── Actions ──
  actions: { marginTop: S[5], gap: 12 },
  saveBtn: {
    height: 52, borderRadius: 100, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.navy, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24, shadowRadius: 12, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Manrope_700Bold', letterSpacing: 0.2 },
  archiveBtn: {
    height: 48, borderRadius: 100, borderWidth: 1.5, borderColor: C.error,
    alignItems: 'center', justifyContent: 'center',
  },
  archiveBtnText: { fontSize: 14, fontWeight: '600', color: C.error, fontFamily: 'Manrope_600SemiBold' },
});
