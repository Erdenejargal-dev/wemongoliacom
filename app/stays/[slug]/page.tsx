import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Star, MapPin, BedDouble, Users, Clock, Shield,
  CheckCircle2, Building2, Phone,
} from 'lucide-react'
import { TourGallery } from '@/components/tours/TourGallery'
import { StayBookingCard } from '@/components/stays/StayBookingCard'
import { PropertyMap } from '@/components/stays/PropertyMap'
import { fetchStayBySlug, ACCOMMODATION_TYPE_LABELS } from '@/lib/api/stays'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StayDetailPage({ params }: Props) {
  const { slug } = await params
  const stay = await fetchStayBySlug(slug)
  if (!stay) notFound()

  const images = (stay.images ?? []).map((i) => i.imageUrl).filter(Boolean)
  const typeLabel = ACCOMMODATION_TYPE_LABELS[stay.accommodationType] ?? stay.accommodationType

  // Build a readable location string
  const locationParts = [stay.city, stay.region, stay.destination?.name].filter(Boolean)
  const locationLabel = locationParts.length > 0
    ? locationParts.join(', ')
    : stay.destination?.name ?? 'Mongolia'

  // Cheapest room for the headline summary
  const cheapestRoom = stay.roomTypes.length > 0
    ? stay.roomTypes.reduce((min, r) =>
        r.basePricePerNight < min.basePricePerNight ? r : min,
      )
    : null

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-gray-700 transition-colors">Stays</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{stay.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Gallery ────────────────────────────────────── */}
        <div className="mb-6">
          {images.length > 0 ? (
            <TourGallery images={images} title={stay.name} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white h-[420px] flex items-center justify-center text-sm text-gray-400">
              No photos available yet
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
                    <span>({stay.reviewsCount} review{stay.reviewsCount !== 1 ? 's' : ''})</span>
                  </div>
                )}
                {cheapestRoom && (
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-gray-400" />
                    From ${cheapestRoom.basePricePerNight.toLocaleString()}/night
                  </div>
                )}
              </div>

              {stay.description && (
                <p className="text-gray-700 leading-relaxed">{stay.description}</p>
              )}
            </div>

            {/* Key info grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Property Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Building2, label: 'Type',       value: typeLabel },
                  { icon: Clock,     label: 'Check-in',   value: stay.checkInTime   ?? 'Contact property' },
                  { icon: Clock,     label: 'Check-out',  value: stay.checkOutTime  ?? 'Contact property' },
                  ...(stay.address || stay.city ? [{
                    icon: MapPin,
                    label: 'Address',
                    value: [stay.address, stay.city].filter(Boolean).join(', '),
                  }] : []),
                  ...(stay.provider ? [{
                    icon: Phone,
                    label: 'Hosted by',
                    value: stay.provider.name,
                  }] : []),
                  ...(stay.starRating ? [{
                    icon: Star,
                    label: 'Star rating',
                    value: `${stay.starRating}-star property`,
                  }] : []),
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Rooms</h2>
              {stay.roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {stay.roomTypes.map((room) => {
                    const availableDates = room.availability.filter(
                      (a) => a.availableUnits > 0,
                    )
                    return (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors"
                      >
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
                              ${room.basePricePerNight.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">per night</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            Up to {room.maxGuests} guest{room.maxGuests !== 1 ? 's' : ''}
                          </span>
                          {room.bedType && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                              {room.bedType}
                            </span>
                          )}
                          {room.quantity > 0 && (
                            <span className="text-gray-500">
                              {room.quantity} unit{room.quantity !== 1 ? 's' : ''}
                            </span>
                          )}
                          {availableDates.length > 0 ? (
                            <span className="text-green-700 font-medium">
                              {availableDates.length} date{availableDates.length !== 1 ? 's' : ''} available
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              Contact for availability
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
                                +{room.amenities.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Room types have not been listed yet. Contact the provider for details.
                </p>
              )}
            </div>

            {/* Cancellation policy */}
            {stay.cancellationPolicy && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-500" />
                  Cancellation Policy
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{stay.cancellationPolicy}</p>
              </div>
            )}

            {/* Provider info */}
            {stay.provider && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About the Host</h2>
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
                          ({stay.provider.reviewsCount} reviews)
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
                <p className="text-sm font-semibold text-gray-900 mb-1">Have questions?</p>
                <p className="text-xs text-gray-500 mb-3">
                  Our Mongolia travel experts reply within 2 hours.
                </p>
                <Link
                  href="/"
                  className="block w-full py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
