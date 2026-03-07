import { mockTours } from '@/lib/mock-data/tours'
import type { SearchQuery, Tour } from './types'

/** Simulates an async API call — swap fetch() in here when backend is ready */
export async function searchTours(query: SearchQuery): Promise<Tour[]> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 400))

  let results = mockTours.filter(t => t.available)

  // Destination filter
  if (query.destination.trim()) {
    const q = query.destination.toLowerCase()
    results = results.filter(t =>
      t.location.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q)
    )
  }

  // Price range
  results = results.filter(t =>
    t.price >= query.priceRange[0] && t.price <= query.priceRange[1]
  )

  // Duration filter
  if (query.durationFilter !== 'any') {
    results = results.filter(t => {
      switch (query.durationFilter) {
        case '1':    return t.durationDays === 1
        case '2-3':  return t.durationDays >= 2 && t.durationDays <= 3
        case '4-7':  return t.durationDays >= 4 && t.durationDays <= 7
        case '8+':   return t.durationDays >= 8
        default:     return true
      }
    })
  }

  // Min rating
  if (query.rating > 0) {
    results = results.filter(t => t.rating >= query.rating)
  }

  // Style filter
  if (query.style !== 'any') {
    results = results.filter(t => t.style === query.style)
  }

  // Region filter (from hero dropdown)
  if (query.region) {
    results = results.filter(t => t.regionSlug === query.region)
  }

  // Experience type filter (from hero dropdown)
  if (query.experienceType) {
    results = results.filter(t => t.experienceTypes.includes(query.experienceType))
  }

  // Guest capacity
  const totalGuests = query.guests.adults + query.guests.children
  if (totalGuests > 1) {
    results = results.filter(t => t.maxGuests >= totalGuests)
  }

  // Sorting
  switch (query.sortBy) {
    case 'price_asc':  results.sort((a, b) => a.price - b.price); break
    case 'price_desc': results.sort((a, b) => b.price - a.price); break
    case 'top_rated':  results.sort((a, b) => b.rating - a.rating); break
    case 'popular':    results.sort((a, b) => b.reviewCount - a.reviewCount); break
  }

  return results
}
