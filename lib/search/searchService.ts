/**
 * lib/search/searchService.ts
 *
 * Primary: call the Express backend GET /search?type=tour
 * Fallback: if the backend is unreachable, filter the local mock data.
 *
 * This keeps the tours page working during development even when the
 * backend server is not running.
 */

import type { SearchQuery, Tour } from './types'
import { searchToursFromBackend } from '@/lib/api/search'

// ── Lazy-loaded mock fallback ────────────────────────────────────────────────
async function getMockTours(): Promise<Tour[]> {
  const { mockTours } = await import('@/lib/mock-data/tours')
  return mockTours as unknown as Tour[]
}

// ── Mock filter logic (unchanged from original) ───────────────────────────────
function filterMock(tours: Tour[], q: SearchQuery): Tour[] {
  return tours.filter(t => {
    if (q.destination) {
      const dest = q.destination.toLowerCase()
      if (
        !t.location.toLowerCase().includes(dest) &&
        !t.region.toLowerCase().includes(dest) &&
        !t.title.toLowerCase().includes(dest)
      ) return false
    }
    if (t.price < q.priceRange[0] || t.price > q.priceRange[1]) return false
    if (q.rating > 0 && t.rating < q.rating) return false
    if (q.style !== 'any' && t.style !== q.style) return false
    if (q.region && t.regionSlug !== q.region) return false
    if (q.experienceType && !t.experienceTypes.includes(q.experienceType)) return false
    if (q.durationFilter && q.durationFilter !== 'any') {
      if (q.durationFilter === '1'   && t.durationDays !== 1)                   return false
      if (q.durationFilter === '2-3' && (t.durationDays < 2 || t.durationDays > 3)) return false
      if (q.durationFilter === '4-7' && (t.durationDays < 4 || t.durationDays > 7)) return false
      if (q.durationFilter === '8+'  && t.durationDays < 8)                     return false
    }
    return true
  })
}

function sortMock(tours: Tour[], sortBy: string): Tour[] {
  return [...tours].sort((a, b) => {
    if (sortBy === 'price_asc')  return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    if (sortBy === 'top_rated')  return b.rating - a.rating
    // 'popular' — keep original order (pre-sorted by mock data)
    return 0
  })
}

// ── Exported function used by useSearch ───────────────────────────────────────
export async function searchTours(query: SearchQuery): Promise<Tour[]> {
  // 1. Try backend
  try {
    const { tours } = await searchToursFromBackend(query)
    if (tours.length > 0) return tours as unknown as Tour[]
  } catch {
    // Backend unreachable — fall through to mock data
  }

  // 2. Fallback to mock data
  const all = await getMockTours()
  return sortMock(filterMock(all, query), query.sortBy)
}
