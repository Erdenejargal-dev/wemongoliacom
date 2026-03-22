'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ChevronLeft, Loader2, ChevronRight, Lock, AlertTriangle } from 'lucide-react'
import { TravelerForm, type TravelerData } from '@/components/checkout/TravelerForm'
import { BookingSummary } from '@/components/checkout/BookingSummary'
import { getTourBySlug } from '@/lib/mock-data/tourDetails'
import { mockTours } from '@/lib/mock-data/tours'
import { fetchTourBySlug, fetchTourDepartures } from '@/lib/api/tours'
import {
  type Booking,
  generateBookingId,
  saveBooking,
  calcServiceFee,
} from '@/lib/booking'
import { createBooking } from '@/lib/api/bookings'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

const EMPTY_TRAVELER: TravelerData = {
  name: '', email: '', phone: '', country: '', specialRequests: '',
}

function CheckoutContent() {
  const params    = useSearchParams()
  const router    = useRouter()
  const { data: session } = useSession()

  // Read URL params passed from TourBookingCard
  const slug      = params.get('slug')     ?? ''
  const tourId    = params.get('tourId')   ?? ''
  const depId     = params.get('depId')    ?? ''   // backend departure ID (optional)
  const guests    = Math.max(1, Number(params.get('guests') ?? 1))
  const date      = params.get('date')     ?? ''

  // Resolve tour data — prefer full detail, fallback to list entry
  const detail   = getTourBySlug(slug)
  const listTour = mockTours.find(t => t.id === tourId || t.slug === slug)
  const tourTitle    = detail?.title    ?? listTour?.title    ?? 'Mongolia Tour'
  const tourLocation = detail?.location ?? listTour?.location ?? 'Mongolia'
  const tourDuration = detail?.duration ?? listTour?.duration ?? ''
  const tourImage    = detail?.images[0] ?? listTour?.images[0]
  const price        = detail?.price    ?? listTour?.price    ?? 0

  const [traveler,    setTraveler]    = useState<TravelerData>(EMPTY_TRAVELER)
  const [errors,      setErrors]      = useState<Partial<Record<keyof TravelerData, string>>>({})
  const [submitting,  setSubmitting]  = useState(false)
  const [apiError,    setApiError]    = useState<string | null>(null)

  function validate(): boolean {
    const e: Partial<Record<keyof TravelerData, string>> = {}
    if (!traveler.name.trim())    e.name    = 'Full name is required'
    if (!traveler.email.trim())   e.email   = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email))
                                   e.email   = 'Please enter a valid email'
    if (!traveler.phone.trim())   e.phone   = 'Phone number is required'
    if (!traveler.country)        e.country = 'Please select your country'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setApiError(null)

    const subtotal   = price * guests
    const serviceFee = calcServiceFee(subtotal)

    // ── Attempt backend booking ──────────────────────────────────────────
    const token = session ? await getFreshAccessToken() : null
    if (token) {
      try {
        if (!slug || !date) throw new Error('Missing tour slug or travel date.')

        // Resolve Prisma IDs from the backend using the tour slug + date.
        // This fixes bookings that would otherwise use mock tour ids.
        const backendTour = await fetchTourBySlug(slug)
        if (!backendTour) throw new Error('Tour not found.')

        const departures = await fetchTourDepartures(backendTour.id)
        if (departures.length === 0) throw new Error('No available departures for this tour.')

        const selectedDate = date // expected: YYYY-MM-DD
        const departureMatch =
          departures.find(d => d.startDate?.startsWith(selectedDate)) ??
          (() => {
            const cutoff = new Date(selectedDate + 'T00:00:00')
            const after = departures
              .map(d => ({ d, dt: new Date(d.startDate) }))
              .filter(x => !Number.isNaN(x.dt.getTime()) && x.dt >= cutoff)
              .sort((a, b) => a.dt.getTime() - b.dt.getTime())
            return after[0]?.d
          })()

        if (!departureMatch) throw new Error('No available departure for the selected date.')

        const backendBooking = await createBooking(
          {
            listingType:      'tour',
            listingId:        backendTour.id,
            tourDepartureId:  departureMatch.id,
            startDate:        selectedDate,
            guests,
            adults:           guests,
            children:         0,
            travelerFullName: traveler.name,
            travelerEmail:    traveler.email,
            travelerPhone:    traveler.phone,
            travelerCountry:  traveler.country,
            specialRequests:  traveler.specialRequests || undefined,
          },
          token,
        )

        // Also persist to localStorage for the success page display
        const booking: Booking = {
          id:             backendBooking.bookingCode,
          tourId:         backendTour.id,
          tourSlug:       slug,
          tourTitle:      backendTour.title,
          tourLocation:   backendTour.destination?.name ?? tourLocation,
          tourDuration:   backendTour.durationDays ? `${backendTour.durationDays} day${backendTour.durationDays > 1 ? 's' : ''}` : tourDuration,
          date,
          guests,
          pricePerPerson: price,
          subtotal:       backendBooking.subtotal,
          serviceFee:     backendBooking.serviceFee,
          total:          backendBooking.totalAmount,
          travelerName:   traveler.name,
          email:          traveler.email,
          phone:          traveler.phone,
          country:        traveler.country,
          specialRequests: traveler.specialRequests,
          createdAt:      new Date().toISOString(),
        }
        saveBooking(booking)
        router.push('/booking-success')
        return
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          setApiError('Session expired. Please log in again.')
          await signOut({ redirect: false })
          router.push('/auth/login')
        } else {
          setApiError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
        }
        setSubmitting(false)
        return
      }
    }

    // ── Fallback: no auth / no tourId — save locally only ──────────────
    await new Promise(r => setTimeout(r, 900))
    const booking: Booking = {
      id:             generateBookingId(),
      tourId,
      tourSlug:       slug,
      tourTitle,
      tourLocation,
      tourDuration,
      date,
      guests,
      pricePerPerson: price,
      subtotal,
      serviceFee,
      total:          subtotal + serviceFee,
      travelerName:   traveler.name,
      email:          traveler.email,
      phone:          traveler.phone,
      country:        traveler.country,
      specialRequests: traveler.specialRequests,
      createdAt:      new Date().toISOString(),
    }
    saveBooking(booking)
    router.push('/booking-success')
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href={slug ? `/tours/${slug}` : '/tours'}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to tour
          </Link>
          <p className="text-sm font-semibold text-gray-900">Complete Booking</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            Secure checkout
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-green-600 font-semibold">
            <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Tour details
          </span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="flex items-center gap-1.5 text-green-600 font-semibold">
            <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            Checkout
          </span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold">3</span>
            Confirmation
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Auth notice — shown when not logged in */}
        {!session && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sign in to save your booking</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You can continue as a guest, but your booking won&apos;t be synced to your account.{' '}
                <Link href="/auth/login" className="underline hover:no-underline">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        {/* API error banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left: Form ─────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">
              <TravelerForm
                data={traveler}
                onChange={patch => setTraveler(prev => ({ ...prev, ...patch }))}
                errors={errors}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold text-sm rounded-2xl transition-colors shadow-sm shadow-green-200 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing your booking…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Confirm Booking
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                {session
                  ? 'Your booking will be saved to your account.'
                  : 'Your card will not be charged until we confirm availability.'}
              </p>
            </div>

            {/* ── Right: Summary ─────────────────── */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="lg:sticky lg:top-24">
                <BookingSummary
                  tourTitle={tourTitle}
                  tourLocation={tourLocation}
                  tourDuration={tourDuration}
                  tourImage={tourImage}
                  date={date}
                  guests={guests}
                  pricePerPerson={price}
                  slug={slug}
                />
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
