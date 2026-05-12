import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { useSearch } from '@/hooks/useSearch';
import { SearchResult } from '@/types/api';

const TYPE_FILTERS = [
  { label: 'All',      value: undefined   },
  { label: 'Tours',    value: 'tour'      },
  { label: 'Stays',    value: 'stay'      },
  { label: 'Vehicles', value: 'vehicle'   },
];

const CATEGORY_CHIPS = ['Peaks', 'Forest', 'Historical', 'Island', 'Desert', 'Coastal'];

// Debounce hook
function useDebounce(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ResultRow({
  item,
  onPress,
}: {
  item: SearchResult;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.resultRow}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <View style={styles.resultThumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbImg} contentFit="cover" />
        ) : (
          <View style={[styles.thumbImg, { backgroundColor: C.blueLight }]} />
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.resultMeta}>
          {item.location && (
            <>
              <IconSymbol name="location.fill" size={10} color={C.textSubtle} />
              <Text style={styles.resultLocation}>{item.location}</Text>
            </>
          )}
          {item.price != null && (
            <Text style={styles.resultPrice}>
              ${item.price} {item.currency ?? ''}
            </Text>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={16} color={C.textSubtle} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query);

  const { data, isLoading, isFetching } = useSearch(debouncedQuery, typeFilter);
  const results = data?.data ?? [];

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  function navigate(item: SearchResult) {
    const base =
      item.type === 'destination' ? 'destination'
      : item.type === 'tour'      ? 'tour'
      : item.type === 'stay'      ? 'stay'
      : 'vehicle';
    router.push(`/${base}/${item.slug}` as any);
  }

  function toggleCategory(cat: string) {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <IconSymbol name="magnifyingglass" size={16} color={C.textSubtle} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search destinations, tours..."
            placeholderTextColor={C.textSubtle}
            style={styles.input}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark" size={14} color={C.textSubtle} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setFilterOpen(true)}
          style={styles.filterBtn}
          accessibilityLabel="Filters"
          accessibilityRole="button"
        >
          <IconSymbol name="slider.horizontal.3" size={16} color={C.textAccent} />
        </TouchableOpacity>
      </View>

      {/* Type filter pills */}
      <View style={styles.typeRow}>
        {TYPE_FILTERS.map((f) => (
          <FilterPill
            key={f.label}
            label={f.label}
            active={typeFilter === f.value}
            onPress={() => setTypeFilter(f.value)}
          />
        ))}
      </View>

      {/* Results */}
      {isLoading && debouncedQuery.length > 1 ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : debouncedQuery.length <= 1 ? (
        // Empty state — show category chips
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Where to in Mongolia?</Text>
          <Text style={styles.emptyMuted}>Explore by terrain type</Text>
          <View style={styles.categoryWrap}>
            {CATEGORY_CHIPS.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={activeCategories.includes(cat)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </View>
        </View>
      ) : results.length === 0 && !isFetching ? (
        <View style={styles.center}>
          <Text style={styles.noResults}>No results for "{debouncedQuery}"</Text>
          <Text style={styles.noResultsSub}>Try a different search term</Text>
        </View>
      ) : (
        <>
          {isFetching && (
            <View style={styles.fetchingBar}>
              <SkeletonRow />
            </View>
          )}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ResultRow item={item} onPress={() => navigate(item)} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              data?.total && data.total > results.length ? (
                <Text style={styles.moreText}>
                  Showing {results.length} of {data.total} results
                </Text>
              ) : null
            }
          />
        </>
      )}

      {/* Filter bottom sheet */}
      <BottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)}>
        <Text style={styles.sheetTitle}>Filter results</Text>

        <Text style={styles.sheetLabel}>TYPE</Text>
        <View style={styles.sheetPills}>
          {TYPE_FILTERS.filter((f) => f.value).map((f) => (
            <FilterPill
              key={f.label}
              label={f.label}
              active={typeFilter === f.value}
              onPress={() => setTypeFilter(typeFilter === f.value ? undefined : f.value)}
            />
          ))}
        </View>

        <Text style={[styles.sheetLabel, { marginTop: S[4] }]}>TERRAIN</Text>
        <View style={styles.sheetPills}>
          {CATEGORY_CHIPS.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              active={activeCategories.includes(cat)}
              onPress={() => toggleCategory(cat)}
            />
          ))}
        </View>

        <Button
          label="Apply filters"
          onPress={() => setFilterOpen(false)}
          fullWidth
          style={{ marginTop: S[6] }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: C.bgPage,
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
  inputWrap: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    fontFamily: 'Manrope_400Regular',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Type filters
  typeRow: {
    flexDirection: 'row',
    gap: S[2],
    paddingHorizontal: S[5],
    paddingBottom: S[3],
  },

  // Results
  list: { paddingHorizontal: S[5], paddingBottom: 32 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EBF3FA',
    gap: 12,
  },
  resultThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  resultLocation: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
  },
  resultPrice: {
    fontSize: 12,
    color: C.blue,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
    marginLeft: 6,
  },

  // States
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noResults: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  noResultsSub: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular' },
  fetchingBar: { paddingVertical: 4 },
  skeletonList: { flex: 1, paddingTop: 8 },
  moreText: {
    fontSize: 12,
    color: C.textSubtle,
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: 'Manrope_400Regular',
  },

  // Empty
  empty: { flex: 1, paddingHorizontal: S[5], paddingTop: S[6] },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 4,
  },
  emptyMuted: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginBottom: S[4],
  },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Filter sheet
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
    marginBottom: S[4],
  },
  sheetLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.7,
    marginBottom: S[2],
  },
  sheetPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
