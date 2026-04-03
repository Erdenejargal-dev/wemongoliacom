'use client'

/**
 * app/stays/page.tsx
 *
 * Stays listing page — backend-driven via GET /stays.
 * Previously this page didn't exist (only /stays/[slug] did), causing a 404
 * when the navbar linked to /stays. This creates the canonical listing route.
 */

import { useState, useEffect } from 'react'
import { Search, X, Loader2, Compass } from 'lucide-react'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import {
  fetchStays,
  type BackendStay,
  type AccommodationType,
  ACCOMMODATION_TYPE_LABELS,
} from '@/lib/api/stays'

// ── Type filter options ───────────────────────────────────────────────────────

const TYPE_FILTERS: { value: AccommodationType | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Stays'   },
  { value: 'ger_camp',   label: 'Ger Camps'   },
  { value: 'hotel',      label: 'Hotels'      },
  { value: 'resort',     label: 'Resorts'     },
  { value: 'lodge',      label: 'Lodges'      },
  { value: 'guesthouse', label: 'Guesthouses' },
  { value: 'homestay',   label: 'Homestays'   },
]

const TYPE_COLOURS: Partial<Record<AccommodationType, string>> = {
  ger_camp:   'bg-amber-500',
  hotel:      'bg-blue-600',
  lodge:      'bg-green-700',
  guesthouse: 'bg-teal-600',
  resort:     'bg-purple-700',
  hostel:     'bg-gray-600',
  homestay:   'bg-rose-600',
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1567191327852-25f4e5c1d0c4?q=80&w=800&auto=format&fit=crop'

// ── Stay card ─────────────────────────────────────────────────────────────────

function StayCard({ stay }: { stay: BackendStay }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl   = stay.images?.[0]?.imageUrl ?? FALLBACK_IMAGE
  const typeLabel  = ACCOMMODATION_TYPE_LABELS[stay.accommodationType] ?? stay.accommodationType
  const typeDot    = TYPE_COLOURS[stay.accommodationType] ?? 'bg-gray-500'
  const priceFrom  = stay.roomTypes.length > 0
    ? Math.min(...stay.roomTypes.map(r => r.basePricePerNight))
    : null

  return (
    <Link
      href={`/stays/${stay.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-200">
        <img
          src={imgError ? FALLBACK_IMAGE : imageUrl}
          alt={stay.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`${typeDot} text-white px-3 py-1 text-xs font-bold rounded-full`}>
            {typeLabel}
          </span>
        </div>

        {/* Rating */}
        {stay.ratingAverage > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-900">{stay.ratingAverage.toFixed(1)}</span>
            {stay.reviewsCount > 0 && (
              <span className="text-[10px] text-gray-500">({stay.reviewsCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-brand-700 transition-colors">
          {stay.name}
        </h3>

        {stay.destination && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
            <span className="line-clamp-1">{stay.destination.name}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {priceFrom !== null ? (
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide block">From</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-gray-900">${priceFrom.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400">/night</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Price on request</span>
          )}
          <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80" />
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaysPage() {
  const [stays,   setStays]   = useState<BackendStay[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [typeFilter, setTypeFilter] = useState<AccommodationType | 'all'>('all')

  useEffect(() => {
    setLoading(true)
    const params = typeFilter !== 'all'
      ? { accommodationTypes: [typeFilter as AccommodationType], limit: 50 }
      : { limit: 50 }
    fetchStays(params)
      .then(res => setStays(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [typeFilter])

  const filtered = stays.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      (s.destination?.name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ────────────────────────────────── */}
      <section className="relative bg-gray-950 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1567191327852-25f4e5c1d0c4?q=80&w=1600"
          alt="Mongolia stays"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Where to Stay
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
            Ger Camps, Hotels &<br className="hidden sm:block" />
            <span className="text-orange-400"> Lodges in Mongolia</span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-xl mx-auto mb-10">
            From traditional nomadic ger camps to luxury resorts — find where to stay for your Mongolia adventure.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or destination…"
              className="w-full pl-11 pr-10 py-4 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-2xl"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-colors ${
                typeFilter === f.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <SkeletonGrid />}

        {/* Grid */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'stay' : 'stays'}
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(stay => <StayCard key={stay.id} stay={stay} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <Compass className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-1">No stays found</p>
                <p className="text-gray-400 text-sm mb-5">
                  {search
                    ? `No results for "${search}"`
                    : 'No stays available for this filter'}
                </p>
                <button
                  onClick={() => { setSearch(''); setTypeFilter('all') }}
                  className="text-sm font-semibold text-brand-600 underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Cross-link CTA */}
        {!loading && (
          <section className="bg-gray-950 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #f97316 0%, transparent 70%)' }}
            />
            <div className="relative">
              <h3 className="text-xl font-bold text-white mb-2">Looking for tours too?</h3>
              <p className="text-white/55 text-sm mb-6 max-w-md mx-auto">
                Browse guided tours and packages across Mongolia.
              </p>
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shadow-md"
              >
                Browse All Tours
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
