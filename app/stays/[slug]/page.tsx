import { notFound } from 'next/navigation'
import {
  Star, MapPin, BedDouble, Users, Clock, Shield,
  CheckCircle2, Building2, Phone,
} from 'lucide-react'
import { TourGallery } from '@/components/tours/TourGallery'
import { RoomImageGallery } from '@/components/stays/RoomImageGallery'
import { StayBookingCard } from '@/components/stays/StayBookingCard'
import { PropertyMap } from '@/components/stays/PropertyMap'
import { ContactProviderButton } from '@/components/ui/ContactProviderButton'
import { DetailBreadcrumb } from '@/components/navigation/DetailBreadcrumb'
import { fetchStayBySlug, ACCOMMODATION_TYPE_LABELS } from '@/lib/api/stays'
import { formatPricing, readPricing } from '@/lib/pricing'
import { readPreferredCurrencyServer } from '@/lib/preferences-storage.server'
import { getTranslations } from '@/lib/i18n/server'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StayDetailPage({ params }: Props) {
  const { slug } = await params
  // Read the preferred display currency from the cookie so server-rendered
  // prices agree with the navbar switcher. `router.refresh()` fired from
  // the switcher re-runs this page, so the value stays current.
  const [{ t }, stay, displayCurrency] = await Promise.all([
    getTranslations(),
    fetchStayBySlug(slug),
    readPreferredCurrencyServer(),
  ])
  if (!stay) notFound()
  const effectiveDisplayCurrency = displayCurrency ?? 'USD'
  const sd = t.stayDetail
  const typeNames = t.browse.stays.types

  const images = (stay.images ?? []).map((i) => i.imageUrl).filter(Boolean)
  const typeLabel =
    (typeNames as Record<string, string | undefined>)[stay.accommodationType]
    ?? ACCOMMODATION_TYPE_LABELS[stay.accommodationType]
    ?? stay.accommodationType

  // Build a readable location string
  const locationParts = [stay.city, stay.region, stay.destination?.name].filter(Boolean)
  const locationLabel = locationParts.length > 0
    ? locationParts.join(', ')
    : stay.destination?.name ?? sd.defaultLocation

  // Cheapest room for the headline summary
  const cheapestRoom = stay.roomTypes.length > 0
    ? stay.roomTypes.reduce((min, r) =>
        r.basePricePerNight < min.basePricePerNight ? r : min,
      )
    : null

  return (
    <div className="min-h-screen bg-gray-50/40">

      <DetailBreadcrumb
        ariaLabel={t.common.breadcrumb}
        items={[
          { href: '/', label: t.common.home },
          { href: '/explore', label: t.browse.detail.breadcrumbStays },
        ]}
        currentTitle={stay.name}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Gallery ────────────────────────────────────── */}
        <div className="mb-6">
          {images.length > 0 ? (
            <TourGallery images={images} title={stay.name} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white h-[420px] flex items-center justify-center text-sm text-gray-400">
              {t.browse.detail.noPhotos}
            </div>
          )}
        </div>

        {/* ── Main layout ────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Content ──────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  {typeLabel}
                </span>
                {stay.starRating && stay.starRating > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 flex items-center gap-1">
                    {[...Array(Math.min(stay.starRating, 5))].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{stay.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  {locationLabel}
                </div>
                {stay.ratingAverage > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-900">
                      {stay.ratingAverage.toFixed(1)}
                    </span>
                    <span>{sd.reviewCount(stay.reviewsCount)}</span>
                  </div>
                )}
                {cheapestRoom && (
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-gray-400" />
                    {sd.fromPerNight}{' '}
                    {formatPricing(
                      readPricing({
                        pricing: cheapestRoom.pricing,
                        basePricePerNight: cheapestRoom.basePricePerNight,
                        currency: cheapestRoom.currency,
                      }),
                      effectiveDisplayCurrency,
                    )}{' '}
                    {sd.perNight}
                  </div>
                )}
              </div>

              {stay.description && (
                <p className="text-gray-700 leading-relaxed">{stay.description}</p>
              )}
            </div>

            {/* Key info grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{sd.propertyInfo}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Building2, label: sd.type,     value: typeLabel },
                  { icon: Clock,     label: sd.checkIn,  value: stay.checkInTime   ?? sd.contactProperty },
                  { icon: Clock,     label: sd.checkOut, value: stay.checkOutTime  ?? sd.contactProperty },
                  ...(stay.address || stay.city
                    ? [{
                        icon: MapPin,
                        label: sd.address,
                        value: [stay.address, stay.city].filter(Boolean).join(', '),
                      }]
                    : []),
                  ...(stay.provider
                    ? [{
                        icon: Phone,
                        label: sd.hostedBy,
                        value: stay.provider.name,
                      }]
                    : []),
                  ...(stay.starRating
                    ? [{
                        icon: Star,
                        label: sd.starRating,
                        value: sd.starProperty(stay.starRating),
                      }]
                    : []),
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

            {/* Amenities */}
            {stay.amenities && stay.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{sd.amenities}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stay.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Map — only rendered when coordinates are set ── */}
            {stay.latitude != null && stay.longitude != null && (
              <PropertyMap
                lat={stay.latitude}
                lng={stay.longitude}
                label={locationLabel}
              />
            )}

            {/* Room types */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{sd.availableRooms}</h2>
              {stay.roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {stay.roomTypes.map((room) => {
                    const availableDates = room.availability.filter(
                      (a) => a.availableUnits > 0,
                    )
                    return (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-300 transition-colors"
                      >
                        {/* Room images with lightbox */}
                        <RoomImageGallery images={room.images ?? []} roomName={room.name} />
                        <div className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
                            {room.description && (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                {room.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-orange-600">
                              {formatPricing(
                                readPricing({
                                  pricing: room.pricing,
                                  basePricePerNight: room.basePricePerNight,
                                  currency: room.currency,
                                }),
                                effectiveDisplayCurrency,
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{sd.perNight}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            {sd.upToGuests(room.maxGuests)}
                          </span>
                          {room.bedType && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                              {room.bedType}
                            </span>
                          )}
                          {room.quantity > 0 && (
                            <span className="text-gray-500">
                              {sd.units(room.quantity)}
                            </span>
                          )}
                          {availableDates.length > 0 ? (
                            <span className="text-green-700 font-medium">
                              {sd.datesAvailable(availableDates.length)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              {sd.contactForAvailability}
                            </span>
                          )}
                        </div>

                        {/* Room amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {room.amenities.slice(0, 6).map((a, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                              >
                                {a}
                              </span>
                            ))}
                            {room.amenities.length > 6 && (
                              <span className="text-[11px] text-gray-400">
                                {sd.moreAmenities(room.amenities.length - 6)}
                              </span>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {sd.noRoomsListed}
                </p>
              )}
            </div>

            {/* Cancellation policy */}
            {stay.cancellationPolicy && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-500" />
                  {sd.cancellationTitle}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{stay.cancellationPolicy}</p>
              </div>
            )}

            {/* Provider info */}
            {stay.provider && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{sd.aboutHost}</h2>
                <div className="flex items-center gap-4">
                  {stay.provider.logoUrl && (
                    <img
                      src={stay.provider.logoUrl}
                      alt={stay.provider.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{stay.provider.name}</p>
                    {stay.provider.city && (
                      <p className="text-sm text-gray-500">{stay.provider.city}</p>
                    )}
                    {stay.provider.ratingAverage > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{stay.provider.ratingAverage.toFixed(1)}</span>
                        <span className="text-gray-400">
                          {sd.hostReviews(stay.provider.reviewsCount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Right: Booking card ─────────────────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <StayBookingCard stay={stay} />

              {/* Contact card */}
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-1">{sd.contactCardTitle}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {stay.provider?.name
                    ? sd.contactWithProvider(stay.provider.name)
                    : sd.contactGeneric}
                </p>
                <ContactProviderButton
                  providerId={stay.provider?.id ?? null}
                  providerName={stay.provider?.name ?? sd.defaultProviderName}
                  listingType="accommodation"
                  listingId={stay.id}
                  label={sd.contactCta}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
