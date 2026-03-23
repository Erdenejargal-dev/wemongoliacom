/**
 * lib/search/urlSync.ts
 * Serialize/deserialize SearchQuery to URL search params for /tours.
 * Only includes params that the backend search actually uses.
 */

import type { SearchQuery } from './types'
import { DEFAULT_QUERY } from './types'

export function queryToSearchParams(q: SearchQuery): URLSearchParams {
  const p = new URLSearchParams()
  if (q.destination) p.set('destination', q.destination)
  if (q.region) p.set('region', q.region)
  if (q.priceRange[0] > 0) p.set('minPrice', String(q.priceRange[0]))
  if (q.priceRange[1] < 2000) p.set('maxPrice', String(q.priceRange[1]))
  if (q.rating > 0) p.set('rating', String(q.rating))
  if (q.durationFilter !== 'any') p.set('duration', q.durationFilter)
  if (q.sortBy !== DEFAULT_QUERY.sortBy) p.set('sort', q.sortBy)
  const guestCount = (q.guests?.adults ?? 1) + (q.guests?.children ?? 0)
  if (guestCount > 1) p.set('guests', String(guestCount))
  if (q.fromDate) p.set('fromDate', q.fromDate)
  if (q.toDate) p.set('toDate', q.toDate)
  return p
}

export function searchParamsToQuery(params: URLSearchParams): Partial<SearchQuery> {
  const destination = params.get('destination') ?? ''
  const region = params.get('region') ?? ''
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const rating = params.get('rating')
  const duration = params.get('duration')
  const sort = params.get('sort')
  const guestsParam = params.get('guests')
  const totalGuests = guestsParam ? Math.max(1, parseInt(guestsParam, 10) || 1) : 1
  const fromDate = params.get('fromDate') ?? ''
  const toDate = params.get('toDate') ?? ''
  return {
    destination,
    region,
    fromDate,
    toDate,
    priceRange: [
      minPrice ? Number(minPrice) : 0,
      maxPrice ? Number(maxPrice) : 2000,
    ],
    rating: rating ? Number(rating) : 0,
    durationFilter: duration ?? 'any',
    sortBy: (sort as SearchQuery['sortBy']) ?? 'popular',
    guests: { adults: totalGuests, children: 0 },
  }
}
