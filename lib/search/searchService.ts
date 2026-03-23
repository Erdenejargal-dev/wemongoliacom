/**
 * lib/search/searchService.ts
 * Fetches tours from the Express backend GET /search?type=tour.
 * No mock fallback — production-ready backend-driven data.
 */

import type { SearchQuery, Tour } from './types'
import { searchToursFromBackend } from '@/lib/api/search'

export async function searchTours(query: SearchQuery): Promise<{ tours: Tour[]; total: number }> {
  return searchToursFromBackend(query)
}
