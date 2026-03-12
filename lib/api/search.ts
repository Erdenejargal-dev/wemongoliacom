/**
 * lib/api/search.ts
 * Wraps the backend GET /search endpoint.
 * Maps frontend SearchQuery fields → backend query params.
 */

import { apiClient } from './client'
import type { SearchQuery } from '@/lib/search/types'
import { mapTour, type BackendTour } from './tours'

function sortByMap(s: string | undefined): string | undefined {
  if (s === 'top_rated') return 'rating'
  if (s === 'popular')   return 'newest'
  return s  // price_asc / price_desc pass through
}

export async function searchToursFromBackend(query: SearchQuery) {
  const params = new URLSearchParams()
  params.set('type', 'tour')
  if (query.destination)             params.set('destination', query.destination)
  if (query.priceRange[0] > 0)       params.set('minPrice', String(query.priceRange[0]))
  if (query.priceRange[1] < 2000)    params.set('maxPrice', String(query.priceRange[1]))
  if (query.rating > 0)              params.set('minRating', String(query.rating))
  const sortBy = sortByMap(query.sortBy)
  if (sortBy)                        params.set('sortBy', sortBy)

  const result = await apiClient.get<{
    type: string
    data: BackendTour[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }>(`/search?${params.toString()}`)

  return {
    tours: result.data.map(mapTour),
    total: result.pagination.total,
  }
}
