'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_QUERY, type SearchQuery, type Tour } from './types'
import { searchTours } from './searchService'
import { usePreferences } from '@/components/providers/PreferencesProvider'

/** Sync query from URL when it changes (e.g. back/forward, external nav). */
function useUrlSync(
  queryFromUrl: Partial<SearchQuery>,
  setQuery: (q: SearchQuery | ((prev: SearchQuery) => SearchQuery)) => void,
) {
  const prevRef = useRef<string>('')
  useEffect(() => {
    const key = JSON.stringify({
      destination: queryFromUrl.destination,
      region: queryFromUrl.region,
      priceRange: queryFromUrl.priceRange,
      rating: queryFromUrl.rating,
      durationFilter: queryFromUrl.durationFilter,
      sortBy: queryFromUrl.sortBy,
      guests: queryFromUrl.guests,
      fromDate: queryFromUrl.fromDate,
      toDate: queryFromUrl.toDate,
    })
    if (key !== prevRef.current) {
      prevRef.current = key
      setQuery(prev => ({ ...DEFAULT_QUERY, ...prev, ...queryFromUrl, page: 1 }))
    }
  }, [queryFromUrl, setQuery])
}

export function useSearch(initialQuery?: Partial<SearchQuery>) {
  const [query, setQuery] = useState<SearchQuery>({ ...DEFAULT_QUERY, ...initialQuery })
  const [results, setResults] = useState<Tour[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Phase 6.2 — refetch when the user's display currency changes so the
  // /tours list actually reflects MNT↔USD switches immediately. Listing
  // cards display using `pricing` DTO + displayCurrency, but refetching
  // also lets the backend vary future `X-Display-Currency`-aware fields.
  const { currency: displayCurrency } = usePreferences()

  const runSearch = useCallback(async (q: SearchQuery) => {
    setLoading(true)
    setError(null)
    try {
      const { tours, total: totalCount } = await searchTours(q)
      setResults(tours)
      setTotal(totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tours')
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { runSearch(query) }, [query, runSearch, displayCurrency])

  const updateQuery = useCallback((patch: Partial<SearchQuery>) => {
    setQuery(prev => {
      const next = { ...prev, ...patch }
      // Reset to page 1 when filters change (not when only page changes)
      const filterKeys = ['destination', 'region', 'priceRange', 'durationFilter', 'rating', 'sortBy', 'guests', 'fromDate', 'toDate']
      const filterChanged = filterKeys.some(k => patch[k as keyof SearchQuery] !== undefined)
      if (filterChanged && !('page' in patch)) {
        next.page = 1
      }
      return next
    })
  }, [])

  const loadMore = useCallback(async () => {
    const nextPage = query.page + 1
    setLoadingMore(true)
    setError(null)
    try {
      const { tours: moreTours } = await searchTours({ ...query, page: nextPage })
      setResults(prev => [...prev, ...moreTours])
      setQuery(prev => ({ ...prev, page: nextPage }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more tours')
    } finally {
      setLoadingMore(false)
    }
  }, [query])

  const resetFilters = useCallback(() => {
    setQuery(prev => ({
      ...prev,
      priceRange: DEFAULT_QUERY.priceRange,
      durationFilter: DEFAULT_QUERY.durationFilter,
      rating: DEFAULT_QUERY.rating,
      region: DEFAULT_QUERY.region,
      guests: DEFAULT_QUERY.guests,
      fromDate: DEFAULT_QUERY.fromDate,
      toDate: DEFAULT_QUERY.toDate,
    }))
  }, [])

  return { query, results, loading, loadingMore, total, error, updateQuery, resetFilters, setQuery, loadMore }
}

/** useSearch with URL sync - pass queryFromUrl every render to sync from URL */
export function useSearchWithUrl(queryFromUrl: Partial<SearchQuery>) {
  const { setQuery, ...rest } = useSearch(queryFromUrl)
  useUrlSync(queryFromUrl, setQuery)
  return rest
}
