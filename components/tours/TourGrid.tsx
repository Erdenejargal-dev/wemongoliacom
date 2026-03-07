import type { Tour } from '@/lib/search/types'
import { TourCard } from './TourCard'
import { Compass } from 'lucide-react'

interface TourGridProps {
  tours: Tour[]
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function TourGrid({ tours, loading }: TourGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Compass className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No tours found</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No tours match your current filters. Try adjusting your search or clearing some filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
    </div>
  )
}
