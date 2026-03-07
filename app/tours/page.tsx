'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { TravelSearchBar } from '@/components/search/TravelSearchBar'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { TourGrid } from '@/components/tours/TourGrid'
import { useSearch } from '@/lib/search/useSearch'
import type { SearchQuery } from '@/lib/search/types'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { label: string; value: SearchQuery['sortBy'] }[] = [
  { label: 'Most popular', value: 'popular' },
  { label: 'Top rated', value: 'top_rated' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
]

function ToursContent() {
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const initialQuery = {
    destination: searchParams.get('destination') ?? '',
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? '',
    guests: {
      adults: Number(searchParams.get('adults') ?? 1),
      children: Number(searchParams.get('children') ?? 0),
    },
    region: searchParams.get('region') ?? '',
    experienceType: searchParams.get('type') ?? '',
  }

  const { query, results, loading, total, updateQuery, resetFilters } = useSearch(initialQuery)

  const currentSort = SORT_OPTIONS.find(o => o.value === query.sortBy) ?? SORT_OPTIONS[0]

  // Active filter count (for badge)
  const activeFilters = [
    query.priceRange[1] < 2000,
    query.durationFilter !== 'any',
    query.rating > 0,
    query.style !== 'any',
    !!query.region,
    !!query.experienceType,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Top search bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <TravelSearchBar
            variant="compact"
            initialDestination={query.destination}
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
                onUpdate={updateQuery}
                onReset={resetFilters}
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
                  {loading ? 'Searching…' : `${total} tour${total !== 1 ? 's' : ''} found`}
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
                          onClick={() => { updateQuery({ sortBy: opt.value }); setSortOpen(false) }}
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

            {/* Active filter chips */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {query.priceRange[1] < 2000 && (
                  <FilterChip label={`Under $${query.priceRange[1]}`} onRemove={() => updateQuery({ priceRange: [0, 2000] })} />
                )}
                {query.durationFilter !== 'any' && (
                  <FilterChip label={DURATIONS_MAP[query.durationFilter] ?? query.durationFilter} onRemove={() => updateQuery({ durationFilter: 'any' })} />
                )}
                {query.rating > 0 && (
                  <FilterChip label={`${query.rating}+ stars`} onRemove={() => updateQuery({ rating: 0 })} />
                )}
                {query.style !== 'any' && (
                  <FilterChip label={query.style} onRemove={() => updateQuery({ style: 'any' })} />
                )}
                {query.region && (
                  <FilterChip label={REGIONS_MAP[query.region] ?? query.region} onRemove={() => updateQuery({ region: '' })} />
                )}
                {query.experienceType && (
                  <FilterChip label={EXPERIENCE_MAP[query.experienceType] ?? query.experienceType} onRemove={() => updateQuery({ experienceType: '' })} />
                )}
                <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* Tour grid */}
            <TourGrid tours={results} loading={loading} />
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
              <FilterSidebar query={query} onUpdate={updateQuery} onReset={resetFilters} total={total} />
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

const EXPERIENCE_MAP: Record<string, string> = {
  extreme: 'Extreme Adventure',
  nomadic: 'Nomadic Homestay',
  cultural: 'Cultural Heritage',
  wildlife: 'Wildlife Safari',
  horseback: 'Horseback Riding',
  luxury: 'Luxury Experience',
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
