'use client';

/**
 * components/sections/Recommended.tsx
 *
 * Shows featured tours (admin-curated, featured=true in the DB) sorted by
 * review count.  If no featured tours exist yet, falls back to the top-rated
 * tours so the section is never empty while still being honest.
 *
 * Data source: GET /api/v1/tours?featured=true&sort=popular&limit=10
 * Fallback:    GET /api/v1/tours?sort=rating&limit=10
 */

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Star, Clock, MapPin, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchTours, type BackendTour } from '@/lib/api/tours';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ── Card model ────────────────────────────────────────────────────────────

interface TourCardModel {
  id: string;
  slug: string;
  name: string;
  category: string;
  durationDays: number;
  durationNights: number;
  destinationName: string;
  priceFrom: number;
  images: string[];
  difficulty: string;
  rating: number;
  totalReviews: number;
  featured: boolean;
  /** Real value from tourCardSelect — null if backend didn't return it. */
  maxGuests: number | null;
}

function mapBackendTourToCard(t: BackendTour): TourCardModel {
  return {
    id:              t.id,
    slug:            t.slug,
    name:            t.title,
    category:        t.category ?? 'Tour',
    durationDays:    t.durationDays ?? 0,
    durationNights:  Math.max(0, (t.durationDays ?? 0) - 1),
    destinationName: t.destination?.name ?? 'Mongolia',
    priceFrom:       t.basePrice,
    images:          (t.images ?? []).map(i => i.imageUrl).filter(Boolean),
    difficulty:      (t.difficulty ?? 'moderate').toLowerCase(),
    rating:          t.ratingAverage ?? 0,
    totalReviews:    t.reviewsCount ?? 0,
    featured:        t.featured ?? false,
    maxGuests:       t.maxGuests ?? null,
  };
}

// ── Tour card ─────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop';

const TourCard = ({ tour }: { tour: TourCardModel }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = tour.images?.[0] || FALLBACK_IMAGE;

  return (
    <Link href={`/tours/${tour.slug}`} className="group block h-full">
      <div className="bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border-2 border-gray-200 hover:border-orange-500">

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={imageError ? FALLBACK_IMAGE : imageUrl}
            alt={tour.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

          {/* Category badge */}
          <div className="absolute top-0 left-0">
            <span className="bg-orange-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wide">
              {tour.category}
            </span>
          </div>

          {/* Featured badge */}
          {tour.featured && (
            <div className="absolute top-0 right-0">
              <span className="bg-yellow-400 text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                Featured
              </span>
            </div>
          )}

          {/* Rating badge */}
          {tour.rating > 0 && (
            <div className="absolute bottom-0 right-0 bg-orange-600 text-white px-4 py-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-white" />
                <span className="font-bold text-lg">{tour.rating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
            {tour.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-gray-600 line-clamp-1">{tour.destinationName}</span>
          </div>

          {/* Duration + capacity row */}
          <div className={`grid gap-2 mb-2 ${tour.maxGuests ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex items-center gap-1.5 border border-gray-200 p-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">
                {tour.durationDays}D / {tour.durationNights}N
              </span>
            </div>
            {tour.maxGuests && (
              <div className="flex items-center gap-1.5 border border-gray-200 p-1.5">
                <Users className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Max {tour.maxGuests}</span>
              </div>
            )}
          </div>

          {/* Difficulty + reviews */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
              tour.difficulty === 'easy'        ? 'bg-green-600 text-white'  :
              tour.difficulty === 'moderate'    ? 'bg-yellow-500 text-white' :
              tour.difficulty === 'challenging' ? 'bg-orange-500 text-white' :
              'bg-red-600 text-white'
            }`}>
              {tour.difficulty}
            </span>

            {tour.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(tour.rating) ? 'fill-current' : 'fill-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 font-medium">({tour.totalReviews})</span>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-900 mt-auto">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">From</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-orange-600">
                  ${tour.priceFrom.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">/person</span>
              </div>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 font-bold text-xs transition-colors uppercase tracking-wide">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Section skeletons ─────────────────────────────────────────────────────

const SkeletonCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-gray-200 animate-pulse h-96 rounded" />
    ))}
  </div>
);

// ── Main section ──────────────────────────────────────────────────────────

const Recommended = () => {
  const [tours, setTours]       = useState<TourCardModel[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isFeatured, setIsFeatured] = useState(true); // tracks whether we're showing featured or fallback

  useEffect(() => {
    const load = async () => {
      try {
        // Step 1: ask the backend for featured tours (admin-curated) sorted by popularity
        const res = await fetchTours({ featured: true, sort: 'popular', limit: 10 });

        if (res.data.length > 0) {
          setTours(res.data.map(mapBackendTourToCard));
          setIsFeatured(true);
        } else {
          // Step 2: no featured tours in the DB yet — fall back to highest-rated tours
          const fallback = await fetchTours({ sort: 'rating', limit: 10 });
          setTours(fallback.data.map(mapBackendTourToCard));
          setIsFeatured(false);
        }
      } catch (err) {
        console.error('[Recommended] Failed to load tours:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
              Recommended Tours
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">Loading amazing experiences…</p>
          </div>
          <SkeletonCards />
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Recommended Tours
          </h2>
          <p className="text-gray-600">No tours available at the moment. Check back soon!</p>
        </div>
      </section>
    );
  }

  const subtitle = isFeatured
    ? 'Handpicked featured tours — expertly curated to give you the very best of Mongolia.'
    : 'Our highest-rated tours, chosen by travellers who explored Mongolia with us.';

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Recommended Tours
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
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ prevEl: '.rec-swiper-prev', nextEl: '.rec-swiper-next' }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            loop={tours.length > 3}
            className="!pb-12"
          >
            {tours.map((tour) => (
              <SwiperSlide key={tour.id} className="h-auto">
                <TourCard tour={tour} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="rec-swiper-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="rec-swiper-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 font-bold text-sm transition-colors shadow-lg uppercase tracking-wide"
          >
            View All Tours
            <Calendar className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #ea580c;
          opacity: 0.4;
          width: 10px;
          height: 10px;
          border-radius: 0;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          width: 30px;
          height: 10px;
        }
      `}</style>
    </section>
  );
};

export default Recommended;
