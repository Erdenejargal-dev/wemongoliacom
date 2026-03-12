'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Star, Clock, MapPin, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Tour {
  _id: string;
  name: string;
  description: string;
  category: string;
  duration: {
    days: number;
    nights: number;
  };
  destination: string[];
  pricing: {
    adult: number;
    child?: number;
    group?: {
      minSize: number;
      pricePerPerson: number;
    };
  };
  images: string[];
  maxGroupSize: number;
  difficulty: string;
  rating?: number;
  totalReviews?: number;
  featured: boolean;
}

const TourCard = ({ tour }: { tour: Tour }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = tour.images?.[0] || 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <Link href={`/tours/${tour._id}`} className="group block h-full">
      <div className="bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border-2 border-gray-200 hover:border-orange-500">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={imageError ? 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' : imageUrl}
            alt={tour.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
          
          {/* Category Badge */}
          <div className="absolute top-0 left-0">
            <span className="bg-orange-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wide">
              {tour.category}
            </span>
          </div>

          {/* Featured Badge */}
          {tour.featured && (
            <div className="absolute top-0 right-0">
              <span className="bg-yellow-400 text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                Featured
              </span>
            </div>
          )}

          {/* Rating Badge */}
          {tour.rating && tour.rating > 0 && (
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
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
            {tour.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-gray-600 line-clamp-1">
              {tour.destination.join(', ')}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex items-center gap-1.5 border border-gray-200 p-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">{tour.duration.days}D/{tour.duration.nights}N</span>
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 p-1.5">
              <Users className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Max {tour.maxGroupSize}</span>
            </div>
          </div>

          {/* Difficulty & Reviews Row */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
              tour.difficulty === 'easy' ? 'bg-green-600 text-white' :
              tour.difficulty === 'moderate' ? 'bg-yellow-500 text-white' :
              tour.difficulty === 'challenging' ? 'bg-orange-500 text-white' :
              'bg-red-600 text-white'
            }`}>
              {tour.difficulty}
            </span>
            
            {tour.totalReviews && tour.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(tour.rating || 0) ? 'fill-current' : 'fill-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 font-medium">
                  ({tour.totalReviews})
                </span>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-900 mt-auto">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">From</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-orange-600">
                  ${tour.pricing.adult.toLocaleString()}
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

const Recommended = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        if (response.ok) {
          const data = await response.json();
          // Filter featured tours or take first 10
          const featuredTours = data.filter((tour: Tour) => tour.featured);
          setTours(featuredTours.length > 0 ? featuredTours : data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recommended Tours
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading amazing experiences...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Recommended Tours
          </h2>
          <p className="text-gray-600">No tours available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Recommended Tours
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover the most popular and highly-rated tours in Mongolia. Experience authentic nomadic culture, breathtaking landscapes, and unforgettable adventures.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            loop={tours.length > 3}
            className="!pb-12"
          >
            {tours.map((tour) => (
              <SwiperSlide key={tour._id} className="h-auto">
                <TourCard tour={tour} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button
            className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-orange-600 text-gray-800 hover:text-white p-3 shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-orange-600"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* View All Button */}
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

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #2563eb;
          opacity: 0.5;
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
