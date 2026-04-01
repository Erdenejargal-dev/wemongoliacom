'use client';

/**
 * components/sections/CampandResorts.tsx
 *
 * Shows the top-rated ger camps and resorts from the backend's public /stays endpoint.
 * Uses the multi-type filter implemented in Option C (backend extended to accept
 * ?accommodationTypes=ger_camp,resort).
 *
 * Data source: GET /api/v1/stays?accommodationTypes=ger_camp,resort&sort=rating&limit=10
 */

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Star, MapPin, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import {
  fetchStays,
  type BackendStay,
  type AccommodationType,
  ACCOMMODATION_TYPE_LABELS,
} from '@/lib/api/stays';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ── Card model ────────────────────────────────────────────────────────────

interface StayCardModel {
  id:                string;
  slug:              string;
  name:              string;
  accommodationType: AccommodationType;
  typeLabel:         string;
  destinationName:   string;
  starRating:        number | null;
  ratingAverage:     number;
  reviewsCount:      number;
  images:            string[];
  /** Lowest base price per night across all room types; null if no rooms yet. */
  priceFrom:         number | null;
  currency:          string;
}

function mapBackendStayToCard(s: BackendStay): StayCardModel {
  const priceFrom =
    s.roomTypes.length > 0
      ? Math.min(...s.roomTypes.map((rt) => rt.basePricePerNight))
      : null;

  return {
    id:                s.id,
    slug:              s.slug,
    name:              s.name,
    accommodationType: s.accommodationType,
    typeLabel:         ACCOMMODATION_TYPE_LABELS[s.accommodationType] ?? s.accommodationType,
    destinationName:   s.destination?.name ?? 'Mongolia',
    starRating:        s.starRating,
    ratingAverage:     s.ratingAverage ?? 0,
    reviewsCount:      s.reviewsCount ?? 0,
    images:            (s.images ?? []).map((i) => i.imageUrl).filter(Boolean),
    priceFrom,
    currency:          s.roomTypes[0]?.currency ?? 'USD',
  };
}

// ── Type badge colours ────────────────────────────────────────────────────

const TYPE_COLOURS: Record<AccommodationType, string> = {
  ger_camp:   'bg-amber-600',
  hotel:      'bg-blue-700',
  lodge:      'bg-green-700',
  guesthouse: 'bg-teal-600',
  resort:     'bg-purple-700',
  hostel:     'bg-gray-700',
  homestay:   'bg-rose-600',
};

// ── Stay card ─────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1567191327852-25f4e5c1d0c4?q=80&w=1170&auto=format&fit=crop';

const StayCard = ({ stay }: { stay: StayCardModel }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = stay.images?.[0] || FALLBACK_IMAGE;
  const badgeColour = TYPE_COLOURS[stay.accommodationType] ?? 'bg-gray-700';

  return (
    <div className="bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border-2 border-gray-200 hover:border-orange-500 group">

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={imageError ? FALLBACK_IMAGE : imageUrl}
          alt={stay.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

        {/* Accommodation type badge */}
        <div className="absolute top-0 left-0">
          <span className={`${badgeColour} text-white px-4 py-2 text-xs font-bold uppercase tracking-wide`}>
            {stay.typeLabel}
          </span>
        </div>

        {/* User rating badge */}
        {stay.ratingAverage > 0 && (
          <div className="absolute bottom-0 right-0 bg-orange-600 text-white px-4 py-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-white" />
              <span className="font-bold text-lg">{stay.ratingAverage.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
          {stay.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
          <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <span className="text-xs text-gray-600 line-clamp-1">{stay.destinationName}</span>
        </div>

        {/* Hotel star rating (property quality, not user rating) */}
        {stay.starRating && stay.starRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(Math.min(stay.starRating, 5))].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[10px] text-gray-500 ml-1">{stay.starRating}-star property</span>
          </div>
        )}

        {/* User reviews */}
        {stay.reviewsCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(stay.ratingAverage) ? 'fill-current' : 'fill-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-600 font-medium ml-1">
              ({stay.reviewsCount} review{stay.reviewsCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-gray-900 mt-auto">
          <div>
            {stay.priceFrom !== null ? (
              <>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">From</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-orange-600">
                    ${stay.priceFrom.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500">/night</span>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">Price on request</span>
            )}
          </div>
          <Link
            href={`/stays/${stay.slug}`}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 font-bold text-xs transition-colors uppercase tracking-wide"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Skeletons ─────────────────────────────────────────────────────────────

const SkeletonCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-gray-200 animate-pulse h-96 rounded" />
    ))}
  </div>
);

// ── Main section ──────────────────────────────────────────────────────────

const CampandResorts = () => {
  const [stays, setStays]     = useState<StayCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch ger camps AND resorts using the multi-type filter (Option C):
        // backend now supports ?accommodationTypes=ger_camp,resort via { in: [...] }
        const res = await fetchStays({
          accommodationTypes: ['ger_camp', 'resort'],
          sort: 'rating',
          limit: 10,
        });
        setStays(res.data.map(mapBackendStayToCard));
      } catch (err) {
        console.error('[CampandResorts] Failed to load stays:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
              Ger Camps &amp; Resorts
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">Loading accommodations…</p>
          </div>
          <SkeletonCards />
        </div>
      </section>
    );
  }

  if (error || stays.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Ger Camps &amp; Resorts
          </h2>
          <p className="text-gray-600">
            {error
              ? 'Unable to load accommodations right now. Please try again later.'
              : 'No accommodations listed yet. Check back soon!'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Ger Camps &amp; Resorts
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            The top-rated ger camps and resorts in Mongolia — iconic stays sorted by traveller reviews.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ prevEl: '.stays-swiper-prev', nextEl: '.stays-swiper-next' }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            loop={stays.length > 3}
            className="!pb-12"
          >
            {stays.map((stay) => (
              <SwiperSlide key={stay.id} className="h-auto">
                <StayCard stay={stay} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="stays-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="stays-swiper-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 font-bold text-sm transition-colors shadow-lg uppercase tracking-wide"
          >
            Browse All Stays
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .stays-swiper .swiper-pagination-bullet {
          background: #ea580c;
          opacity: 0.4;
          width: 10px;
          height: 10px;
          border-radius: 0;
        }
        .stays-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 30px;
          height: 10px;
        }
      `}</style>
    </section>
  );
};

export default CampandResorts;
