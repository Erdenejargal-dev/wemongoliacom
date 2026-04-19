import type { BackendBooking } from '@/lib/api/bookings'
import type { Trip, TripStatus, ListingType } from '@/lib/mock-data/trips'
import type { UserTrip, TripStatus as UserTripStatus } from '@/lib/mock-data/account'

function toYMD(d: string | Date): string {
  return new Date(d).toISOString().slice(0, 10)
}

function mapBookingStatusToTripStatus(status: string): TripStatus {
  if (status === 'cancelled') return 'Cancelled'
  if (status === 'completed') return 'Completed'
  // pending/confirmed -> upcoming from the traveler perspective
  return 'Upcoming'
}

function computeDurationDays(startDate: string, endDate?: string): number {
  if (!endDate) return 1
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1
  return Math.max(1, Math.ceil((end - start) / 86400000))
}

export function mapBackendBookingToTripCard(booking: BackendBooking): Trip | null {
  const listingType = booking.listingType as ListingType
  if (!['tour', 'vehicle', 'accommodation'].includes(listingType)) return null

  const status: TripStatus = mapBookingStatusToTripStatus(booking.bookingStatus)
  const snap = booking.listingSnapshot as any | undefined

  const hostSlug = booking.provider?.slug ?? ''
  const hostName = booking.provider?.name ?? 'We Mongolia'

  if (listingType === 'tour') {
    const tour = booking.tourDeparture?.tour
    const tourSlug = tour?.slug ?? snap?.slug
    const tourTitle = tour?.title ?? snap?.title
    if (!tourSlug || !tourTitle) return null

    const location = tour?.destination?.name ?? 'Mongolia'
    const image = tour?.images?.[0]?.imageUrl ?? '/brand/wemongolia.svg'
    const durationDays = tour?.durationDays ?? computeDurationDays(booking.startDate, booking.endDate)

    return {
      id: booking.id,
      bookingId: booking.bookingCode,
      listingType,
      listingSlug: tourSlug,
      listingTitle: tourTitle,
      location,
      hostSlug,
      hostName,
      providerId: booking.provider?.id,
      image,
      date: toYMD(booking.startDate),
      durationDays,
      durationUnit: 'day',
      guests: booking.guests,
      price: booking.totalAmount,
      currency: booking.currency ?? 'USD',
      status,
      cancelReason: (booking as { cancelReason?: string | null }).cancelReason,
    }
  }

  if (listingType === 'vehicle') {
    const vehicle = booking.vehicleAvailability?.vehicle
    const listingSlug = vehicle?.slug ?? snap?.slug
    const listingTitle = vehicle?.title ?? snap?.title
    if (!listingSlug || !listingTitle) return null

    const location = vehicle?.destination?.name ?? 'Mongolia'
    const image = vehicle?.images?.[0]?.imageUrl ?? '/brand/wemongolia.svg'
    const durationDays = typeof snap?.days === 'number' ? snap.days : computeDurationDays(booking.startDate, booking.endDate)

    return {
      id: booking.id,
      bookingId: booking.bookingCode,
      listingType,
      listingSlug,
      listingTitle,
      location,
      hostSlug,
      hostName,
      providerId: booking.provider?.id,
      image,
      date: toYMD(booking.startDate),
      durationDays,
      durationUnit: 'day',
      guests: booking.guests,
      price: booking.totalAmount,
      currency: booking.currency ?? 'USD',
      status,
      cancelReason: (booking as { cancelReason?: string | null }).cancelReason,
    }
  }

  // accommodation
  const acc = booking.roomType?.accommodation
  const listingSlug = acc?.slug ?? snap?.slug
  const listingTitle = acc?.name ?? snap?.name
  if (!listingSlug || !listingTitle) return null

  const location = acc?.destination?.name ?? 'Mongolia'
  const image = acc?.images?.[0]?.imageUrl ?? '/brand/wemongolia.svg'
  const durationDays = typeof snap?.nights === 'number' ? snap.nights : computeDurationDays(booking.startDate, booking.endDate)

  return {
    id: booking.id,
    bookingId: booking.bookingCode,
    listingType,
    listingSlug,
    listingTitle,
    location,
    hostSlug,
    hostName,
    providerId: booking.provider?.id,
    image,
    date: toYMD(booking.startDate),
    durationDays,
    durationUnit: 'night',
    guests: booking.guests,
    price: booking.totalAmount,
    currency: booking.currency ?? 'USD',
    status,
    cancelReason: (booking as { cancelReason?: string | null }).cancelReason,
  }
}

export function mapBackendBookingToUserTrip(booking: BackendBooking): UserTrip | null {
  if (booking.listingType !== 'tour') return null

  const mappedTrip = mapBackendBookingToTripCard(booking)
  if (!mappedTrip) return null

  return {
    id: mappedTrip.id,
    tourSlug: mappedTrip.listingSlug,
    tourTitle: mappedTrip.listingTitle,
    tourImage: mappedTrip.image,
    date: mappedTrip.date,
    guests: mappedTrip.guests,
    price: mappedTrip.price,
    currency: mappedTrip.currency,
    bookingId: mappedTrip.bookingId,
    status: mappedTrip.status as UserTripStatus,
  }
}

