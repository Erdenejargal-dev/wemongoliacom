'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useMemo, Suspense } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { TravelSearchBar } from '@/components/search/TravelSearchBar'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { TourGrid } from '@/components/tours/TourGrid'
import { useSearchWithUrl } from '@/lib/search/useSearch'
import { queryToSearchParams, searchParamsToQuery } from '@/lib/search/urlSync'
import type { SearchQuery } from '@/lib/search/types'
import { DEFAULT_QUERY } from '@/lib/search/types'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { label: string; value: SearchQuery['sortBy'] }[] = [
  { label: 'Most popular', value: 'popular' },
  { label: 'Top rated', value: 'top_rated' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
]

function ToursContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const queryFromUrl = useMemo(
    () => ({ ...DEFAULT_QUERY, ...searchParamsToQuery(searchParams) }),
    [searchParams],
  )

  const { query, results, loading, loadingMore, total, error, updateQuery, resetFilters, loadMore } = useSearchWithUrl(queryFromUrl)

  const currentSort = SORT_OPTIONS.find(o => o.value === query.sortBy) ?? SORT_OPTIONS[0]

  const FILTER_KEYS = ['destination', 'region', 'priceRange', 'durationFilter', 'rating', 'sortBy', 'guests', 'fromDate', 'toDate']
  const updateQueryAndUrl = (patch: Partial<SearchQuery>) => {
    const filterChanged = FILTER_KEYS.some(k => patch[k as keyof SearchQuery] !== undefined)
    const next = { ...query, ...patch, ...(filterChanged ? { page: 1 } : {}) }
    updateQuery(patch)
    router.replace(`/tours?${queryToSearchParams(next).toString()}`, { scroll: false })
  }

  const handleLoadMore = async () => {
    await loadMore()
    // page not persisted to URL — load-more state is ephemeral
  }

  const resetFiltersAndUrl = () => {
    const next: SearchQuery = {
      ...query,
      priceRange: DEFAULT_QUERY.priceRange,
      durationFilter: DEFAULT_QUERY.durationFilter,
      rating: DEFAULT_QUERY.rating,
      region: DEFAULT_QUERY.region,
      guests: DEFAULT_QUERY.guests,
      fromDate: DEFAULT_QUERY.fromDate,
      toDate: DEFAULT_QUERY.toDate,
      page: 1,
    }
    resetFilters()
    router.replace(`/tours?${queryToSearchParams(next).toString()}`, { scroll: false })
  }

  const guestCount = (query.guests?.adults ?? 1) + (query.guests?.children ?? 0)
  const hasGuestFilter = guestCount > 1

  const hasDateFilter = !!(query.fromDate || query.toDate)

  // Active filter count — only filters that are backend-supported and active
  const activeFilters = [
    query.priceRange[1] < 2000,
    query.durationFilter !== 'any',
    query.rating > 0,
    !!query.region,
    hasGuestFilter,
    hasDateFilter,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Top search bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <TravelSearchBar
            key={query.destination}
            variant="compact"
            initialDestination={query.destination}
            currentFilters={query}
            onSearch={(dest) => {
              const next = { ...query, destination: dest, page: 1 }
              updateQuery({ destination: dest, page: 1 })
              router.replace(`/tours?${queryToSearchParams(next).toString()}`, { scroll: false })
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Filters sidebar (desktop) ─────────── */}
          <div className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
              <FilterSidebar
                query={query}
                onUpdate={updateQueryAndUrl}
                onReset={resetFiltersAndUrl}
                total={total}
              />
            </div>
          </div>

          {/* ── Main content ──────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  {query.destination ? `Tours in ${query.destination}` : 'All Mongolia Tours'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? 'Searching…' : `${total} tour${total !== 1 ? 's' : ''} with scheduled departures`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select a tour to see exact dates and confirm availability
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className={cn(
                    'lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                    activeFilters > 0
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="w-5 h-5 bg-white text-gray-900 rounded-full text-xs font-bold flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {currentSort.label}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-20 w-48 py-1">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value}
                          onClick={() => { updateQueryAndUrl({ sortBy: opt.value }); setSortOpen(false) }}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                            query.sortBy === opt.value
                              ? 'bg-green-50 text-green-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter chips — only backend-supported filters */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {query.priceRange[1] < 2000 && (
                  <FilterChip label={`Under $${query.priceRange[1]}`} onRemove={() => updateQueryAndUrl({ priceRange: [0, 2000] })} />
                )}
                {query.durationFilter !== 'any' && (
                  <FilterChip label={DURATIONS_MAP[query.durationFilter] ?? query.durationFilter} onRemove={() => updateQueryAndUrl({ durationFilter: 'any' })} />
                )}
                {query.rating > 0 && (
                  <FilterChip label={`${query.rating}+ stars`} onRemove={() => updateQueryAndUrl({ rating: 0 })} />
                )}
                {query.region && (
                  <FilterChip label={REGIONS_MAP[query.region] ?? query.region} onRemove={() => updateQueryAndUrl({ region: '' })} />
                )}
                {hasGuestFilter && (
                  <FilterChip label={`${guestCount} guests`} onRemove={() => updateQueryAndUrl({ guests: { adults: 1, children: 0 } })} />
                )}
                {hasDateFilter && (
                  <FilterChip
                    label={[query.fromDate, query.toDate].filter(Boolean).join(' – ')}
                    onRemove={() => updateQueryAndUrl({ fromDate: '', toDate: '' })}
                  />
                )}
                <button onClick={resetFiltersAndUrl} className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* Tour grid */}
            <TourGrid
              tours={results}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              total={total}
              onLoadMore={results.length < total && total > 0 ? handleLoadMore : undefined}
              onClearFilters={activeFilters > 0 ? resetFiltersAndUrl : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────── */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Filters</p>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar query={query} onUpdate={updateQueryAndUrl} onReset={resetFiltersAndUrl} total={total} />
              <button onClick={() => setFilterOpen(false)}
                className="w-full mt-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
                Show {total} tour{total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const DURATIONS_MAP: Record<string, string> = {
  '1': '1 Day',
  '2-3': '2–3 Days',
  '4-7': '4–7 Days',
  '8+': '8+ Days',
}

const REGIONS_MAP: Record<string, string> = {
  gobi: 'Gobi Desert',
  khangai: 'Khangai Mountains',
  khuvsgul: 'Lake Khuvsgul',
  ulaanbaatar: 'Ulaanbaatar',
  altai: 'Altai Mountains',
  steppe: 'Central Steppes',
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-full font-medium capitalize">
      {label}
      <button onClick={onRemove} className="hover:text-gray-300 transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <ToursContent />
    </Suspense>
  )
}
