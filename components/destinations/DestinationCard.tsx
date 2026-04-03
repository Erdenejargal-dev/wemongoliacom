'use client'

/**
 * components/destinations/DestinationCard.tsx
 *
 * Full-overlay image card used on /destinations and anywhere a destination
 * needs to be presented as a browseable discovery unit.
 *
 * Design: editorial / discovery-first. Pure image with gradient + content
 * overlaid — no split image/text layout.
 */

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import type { BackendDestination } from '@/lib/api/destinations'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800'

interface DestinationCardProps {
  destination: BackendDestination
  /**
   * featured = true → taller card for hero grids / homepage carousels
   * featured = false (default) → standard grid height
   */
  featured?: boolean
}

export function DestinationCard({ destination, featured = false }: DestinationCardProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = destination.heroImageUrl ?? FALLBACK_IMAGE

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className={`relative overflow-hidden bg-gray-200 ${featured ? 'h-64 sm:h-72' : 'h-56'}`}>
        <img
          src={imageError ? FALLBACK_IMAGE : imageUrl}
          alt={destination.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Content overlaid on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {destination.region && (
            <div className="flex items-center gap-1 text-white/65 text-[11px] mb-1">
              <MapPin className="w-2.5 h-2.5 text-orange-400 shrink-0" />
              <span className="line-clamp-1">{destination.region}</span>
            </div>
          )}

          <h3 className="text-white font-bold text-base leading-snug drop-shadow line-clamp-1 mb-1">
            {destination.name}
          </h3>

          {destination.shortDescription && (
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-2.5">
              {destination.shortDescription}
            </p>
          )}

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
            Explore
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
