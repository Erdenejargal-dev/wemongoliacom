import Link from 'next/link'
import { MapPin, Compass } from 'lucide-react'
import type { Destination } from '@/lib/mock-data/destinations'

const difficultyBadge: Record<string, string> = {
  Easy:        'bg-green-50 text-green-700',
  Moderate:    'bg-yellow-50 text-yellow-700',
  Challenging: 'bg-orange-50 text-orange-700',
}

interface DestinationCardProps {
  destination: Destination
  featured?: boolean
}

export function DestinationCard({ destination, featured = false }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-gray-200 ${featured ? 'h-52' : 'h-44'}`}>
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Difficulty badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${difficultyBadge[destination.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
            {destination.difficulty}
          </span>
        </div>

        {/* Tour count badge */}
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-white/90 text-gray-800 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
            <Compass className="w-3 h-3 text-green-500" />
            {destination.tourCount} tour{destination.tourCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Destination name overlay */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow">{destination.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin className="w-3 h-3 text-green-500 shrink-0" />
          {destination.region} · {destination.country}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {destination.tagline}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {destination.bestMonths.slice(0, 3).map(m => (
              <span key={m} className="text-[10px] font-medium px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md">{m}</span>
            ))}
          </div>
          <span className="text-xs font-semibold text-green-600 group-hover:text-green-700 transition-colors">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  )
}
