'use client'

/**
 * app/checkout/stay/page.tsx
 *
 * Accommodation checkout — mirrors the tour checkout flow.
 * Reads URL params set by StayBookingCard:
 *   slug, accId, roomTypeId, checkIn, checkOut, guests, total
 *
 * Calls createBooking({ listingType: 'accommodation', ... }) on the backend.
 */

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Loader2, Lock, AlertTriangle,
  BedDouble, CalendarDays, Users,
} from 'lucide-react'
import { TravelerForm, type TravelerData } from '@/components/checkout/TravelerForm'
import { fetchStayBySlug, type BackendStayDetail, ACCOMMODATION_TYPE_LABELS } from '@/lib/api/stays'
import { createBooking } from '@/lib/api/bookings'
import { type Booking, saveBooking, calcServiceFee } from '@/lib/booking'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

const EMPTY_TRAVELER: TravelerData = {
  name: '', email: '', phone: '', country: '', specialRequests: '',
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function nightsBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

// ── Main checkout content ─────────────────────────────────────────────────

function StayCheckoutContent() {
  const params  = useSearchParams()
  const router  = useRouter()
  const { data: session } = useSession()

  const slug        = params.get('slug')       ?? ''
  const accId       = params.get('accId')      ?? ''
  const roomTypeId  = params.get('roomTypeId') ?? ''
  const checkIn     = params.get('checkIn')    ?? ''
  const checkOut    = params.get('checkOut')   ?? ''
  const guests      = Math.max(1, Number(params.get('guests') ?? 1))
  const urlTotal    = params.get('total')      ?? ''

  const [stay,      setStay]      = useState<BackendStayDetail | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [traveler,   setTraveler]   = useState<TravelerData>(EMPTY_TRAVELER)
  const [errors,     setErrors]     = useState<Partial<Record<keyof TravelerData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!slug) {
        setLoadError('Missing stay information. Please go back and try again.')
        setLoading(false)
        return
      }
      try {
        const s = await fetchStayBySlug(slug)
        if (!alive) return
        if (!s) { setLoadError('Accommodation not found.'); setLoading(false); return }
        setStay(s)
      } catch {
        if (alive) setLoadError('Failed to load accommodation details.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [slug])

  // Derived values
  const roomType = stay?.roomTypes.find((r) => r.id === roomTypeId) ?? stay?.roomTypes[0] ?? null
  const nights   = nightsBetween(checkIn, checkOut)
  const pricePerNight = roomType?.basePricePerNight ?? 0
  const subtotal  = pricePerNight * nights
  const serviceFee = calcServiceFee(subtotal)
  const total     = subtotal + serviceFee

  const stayName     = stay?.name ?? 'Accommodation'
  const stayLocation = stay?.destination?.name ?? 'Mongolia'
  const stayImage    = stay?.images?.[0]?.imageUrl
  const typeLabel    = stay ? (ACCOMMODATION_TYPE_LABELS[stay.accommodationType] ?? stay.accommodationType) : ''

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

    if (!session) {
      setApiError('Please sign in to complete your booking.')
      setSubmitting(false)
      return
    }
    if (!stay || !roomType) {
      setApiError('Accommodation details are missing. Please go back and try again.')
      setSubmitting(false)
      return
    }
    if (nights <= 0 || !checkIn || !checkOut) {
      setApiError('Invalid dates. Please go back and select your check-in and check-out dates.')
      setSubmitting(false)
      return
    }

    try {
      const token = await getFreshAccessToken()
      if (!token) {
        setApiError('Session expired. Please sign in again.')
        await signOut({ redirect: false })
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/checkout/stay?${params.toString()}`)}`)
        return
      }

      const backendBooking = await createBooking(
        {
          listingType:      'accommodation',
          listingId:        stay.id,
          roomTypeId:       roomType.id,
          startDate:        checkIn,
          endDate:          checkOut,
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

      // Persist booking locally for the success page
      const booking: Booking = {
        id:              backendBooking.bookingCode,
        tourId:          stay.id,
        tourSlug:        stay.slug,
        tourTitle:       stay.name,
        tourLocation:    stayLocation,
        tourDuration:    `${nights} night${nights !== 1 ? 's' : ''}`,
        date:            checkIn,
        guests,
        pricePerPerson:  pricePerNight,
        subtotal:        backendBooking.subtotal,
        serviceFee:      backendBooking.serviceFee,
        total:           backendBooking.totalAmount,
        travelerName:    traveler.name,
        email:           traveler.email,
        phone:           traveler.phone,
        country:         traveler.country,
        specialRequests: traveler.specialRequests,
        createdAt:       new Date().toISOString(),
      }
      saveBooking(booking)
      router.push('/booking-success')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setApiError('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else if (err instanceof ApiError && err.status === 409) {
        setApiError(
          err.message || 'The room is no longer available for the selected dates. Please go back and choose different dates.',
        )
      } else {
        setApiError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
      }
      setSubmitting(false)
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
        <Link href="/explore" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Browse stays
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href={slug ? `/stays/${slug}` : '/explore'}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to stay
          </Link>
          <p className="text-sm font-semibold text-gray-900">Complete Booking</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            Secure checkout
          </div>
        </div>
      </div>

      {/* ── Progress ───────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-brand-600 font-semibold">
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Stay details
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
                You need an account to book stays on WeMongolia.{' '}
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent(`/checkout/stay?${params.toString()}`)}`}
                  className="underline hover:no-underline font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Invalid dates warning */}
        {nights <= 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Invalid dates</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The selected dates are invalid.{' '}
                <Link href={slug ? `/stays/${slug}` : '/explore'} className="underline hover:no-underline font-semibold">
                  Go back to select dates
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* API error banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left: Traveler form ─────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">
              <TravelerForm
                data={traveler}
                onChange={(patch) => setTraveler((prev) => ({ ...prev, ...patch }))}
                errors={errors}
              />

              <button
                type="submit"
                disabled={submitting || !session || nights <= 0}
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
                Your card will not be charged until the provider confirms your booking.
              </p>
            </div>

            {/* ── Right: Booking summary ──────────────── */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <h2 className="text-base font-bold text-gray-900">Booking Summary</h2>

                  {/* Stay image + name */}
                  <div className="flex gap-3">
                    {stayImage && (
                      <img
                        src={stayImage}
                        alt={stayName}
                        className="w-20 h-16 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2">{stayName}</p>
                      {typeLabel && (
                        <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                      )}
                      <p className="text-xs text-gray-500">{stayLocation}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
                      <div>
                        <span className="font-medium">{checkIn ? fmtDate(checkIn) : '—'}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-medium">{checkOut ? fmtDate(checkOut) : '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BedDouble className="w-4 h-4 text-gray-400 shrink-0" />
                      {roomType?.name ?? '—'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400 shrink-0" />
                      {guests} guest{guests !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                        <span>${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service fee</span>
                        <span>${serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>${total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page entry point ──────────────────────────────────────────────────────

export default function StayCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      }
    >
      <StayCheckoutContent />
    </Suspense>
  )
}
