'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ChevronLeft, Loader2, ChevronRight, Lock, AlertTriangle } from 'lucide-react'
import { TravelerForm, type TravelerData } from '@/components/checkout/TravelerForm'
import { BookingSummary } from '@/components/checkout/BookingSummary'
import { fetchTourBySlug, type BackendTourDetail, type BackendDeparture } from '@/lib/api/tours'
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

  const slug      = params.get('slug')     ?? ''
  const tourId    = params.get('tourId')   ?? ''
  const depId     = params.get('depId')    ?? ''
  const guests    = Math.max(1, Number(params.get('guests') ?? 1))
  const date      = params.get('date')     ?? ''
  const urlTotal  = params.get('total')    ?? ''

  const [tour, setTour]         = useState<BackendTourDetail | null>(null)
  const [departure, setDeparture] = useState<BackendDeparture | null>(null)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [traveler,    setTraveler]    = useState<TravelerData>(EMPTY_TRAVELER)
  const [errors,      setErrors]      = useState<Partial<Record<keyof TravelerData, string>>>({})
  const [submitting,  setSubmitting]  = useState(false)
  const [apiError,    setApiError]    = useState<string | null>(null)

  // Load real tour data from backend on mount
  useEffect(() => {
    let alive = true
    async function load() {
      if (!slug) {
        setLoadError('Missing tour information. Please go back and try again.')
        setLoading(false)
        return
      }
      try {
        const t = await fetchTourBySlug(slug)
        if (!alive) return
        if (!t) { setLoadError('Tour not found.'); return }

        setTour(t)

        // Match the departure from the URL
        const deps = t.departures ?? []
        const match = depId
          ? deps.find(d => d.id === depId)
          : deps.find(d => d.startDate?.startsWith(date))
        setDeparture(match ?? null)
      } catch {
        if (alive) setLoadError('Failed to load tour details.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [slug, depId, date])

  // Computed pricing
  const pricePerPerson = departure?.priceOverride ?? tour?.basePrice ?? 0
  const subtotal   = pricePerPerson * guests
  const serviceFee = calcServiceFee(subtotal)
  const total      = subtotal + serviceFee

  const tourTitle    = tour?.title ?? 'Mongolia Tour'
  const tourLocation = tour?.destination?.name ?? 'Mongolia'
  const tourDuration = tour?.durationDays ? `${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''}` : ''
  const tourImage    = tour?.images?.[0]?.imageUrl

  const remainingSeats = departure
    ? departure.availableSeats - (departure.bookedSeats ?? 0)
    : null

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

    const token = session ? await getFreshAccessToken() : null
    if (token && tour && departure) {
      try {
        if (remainingSeats !== null && guests > remainingSeats) {
          throw new Error(`Only ${remainingSeats} seat(s) remaining. Please reduce your party size.`)
        }

        const backendBooking = await createBooking(
          {
            listingType:      'tour',
            listingId:        tour.id,
            tourDepartureId:  departure.id,
            startDate:        departure.startDate,
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

        const booking: Booking = {
          id:             backendBooking.bookingCode,
          tourId:         tour.id,
          tourSlug:       slug,
          tourTitle:      tour.title,
          tourLocation,
          tourDuration,
          date:           departure.startDate.slice(0, 10),
          guests,
          pricePerPerson,
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
        } else if (err instanceof ApiError && err.status === 409) {
          setApiError(
            err.message || 'Availability has changed. This departure no longer has enough seats. Please go back and select a different date or reduce your party size.',
          )
        } else {
          setApiError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
        }
        setSubmitting(false)
        return
      }
    }

    // Fallback for unauthenticated users or missing departure
    if (!token) {
      setApiError('Please sign in to complete your booking.')
      setSubmitting(false)
      return
    }
    if (!departure) {
      setApiError('No departure selected. Please go back to the tour page and select a departure date.')
      setSubmitting(false)
      return
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-600">{loadError}</p>
        <Link href="/tours" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Browse tours
        </Link>
      </div>
    )
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
          <span className="flex items-center gap-1.5 text-brand-600 font-semibold">
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Tour details
          </span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="flex items-center gap-1.5 text-brand-600 font-semibold">
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
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

        {/* Auth notice */}
        {!session && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sign in to complete your booking</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You need an account to book tours on WeMongolia.{' '}
                <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/checkout?${params.toString()}`)}`} className="underline hover:no-underline font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        {/* No departure warning */}
        {!departure && tour && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No departure selected</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The selected date may no longer be available.{' '}
                <Link href={`/tours/${slug}`} className="underline hover:no-underline font-semibold">Go back to select a departure</Link>
              </p>
            </div>
          </div>
        )}

        {/* Seats warning */}
        {departure && remainingSeats !== null && guests > remainingSeats && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Not enough seats</p>
              <p className="text-xs text-red-700 mt-0.5">
                Only {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} remaining for this departure. Please{' '}
                <Link href={`/tours/${slug}`} className="underline hover:no-underline font-semibold">go back and adjust</Link>.
              </p>
            </div>
          </div>
        )}

        {/* API error banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 flex-1">{apiError}</p>
            </div>
            {(apiError.toLowerCase().includes('availability') || apiError.toLowerCase().includes('seat')) && (
              <Link
                href={slug ? `/tours/${slug}` : '/tours'}
                className="text-sm font-semibold text-red-700 hover:text-red-800 underline ml-8"
              >
                Go back to tour to see current availability
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Form */}
            <div className="flex-1 min-w-0 space-y-5">
              <TravelerForm
                data={traveler}
                onChange={patch => setTraveler(prev => ({ ...prev, ...patch }))}
                errors={errors}
              />

              <button
                type="submit"
                disabled={submitting || !session || !departure || (remainingSeats !== null && guests > remainingSeats)}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-bold text-sm rounded-2xl transition-colors shadow-sm shadow-brand-200 flex items-center justify-center gap-2 active:scale-[0.99]"
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
                Your card will not be charged until the provider confirms availability.
              </p>
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="lg:sticky lg:top-24">
                <BookingSummary
                  tourTitle={tourTitle}
                  tourLocation={tourLocation}
                  tourDuration={tourDuration}
                  tourImage={tourImage}
                  date={departure ? departure.startDate.slice(0, 10) : date}
                  guests={guests}
                  pricePerPerson={pricePerPerson}
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
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
