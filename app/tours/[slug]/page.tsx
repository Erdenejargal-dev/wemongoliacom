import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Clock, Users, Globe, Zap, CheckCircle2, XCircle, ChevronLeft, Shield } from 'lucide-react'
import { getTourBySlug } from '@/lib/mock-data/tourDetails'
import { TourGallery } from '@/components/tours/TourGallery'
import { TourItinerary } from '@/components/tours/TourItinerary'
import { TourBookingCard } from '@/components/tours/TourBookingCard'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const tour = getTourBySlug(slug)
  if (!tour) notFound()

  const difficultyColor = {
    Easy: 'bg-green-50 text-green-700',
    Moderate: 'bg-yellow-50 text-yellow-700',
    Challenging: 'bg-orange-50 text-orange-700',
    Extreme: 'bg-red-50 text-red-700',
  }[tour.difficulty]

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* ── Breadcrumb ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/tours" className="hover:text-gray-700 transition-colors">Tours</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{tour.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Gallery ──────────────────────────── */}
        <div className="mb-6">
          <TourGallery images={tour.images} title={tour.title} />
        </div>

        {/* ── Main layout ──────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Content ────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor}`}>
                  {tour.difficulty}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {tour.style}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {tour.experienceType}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{tour.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {tour.location}, {tour.region}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900">{tour.rating}</span>
                  <span>({tour.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  {tour.groupSize}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Key information grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tour Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: 'Duration', value: tour.duration },
                  { icon: Users, label: 'Group Size', value: tour.groupSize },
                  { icon: Zap, label: 'Experience', value: tour.experienceType },
                  { icon: Shield, label: 'Difficulty', value: tour.difficulty },
                  { icon: Globe, label: 'Language', value: tour.language },
                  { icon: MapPin, label: 'Pickup', value: tour.pickupIncluded ? 'Included' : 'Not included' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tour Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tour.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <TourItinerary itinerary={tour.itinerary} />
            </div>

            {/* Included / Not Included */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Included
                  </p>
                  <ul className="space-y-2">
                    {tour.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-400" /> Not Included
                  </p>
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-gray-900">Traveler Reviews</h2>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{tour.rating}</span>
                  <span className="text-xs text-gray-500">({tour.reviewCount})</span>
                </div>
              </div>

              <div className="space-y-5">
                {tour.reviews.map(review => (
                  <div key={review.id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-3">
                      <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                          <span className="text-xs text-gray-400">{review.country}</span>
                          <span className="ml-auto text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: Booking Card ───────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            {/* Mobile: shown inline after gallery */}
            {/* Desktop: sticky */}
            <div className="lg:sticky lg:top-24">
              <TourBookingCard tour={tour} />

              {/* Contact card */}
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-1">Have questions?</p>
                <p className="text-xs text-gray-500 mb-3">Our Mongolia travel experts reply within 2 hours.</p>
                <button className="w-full py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                  Message Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const { tourDetails } = await import('@/lib/mock-data/tourDetails')
  return tourDetails.map(t => ({ slug: t.slug }))
}
