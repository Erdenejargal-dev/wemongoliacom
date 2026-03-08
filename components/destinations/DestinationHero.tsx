'use client'

import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import type { Destination } from '@/lib/mock-data/destinations'

interface DestinationHeroProps {
  destination: Destination
}

const difficultyColor = {
  Easy:        'bg-green-500/20 text-green-100 border-green-400/40',
  Moderate:    'bg-yellow-500/20 text-yellow-100 border-yellow-400/40',
  Challenging: 'bg-orange-500/20 text-orange-100 border-orange-400/40',
}

export function DestinationHero({ destination }: DestinationHeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
      {/* Hero image */}
      <img
        src={destination.heroImage}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
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

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Location pill */}
        <div className="flex items-center gap-1.5 text-white/80 text-sm mb-3">
          <MapPin className="w-4 h-4 text-green-400" />
          <span>{destination.region} · {destination.country}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
          {destination.name}
        </h1>

        <p className="text-white/80 text-lg sm:text-xl max-w-2xl leading-relaxed mb-6 italic">
          &ldquo;{destination.tagline}&rdquo;
        </p>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${difficultyColor[destination.difficulty]}`}>
            {destination.difficulty}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            Best: {destination.bestMonths.join(' · ')}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            {destination.tourCount} tour{destination.tourCount !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>
    </section>
  )
}
