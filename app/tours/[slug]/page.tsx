import { notFound } from 'next/navigation'
import { Star, MapPin, Clock, Users, Globe, Zap, CheckCircle2, XCircle, Shield } from 'lucide-react'
import { TourGallery } from '@/components/tours/TourGallery'
import { TourItinerary } from '@/components/tours/TourItinerary'
import { TourBookingCard } from '@/components/tours/TourBookingCard'
import { TourLocationSection } from '@/components/tours/TourLocationSection'
import { ContactProviderButton } from '@/components/ui/ContactProviderButton'
import { DetailBreadcrumb } from '@/components/navigation/DetailBreadcrumb'
import { fetchTourBySlug } from '@/lib/api/tours'
import { getTranslations } from '@/lib/i18n/server'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const [{ t }, tour] = await Promise.all([getTranslations(), fetchTourBySlug(slug)])
  if (!tour) notFound()

  const td = t.tourDetail
  const images = (tour.images ?? []).map(i => i.imageUrl).filter(Boolean)
  const durationLabel = tour.durationDays ? td.durationDays(tour.durationDays) : ''
  const languagesLabel = Array.isArray(tour.languages) && tour.languages.length > 0
    ? tour.languages.join(', ')
    : td.uiEmDash

  const difficultyLabel = tour.difficulty ?? td.uiEmDash
  const difficultyColor = ({
    Easy: 'bg-brand-50 text-brand-700',
    Moderate: 'bg-yellow-50 text-yellow-700',
    Challenging: 'bg-orange-50 text-orange-700',
    Extreme: 'bg-red-50 text-red-700',
  } as Record<string, string>)[tour.difficulty ?? ''] ?? 'bg-gray-100 text-gray-600'

  const included = (tour.includedItems ?? []).map(i => i.label).filter(Boolean)
  const excluded = (tour.excludedItems ?? []).map(i => i.label).filter(Boolean)
  const itinerary = (tour.itinerary ?? []).slice().sort((a, b) => a.dayNumber - b.dayNumber)

  return (
    <div className="min-h-screen bg-gray-50/40">
      <DetailBreadcrumb
        ariaLabel={t.common.breadcrumb}
        items={[
          { href: '/', label: t.common.home },
          { href: '/tours', label: t.browse.detail.breadcrumbTours },
        ]}
        currentTitle={tour.title}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        <div className="mb-6">
          {images.length > 0 ? (
            <TourGallery images={images} title={tour.title} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white h-[420px] flex items-center justify-center text-sm text-gray-400">
              {t.browse.detail.noPhotos}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-0 space-y-8">

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor}`}>
                  {difficultyLabel}
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
                  {tour.destination?.name ?? td.defaultRegionName}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900">{tour.ratingAverage ?? 0}</span>
                  <span>{td.reviewCount(tour.reviewsCount ?? 0)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {durationLabel || td.uiEmDash}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  {td.maxGuests(tour.maxGuests)}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {tour.description ?? tour.shortDescription ?? td.uiEmDash}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{td.sectionTourInfo}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock,  label: td.infoDuration,   value: durationLabel || td.uiEmDash },
                  { icon: Users,  label: td.infoGroupSize,   value: td.maxGuests(tour.maxGuests) },
                  { icon: Zap,    label: td.infoExperience,  value: tour.experienceType ?? td.uiEmDash },
                  { icon: Shield, label: td.infoDifficulty,  value: difficultyLabel },
                  { icon: Globe,  label: td.infoLanguage,   value: languagesLabel },
                  {
                    icon: MapPin,
                    label: td.infoPickup,
                    value: tour.pickupIncluded ? td.pickupYes : td.pickupNo,
                  },
                ].map((item) => (
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

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{td.sectionHighlights}</h2>
              <p className="text-sm text-gray-500">{td.highlightsPlaceholder}</p>
            </div>

            <TourLocationSection
              destination={tour.destination ?? null}
              meetingPoint={tour.meetingPoint ?? null}
            />

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {itinerary.length > 0 ? (
                <TourItinerary itinerary={itinerary} />
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{td.sectionItinerary}</h2>
                  <p className="text-sm text-gray-500">{td.itineraryEmpty}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{td.sectionIncluded}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> {td.includedHeading}
                  </p>
                  <ul className="space-y-2">
                    {included.length > 0 ? included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">{td.noIncludedItems}</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-400" /> {td.notIncludedHeading}
                  </p>
                  <ul className="space-y-2">
                    {excluded.length > 0 ? excluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">{td.noExcludedItems}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-gray-900">{td.sectionReviews}</h2>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{tour.ratingAverage ?? 0}</span>
                  <span className="text-xs text-gray-500">({tour.reviewsCount ?? 0})</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">{td.reviewsPlaceholder}</p>
            </div>

          </div>

          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <TourBookingCard
                tour={{
                  id: tour.id,
                  slug: tour.slug,
                  basePrice: tour.basePrice,
                  currency: tour.currency,
                  pricing: tour.pricing ?? null,
                  durationDays: tour.durationDays,
                  ratingAverage: tour.ratingAverage,
                  reviewsCount: tour.reviewsCount,
                  maxGuests: tour.maxGuests,
                }}
                departures={tour.departures ?? []}
              />

              <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-1">{td.contactCardTitle}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {tour.provider?.name
                    ? td.contactCardWithProvider(tour.provider.name)
                    : td.contactCardGeneric}
                </p>
                <ContactProviderButton
                  providerId={tour.provider?.id ?? null}
                  providerName={tour.provider?.name ?? 'Provider'}
                  listingType="tour"
                  listingId={tour.id}
                  label={td.contactCtaButton}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
