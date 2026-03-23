/**
 * lib/api/search.ts
 * Wraps the backend GET /search endpoint.
 * Maps frontend SearchQuery fields → backend query params.
 */

import { apiClient } from './client'
import type { SearchQuery } from '@/lib/search/types'
import { mapSearchTourToFrontend, type BackendSearchTour } from './tours'

function toMinMaxDays(durationFilter: string): { minDays?: number; maxDays?: number } {
  if (durationFilter === 'any') return {}
  if (durationFilter === '1')   return { minDays: 1, maxDays: 1 }
  if (durationFilter === '2-3') return { minDays: 2, maxDays: 3 }
  if (durationFilter === '4-7') return { minDays: 4, maxDays: 7 }
  if (durationFilter === '8+')  return { minDays: 8 }
  return {}
}

/** Frontend region slug → backend region search term (contains match) */
const REGION_SLUG_TO_PARAM: Record<string, string> = {
  gobi:       'Gobi',
  khangai:    'Khangai',
  khuvsgul:   'Northern',  // Northern Mongolia
  ulaanbaatar: 'Ulaanbaatar',
  altai:      'Western',   // Western Mongolia
  steppe:     'Central',   // Central Steppes
}

function sortByMap(s: string | undefined): string | undefined {
  if (s === 'top_rated') return 'rating'
  return s  // popular, price_asc, price_desc pass through
}

export async function searchToursFromBackend(query: SearchQuery) {
  const params = new URLSearchParams()
  params.set('type', 'tour')
  if (query.destination)             params.set('destination', query.destination)
  if (query.region)                 params.set('region', REGION_SLUG_TO_PARAM[query.region] ?? query.region)
  if (query.priceRange[0] > 0)       params.set('minPrice', String(query.priceRange[0]))
  if (query.priceRange[1] < 2000)     params.set('maxPrice', String(query.priceRange[1]))
  if (query.rating > 0)              params.set('minRating', String(query.rating))
  const { minDays, maxDays } = toMinMaxDays(query.durationFilter)
  if (minDays !== undefined)         params.set('minDays', String(minDays))
  if (maxDays !== undefined)         params.set('maxDays', String(maxDays))
  const sortBy = sortByMap(query.sortBy)
  if (sortBy)                        params.set('sortBy', sortBy)
  const guestCount = (query.guests?.adults ?? 1) + (query.guests?.children ?? 0)
  if (guestCount > 1)                params.set('guests', String(guestCount))
  if (query.fromDate)               params.set('minDate', query.fromDate)
  if (query.toDate)                 params.set('maxDate', query.toDate)
  params.set('limit', '24')
  params.set('page', String(Math.max(1, query.page ?? 1)))

  const result = await apiClient.get<{
    type: string
    data: BackendSearchTour[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }>(`/search?${params.toString()}`)

  return {
    tours: result.data.map(mapSearchTourToFrontend),
    total: result.pagination.total,
  }
}
