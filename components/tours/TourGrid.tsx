'use client'

import type { Tour } from '@/lib/search/types'
import { TourCard } from './TourCard'
import { Compass } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface TourGridProps {
  tours: Tour[]
  loading?: boolean
  loadingMore?: boolean
  error?: string | null
  total?: number
  onLoadMore?: () => void
  onClearFilters?: () => void
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

export function TourGrid({ tours, loading, loadingMore, error, total = 0, onLoadMore, onClearFilters }: TourGridProps) {
  const { t: appT } = useTranslations()
  const g = appT.toursSearch.grid
  const common = appT.common

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Compass className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{g.errorTitle}</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 underline"
        >
          {g.tryAgain}
        </button>
      </div>
    )
  }

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
        <h3 className="text-base font-semibold text-gray-900 mb-1">{g.emptyTitle}</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">
          {g.emptyBody}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 underline"
          >
            {g.clearFilters}
          </button>
        )}
      </div>
    )
  }

  const hasMore = total > 0 && tours.length < total

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
      </div>
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? common.loading : g.loadMoreButton(tours.length, total)}
          </button>
        </div>
      )}
    </div>
  )
}
