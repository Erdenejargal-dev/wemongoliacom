'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_QUERY, type SearchQuery, type Tour } from './types'
import { searchTours } from './searchService'

export function useSearch(initialQuery?: Partial<SearchQuery>) {
  const [query, setQuery] = useState<SearchQuery>({ ...DEFAULT_QUERY, ...initialQuery })
  const [results, setResults] = useState<Tour[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const runSearch = useCallback(async (q: SearchQuery) => {
    setLoading(true)
    try {
      const tours = await searchTours(q)
      setResults(tours)
      setTotal(tours.length)
    } finally {
      setLoading(false)
    }
  }, [])

  // Run search whenever query changes
  useEffect(() => { runSearch(query) }, [query, runSearch])

  const updateQuery = useCallback((patch: Partial<SearchQuery>) => {
    setQuery(prev => ({ ...prev, ...patch }))
  }, [])

  const resetFilters = useCallback(() => {
    setQuery(prev => ({
      ...prev,
      priceRange: DEFAULT_QUERY.priceRange,
      durationFilter: DEFAULT_QUERY.durationFilter,
      rating: DEFAULT_QUERY.rating,
      style: DEFAULT_QUERY.style,
      region: DEFAULT_QUERY.region,
      experienceType: DEFAULT_QUERY.experienceType,
    }))
  }, [])

  return { query, results, loading, total, updateQuery, resetFilters }
}
