'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2, CalendarDays, Users, MapPin, Clock, Copy, ChevronRight, AlertTriangle, Compass, Loader2,
} from 'lucide-react'
import { getLastBooking, type Booking } from '@/lib/booking'
import { fetchBookingByCode } from '@/lib/api/bookings'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { formatMoney } from '@/lib/money'
import { useTranslations, formatDateLong } from '@/lib/i18n'

function SuccessInner() {
  const { t, lang } = useTranslations()
  const { data: session } = useSession()
  const params = useSearchParams()
  const codeFromUrl = params.get('bookingCode')

  const [local] = useState<Booking | null>(() => getLastBooking())
  const bookingCode = codeFromUrl ?? local?.id ?? null

  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backend, setBackend] = useState<Awaited<ReturnType<typeof fetchBookingByCode>>>(null)

  useEffect(() => {
    async function load() {
      if (!bookingCode || !session) {
        setLoading(false)
        return
      }
      const token = await getFreshAccessToken()
      if (!token) {
        setLoading(false)
        return
      }
      const b = await fetchBookingByCode(bookingCode, token)
      setBackend(b)
      setLoading(false)
    }
    void load()
  }, [bookingCode, session])

  const paid = backend?.paymentStatus === 'paid' && backend?.bookingStatus === 'confirmed'
  const cancelled = backend?.bookingStatus === 'cancelled'
  const pendingPay =
    backend &&
    backend.bookingStatus === 'pending' &&
    ['unpaid', 'authorized', 'failed'].includes(backend.paymentStatus)

  const booking = local
  const title =
    (backend?.listingSnapshot as { title?: string; name?: string } | undefined)?.title ??
    (backend?.listingSnapshot as { name?: string } | undefined)?.name ??
    booking?.tourTitle ??
    'Your booking'
  const loc =
    (backend?.listingSnapshot as { destination?: string } | undefined)?.destination ??
    booking?.tourLocation ??
    ''
  const dateStr =
    backend?.startDate
      ? String(backend.startDate).slice(0, 10)
      : booking?.date ?? ''

  const formatBookingDate = (ds: string) => {
    if (!ds) return t.common.dateToBeConfirmed
    return formatDateLong(`${ds}T00:00:00`, lang)
  }

  function copyId() {
    if (!bookingCode) return
    navigator.clipboard.writeText(bookingCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!bookingCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No booking reference. Open this page from your confirmation link or My trips.</p>
          <Link href="/tours" className="text-brand-600 font-semibold text-sm hover:underline">Browse tours →</Link>
        </div>
      </div>
    )
  }

  if (loading && session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">This booking is not active</h1>
          <p className="text-gray-600 text-sm mb-6">
            {backend?.cancelReason ?? 'This booking may have expired or been cancelled.'}
          </p>
          <Link href="/tours" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl">
            <Compass className="w-4 h-4" />
            Browse tours
          </Link>
        </div>
      </div>
    )
  }

  if (pendingPay && backend?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">Payment required</h1>
          <p className="text-gray-600 text-sm">
            Your reservation is on hold. Complete payment to confirm.
          </p>
          <Link
            href={`/checkout/pay?bookingId=${backend.id}`}
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl"
          >
            Continue to payment
          </Link>
          <div>
            <Link href="/account/trips" className="text-sm text-gray-600 underline">My trips</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-sm text-gray-600">Unable to load booking status.</p>
      </div>
    )
  }

  const subtotal = backend?.subtotal ?? booking?.subtotal ?? 0
  const serviceFee = backend?.serviceFee ?? booking?.serviceFee ?? 0
  const total = backend?.totalAmount ?? booking?.total ?? 0
  const currency = backend?.currency ?? booking?.currency ?? 'USD'
  const guests = backend?.guests ?? booking?.guests ?? 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 mb-4 animate-[ping_0.4s_ease-out_forwards]">
            <CheckCircle2 className="w-10 h-10 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re booked!</h1>
          <p className="text-gray-500 text-sm">
            Payment received. Confirmation details are shown below.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Booking reference</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xl font-bold text-gray-900 tracking-wider">{bookingCode}</span>
            <button
              type="button"
              onClick={copyId}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-brand-500 to-brand-500 px-5 py-3">
            <p className="text-white font-bold text-sm">{title}</p>
          </div>
          <div className="p-5 space-y-3">
            <Detail icon={<MapPin className="w-4 h-4 text-brand-500" />} label="Location" value={loc || '—'} />
            <Detail icon={<CalendarDays className="w-4 h-4 text-brand-500" />} label="Date" value={formatBookingDate(dateStr)} />
            <Detail icon={<Users className="w-4 h-4 text-brand-500" />} label="Guests" value={`${guests} guest${guests !== 1 ? 's' : ''}`} />
            <Detail icon={<Clock className="w-4 h-4 text-brand-500" />} label="Details" value={booking?.tourDuration ?? '—'} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 mb-5">
          <p className="text-sm font-bold text-gray-900 mb-3">Payment summary</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(Number(subtotal), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>{formatMoney(Number(serviceFee), currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
              <span>Total paid</span>
              <span className="text-base">{formatMoney(Number(total), currency)}</span>
            </div>
          </div>
        </div>

        {booking && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 mb-8">
            <p className="text-sm font-bold text-gray-900 mb-3">Traveler</p>
            <p className="text-sm text-gray-700 font-medium">{booking.travelerName}</p>
            <p className="text-xs text-gray-500">{booking.email} · {booking.phone}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/tours"
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
            Browse more tours
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/"
            className="w-full py-3.5 border border-gray-200 bg-white text-gray-700 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            Return to home
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Need help?{' '}
          <a href="mailto:support@wemongolia.com" className="underline hover:text-gray-600">
            support@wemongolia.com
          </a>
        </p>

      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <SuccessInner />
    </Suspense>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    </div>
  )
}
