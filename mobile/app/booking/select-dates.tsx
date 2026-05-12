// Design.md §8.6 — Booking Flow: Date Picker
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

const TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Group'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function SelectDatesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    listingId: string;
    listingType: string;
    listingName: string;
  }>();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [travelType, setTravelType] = useState('Solo');

  const cells = buildCalendar(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) { setStartDate(day); setEndDate(null); }
      else setEndDate(day);
    }
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  }

  function isSelected(day: number) {
    return day === startDate || day === endDate;
  }

  function isInRange(day: number) {
    if (!startDate || !endDate) return false;
    return day > startDate && day < endDate;
  }

  const canContinue = startDate != null;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Select dates</Text>
          {params.listingName && (
            <Text style={styles.headerSub} numberOfLines={1}>{params.listingName}</Text>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn} accessibilityRole="button">
            <IconSymbol name="chevron.left" size={18} color={C.textMuted} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn} accessibilityRole="button">
            <IconSymbol name="chevron.right" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.dayRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const selected = isSelected(day);
            const inRange = isInRange(day);
            const todayMark = isToday(day);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => selectDay(day)}
                style={[
                  styles.cell,
                  selected && styles.cellSelected,
                  inRange && styles.cellRange,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${day} ${MONTHS[viewMonth]}`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.cellText,
                    selected && styles.cellTextSelected,
                    inRange && styles.cellTextRange,
                  ]}
                >
                  {day}
                </Text>
                {todayMark && !selected && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Travel type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel type</Text>
          <View style={styles.travelRow}>
            {TRAVEL_TYPES.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={travelType === t}
                onPress={() => setTravelType(t)}
              />
            ))}
          </View>
        </View>

        {/* Summary */}
        {startDate && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {endDate
                ? `${MONTHS[viewMonth]} ${startDate} – ${endDate}`
                : `From ${MONTHS[viewMonth]} ${startDate}`}
              {' · '}{travelType}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          label="Continue"
          onPress={() =>
            router.push({
              pathname: '/booking/travelers',
              params: {
                ...params,
                startDate: startDate ? `${viewYear}-${viewMonth + 1}-${startDate}` : '',
                endDate: endDate ? `${viewYear}-${viewMonth + 1}-${endDate}` : '',
                travelType,
              },
            } as any)
          }
          fullWidth
          disabled={!canContinue}
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
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  headerSub: { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular', marginTop: 2 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[5],
    paddingVertical: S[3],
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },

  dayRow: {
    flexDirection: 'row',
    paddingHorizontal: S[5],
    marginBottom: S[2],
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: S[5],
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellSelected: {
    backgroundColor: C.navy,
    borderRadius: 100,
  },
  cellRange: {
    backgroundColor: C.blueLight,
    borderRadius: 0,
  },
  cellText: {
    fontSize: 14,
    color: C.textPrimary,
    fontFamily: 'Manrope_400Regular',
  },
  cellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  cellTextRange: {
    color: C.blueDark,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.blue,
  },

  section: { paddingHorizontal: S[5], marginTop: S[4] },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: S[3],
  },
  travelRow: { flexDirection: 'row', gap: S[2], flexWrap: 'wrap' },

  summary: {
    margin: S[5],
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
  },
  summaryText: {
    fontSize: 13,
    color: C.textPrimary,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },

  ctaBar: {
    padding: S[5],
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
  },
});
