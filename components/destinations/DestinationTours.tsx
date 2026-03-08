import Link from 'next/link'
import { Star, Clock, Users, ArrowRight } from 'lucide-react'
import { mockTours } from '@/lib/mock-data/tours'
import type { Tour } from '@/lib/search/types'

interface DestinationToursProps {
  destinationSlug: string
  destinationName: string
}

export function DestinationTours({ destinationSlug, destinationName }: DestinationToursProps) {
  const tours = mockTours.filter(t => t.destinationSlug === destinationSlug && t.available)

  if (tours.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Tours in {destinationName}
        </h2>
        <Link href={`/tours?destination=${encodeURIComponent(destinationName)}`}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-semibold transition-colors">
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

function TourMiniCard({ tour }: { tour: Tour }) {
  const styleColors: Record<string, string> = {
    adventure:   'bg-orange-50 text-orange-600',
    cultural:    'bg-purple-50 text-purple-600',
    luxury:      'bg-yellow-50 text-yellow-600',
    budget:      'bg-blue-50 text-blue-600',
    photography: 'bg-pink-50 text-pink-600',
    trekking:    'bg-green-50 text-green-600',
  }

  return (
    <Link href={`/tours/${tour.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={tour.images[0]}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${styleColors[tour.style] ?? 'bg-gray-100 text-gray-600'}`}>
            {tour.style}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-green-700 transition-colors">
          {tour.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</div>
          <div className="flex items-center gap-1"><Users className="w-3 h-3" />Max {tour.maxGuests}</div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{tour.rating}</span>
            <span className="text-xs text-gray-400">({tour.reviewCount})</span>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">${tour.price}</span>
            <span className="text-xs text-gray-400">/person</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
