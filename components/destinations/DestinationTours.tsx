'use client'

/**
 * components/destinations/DestinationTours.tsx
 *
 * Shows real tours linked to a destination.
 * Data comes from the backend's getDestinationBySlug endpoint which returns
 * up to 6 active tours linked via destinationId — no mock data.
 *
 * Phase 6.2: client component so price labels react to the user's
 * currency preference via `usePreferences()`. The parent destination
 * page stays a server component — it passes the plain `tours` array
 * down through the client boundary.
 */

import Link from 'next/link'
import { Star, Clock, ArrowRight } from 'lucide-react'
import type { BackendTourInDestination } from '@/lib/api/destinations'
import { formatPricing, readPricing } from '@/lib/pricing'
import { usePreferences } from '@/components/providers/PreferencesProvider'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=800&auto=format&fit=crop'

const DIFFICULTY_COLOURS: Record<string, string> = {
  Easy:        'bg-green-50 text-green-700',
  Moderate:    'bg-yellow-50 text-yellow-700',
  Challenging: 'bg-orange-50 text-orange-700',
}

interface DestinationToursProps {
  tours:           BackendTourInDestination[]
  destinationName: string
}

export function DestinationTours({ tours, destinationName }: DestinationToursProps) {
  if (tours.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Tours in {destinationName}</h2>
        <Link
          href={`/tours?destination=${encodeURIComponent(destinationName)}`}
          className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map(tour => (
          <TourMiniCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  )
}

function TourMiniCard({ tour }: { tour: BackendTourInDestination }) {
  const imageUrl = tour.images[0]?.imageUrl ?? FALLBACK_IMAGE
  const { currency: displayCurrency } = usePreferences()
  const pricing = readPricing({
    pricing:   tour.pricing,
    basePrice: tour.basePrice,
    currency:  tour.currency,
  })
  const priceLabel = formatPricing(pricing, displayCurrency)

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {tour.difficulty && (
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${DIFFICULTY_COLOURS[tour.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
              {tour.difficulty}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">
          {tour.title}
        </h3>

        {tour.durationDays && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Clock className="w-3 h-3" />
            {tour.durationDays} day{tour.durationDays > 1 ? 's' : ''}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {tour.ratingAverage > 0 ? (
              <>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {tour.ratingAverage.toFixed(1)}
                </span>
                {tour.reviewsCount > 0 && (
                  <span className="text-xs text-gray-400">({tour.reviewsCount})</span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">No reviews yet</span>
            )}
          </div>

          {/* Price */}
          <div>
            <span className="text-base font-bold text-gray-900">{priceLabel}</span>
            <span className="text-xs text-gray-400">/person</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
