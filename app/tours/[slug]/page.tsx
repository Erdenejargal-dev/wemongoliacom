import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Clock, Users, Globe, Zap, CheckCircle2, XCircle, ChevronLeft, Shield } from 'lucide-react'
import { TourGallery } from '@/components/tours/TourGallery'
import { TourItinerary } from '@/components/tours/TourItinerary'
import { TourBookingCard } from '@/components/tours/TourBookingCard'
import { TourLocationSection } from '@/components/tours/TourLocationSection'
import { fetchTourBySlug } from '@/lib/api/tours'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const tour = await fetchTourBySlug(slug)
  if (!tour) notFound()

  const images = (tour.images ?? []).map(i => i.imageUrl).filter(Boolean)
  const durationLabel = tour.durationDays ? `${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''}` : ''
  const languagesLabel = Array.isArray(tour.languages) && tour.languages.length > 0
    ? tour.languages.join(', ')
    : '—'

  const difficulty = tour.difficulty ?? '—'
  const difficultyColor = ({
    Easy: 'bg-brand-50 text-brand-700',
    Moderate: 'bg-yellow-50 text-yellow-700',
    Challenging: 'bg-orange-50 text-orange-700',
    Extreme: 'bg-red-50 text-red-700',
  } as Record<string, string>)[difficulty] ?? 'bg-gray-100 text-gray-600'

  const included = (tour.includedItems ?? []).map(i => i.label).filter(Boolean)
  const excluded = (tour.excludedItems ?? []).map(i => i.label).filter(Boolean)
  const itinerary = (tour.itinerary ?? []).slice().sort((a, b) => a.dayNumber - b.dayNumber)

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
          {images.length > 0 ? (
            <TourGallery images={images} title={tour.title} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white h-[420px] flex items-center justify-center text-sm text-gray-400">
              No photos available yet
            </div>
          )}
        </div>

        {/* ── Main layout ──────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Content ────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor}`}>
                  {difficulty}
                </span>
                {tour.category && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {tour.category}
                  </span>
                )}
                {tour.experienceType && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {tour.experienceType}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{tour.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  {tour.destination?.name ?? 'Mongolia'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900">{tour.ratingAverage ?? 0}</span>
                  <span>({tour.reviewsCount ?? 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {durationLabel || '—'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  Up to {tour.maxGuests} guests
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{tour.description ?? tour.shortDescription ?? '—'}</p>
            </div>

            {/* Key information grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tour Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: 'Duration', value: durationLabel || '—' },
                  { icon: Users, label: 'Group Size', value: `Up to ${tour.maxGuests} guests` },
                  { icon: Zap, label: 'Experience', value: tour.experienceType ?? '—' },
                  { icon: Shield, label: 'Difficulty', value: difficulty },
                  { icon: Globe, label: 'Language', value: languagesLabel },
                  { icon: MapPin, label: 'Pickup', value: tour.pickupIncluded ? 'Included' : 'Not included' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights (backend gap: no highlights field yet) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Tour Highlights</h2>
              <p className="text-sm text-gray-500">
                Highlights will appear here once providers add them.
              </p>
            </div>

            {/* Location */}
            <TourLocationSection
              destination={tour.destination ?? null}
              meetingPoint={tour.meetingPoint ?? null}
            />

            {/* Itinerary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {itinerary.length > 0 ? (
                <TourItinerary itinerary={itinerary} />
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Day-by-Day Itinerary</h2>
                  <p className="text-sm text-gray-500">Itinerary will be available soon.</p>
                </div>
              )}
            </div>

            {/* Included / Not Included */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> Included
                  </p>
                  <ul className="space-y-2">
                    {included.length > 0 ? included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">No included items listed yet.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-400" /> Not Included
                  </p>
                  <ul className="space-y-2">
                    {excluded.length > 0 ? excluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">No excluded items listed yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews (backend gap: tour reviews are not yet exposed on this endpoint) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-gray-900">Traveler Reviews</h2>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{tour.ratingAverage ?? 0}</span>
                  <span className="text-xs text-gray-500">({tour.reviewsCount ?? 0})</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Reviews will appear here once the reviews API is connected to tour pages.
              </p>
            </div>

          </div>

          {/* ── Right: Booking Card ───────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            {/* Mobile: shown inline after gallery */}
            {/* Desktop: sticky */}
            <div className="lg:sticky lg:top-24">
              <TourBookingCard
                tour={{
                  id: tour.id,
                  slug: tour.slug,
                  basePrice: tour.basePrice,
                  currency: tour.currency,
                  durationDays: tour.durationDays,
                  ratingAverage: tour.ratingAverage,
                  reviewsCount: tour.reviewsCount,
                  maxGuests: tour.maxGuests,
                }}
                departures={tour.departures ?? []}
              />

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
