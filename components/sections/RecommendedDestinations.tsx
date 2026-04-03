'use client'

/**
 * components/sections/RecommendedDestinations.tsx
 *
 * Homepage carousel section for featured destinations.
 * Data source: GET /destinations?featured=true&limit=10
 * Fallback:    GET /destinations?limit=10
 *
 * Uses the shared DestinationCard component (full-overlay, featured=true → h-72).
 * Background: bg-white — intentionally different from the adjacent Recommended
 * (tours) section which uses bg-gray-50, so the two sections read as distinct.
 */

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { fetchDestinations, type BackendDestination } from '@/lib/api/destinations'
import { DestinationCard } from '@/components/destinations/DestinationCard'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// ── Skeletons ─────────────────────────────────────────────────────────────────

const SkeletonCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
    ))}
  </div>
)

// ── Main section ──────────────────────────────────────────────────────────────

export default function RecommendedDestinations() {
  const [destinations, setDestinations] = useState<BackendDestination[]>([])
  const [loading,      setLoading]      = useState(true)
  const [isFeatured,   setIsFeatured]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDestinations({ featured: true, limit: 10 })
        if (res.data.length > 0) {
          setDestinations(res.data)
          setIsFeatured(true)
        } else {
          const fallback = await fetchDestinations({ limit: 10 })
          setDestinations(fallback.data)
          setIsFeatured(false)
        }
      } catch (err) {
        console.error('[RecommendedDestinations] Failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
              Explore Destinations
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto mb-6" />
            <p className="text-gray-500 max-w-2xl mx-auto">Loading destinations…</p>
          </div>
          <SkeletonCards />
        </div>
      </section>
    )
  }

  // No destinations in DB — hide section entirely
  if (destinations.length === 0) return null

  const subtitle = isFeatured
    ? 'Handpicked destinations — discover where your next Mongolia adventure begins.'
    : "Browse Mongolia's most visited regions and start planning your journey."

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Explore Destinations
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{subtitle}</p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 4800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ prevEl: '.dest-swiper-prev', nextEl: '.dest-swiper-next' }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            loop={destinations.length > 3}
            className="!pb-12"
          >
            {destinations.map(dest => (
              <SwiperSlide key={dest.id} className="h-auto">
                {/* featured=true → taller card (h-64 sm:h-72) for carousel feel */}
                <DestinationCard destination={dest} featured />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="dest-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Previous destination"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="dest-swiper-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Next destination"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 font-bold text-sm transition-colors shadow-lg uppercase tracking-wide"
          >
            View All Destinations
            <MapPin className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
