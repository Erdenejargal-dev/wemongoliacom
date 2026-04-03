'use client'

import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import type { BackendDestinationDetail } from '@/lib/api/destinations'

interface DestinationHeroProps {
  destination: BackendDestinationDetail
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600'

export function DestinationHero({ destination }: DestinationHeroProps) {
  const imageUrl = destination.heroImageUrl ?? FALLBACK_IMAGE

  return (
    <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
      {/* Hero image */}
      <img
        src={imageUrl}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Breadcrumb */}
      <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-white/70 text-xs">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{destination.name}</span>
        </nav>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Location */}
        {(destination.region || destination.country) && (
          <div className="flex items-center gap-1.5 text-white/80 text-sm mb-3">
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>{[destination.region, destination.country].filter(Boolean).join(' · ')}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
          {destination.name}
        </h1>

        {/* Tagline from shortDescription */}
        {destination.shortDescription && (
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl leading-relaxed mb-6 italic">
            &ldquo;{destination.shortDescription}&rdquo;
          </p>
        )}

        {/* Meta chips — only real backend fields */}
        <div className="flex flex-wrap items-center gap-2">
          {destination.bestTimeToVisit && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              Best time: {destination.bestTimeToVisit}
            </span>
          )}
          {destination.weatherInfo && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              {destination.weatherInfo}
            </span>
          )}
          {destination.featured && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-400/40 bg-brand-500/20 text-brand-100 backdrop-blur-sm">
              Featured Destination
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
