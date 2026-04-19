'use client'

import Link from 'next/link'
import { Star, Clock, Users, MapPin, Heart } from 'lucide-react'
import { useState } from 'react'
import type { Tour } from '@/lib/search/types'
import { formatPricing, readPricing } from '@/lib/pricing'
import { usePreferences } from '@/components/providers/PreferencesProvider'

interface TourCardProps {
  tour: Tour
}

/** Only show style badge when backend provides real category/style data (not the default placeholder) */
const STYLE_COLORS: Record<string, string> = {
  adventure:   'bg-orange-50 text-orange-600',
  cultural:    'bg-purple-50 text-purple-600',
  luxury:      'bg-yellow-50 text-yellow-600',
  budget:      'bg-blue-50 text-blue-600',
  photography: 'bg-pink-50 text-pink-600',
  trekking:    'bg-brand-50 text-brand-600',
}

export function TourCard({ tour }: TourCardProps) {
  const [saved, setSaved] = useState(false)
  const { currency: displayCurrency } = usePreferences()
  const hasRealStyle = tour.style && tour.style !== 'adventure' && STYLE_COLORS[tour.style]
  // Always route through the Pricing DTO so the card flips between MNT and
  // USD when the user switches currency. When the backend didn't provide
  // a `pricing` field we synthesise one from the legacy (price, currency)
  // fields — the output is identical to the old `formatMoney` path, but
  // the formatting goes through a single code path.
  const pricing    = readPricing({ pricing: tour.pricing, basePrice: tour.price, currency: tour.currency })
  const priceLabel = formatPricing(pricing, displayCurrency)

  return (
    <Link href={`/tours/${tour.slug}`} className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={tour.images?.[0] ?? 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&auto=format&fit=crop'}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Save button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setSaved(v => !v) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>

        {/* Style badge — only when backend provides real category data */}
        {hasRealStyle && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${STYLE_COLORS[tour.style]}`}>
              {tour.style}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
          <MapPin className="w-3 h-3" />
          {tour.location}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {tour.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {tour.shortDescription}
        </p>

        {/* Meta row — duration and capacity are tour-level; exact dates on detail page */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</div>
          <div className="flex items-center gap-1"><Users className="w-3 h-3" />Up to {tour.maxGuests} guests</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{tour.rating}</span>
            <span className="text-xs text-gray-400">({tour.reviewCount})</span>
          </div>
          {/* Price — base price per person; departure-specific prices on detail page */}
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">{priceLabel}</span>
            <span className="text-xs text-gray-400">/person from</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
