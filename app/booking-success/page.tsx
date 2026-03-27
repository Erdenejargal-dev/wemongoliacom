'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { CheckCircle2, CalendarDays, Users, MapPin, Clock, Copy, ChevronRight, AlertTriangle, Compass } from 'lucide-react'
import { getLastBooking, type Booking } from '@/lib/booking'
import { fetchBookingByCode } from '@/lib/api/bookings'
import { getFreshAccessToken } from '@/lib/auth-utils'

function formatDate(dateStr: string) {
  if (!dateStr) return 'To be confirmed'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BookingSuccessPage() {
  const { data: session } = useSession()
  const [booking] = useState<Booking | null>(() => getLastBooking())
  const [copied, setCopied] = useState(false)
  const [expired, setExpired] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verify() {
      if (!booking?.id || !session) {
        setChecking(false)
        return
      }
      const token = await getFreshAccessToken()
      if (!token) {
        setChecking(false)
        return
      }
      const b = await fetchBookingByCode(booking.id, token)
      setExpired(Boolean(b?.bookingStatus === 'cancelled'))
      setChecking(false)
    }
    verify()
  }, [booking?.id, session])

  function copyId() {
    if (!booking) return
    navigator.clipboard.writeText(booking.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No booking found.</p>
          <Link href="/tours" className="text-brand-600 font-semibold text-sm hover:underline">Browse tours →</Link>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">This booking has expired</h1>
          <p className="text-gray-600 text-sm mb-6">
            Pending bookings expire after 15 minutes if not confirmed. Your seats have been released. You can book again for the same or a different tour.
          </p>
          <Link
            href={booking.tourSlug ? `/tours/${booking.tourSlug}` : '/tours'}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
          >
            <Compass className="w-4 h-4" />
            {booking.tourSlug ? 'Book this tour again' : 'Browse tours'}
          </Link>
        </div>
      </div>
    )
  }

  if (checking && session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Verifying booking…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 mb-4 animate-[ping_0.4s_ease-out_forwards]">
            <CheckCircle2 className="w-10 h-10 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm">
            A confirmation has been sent to <strong className="text-gray-700">{booking.email}</strong>
          </p>
        </div>

        {/* Booking ID card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Booking Reference</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xl font-bold text-gray-900 tracking-wider">{booking.id}</span>
            <button
              onClick={copyId}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Keep this ID — you&apos;ll need it to manage your booking.</p>
        </div>

        {/* Tour details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-brand-500 to-brand-500 px-5 py-3">
            <p className="text-white font-bold text-sm">{booking.tourTitle}</p>
          </div>
          <div className="p-5 space-y-3">
            <Detail icon={<MapPin className="w-4 h-4 text-brand-500" />} label="Location" value={booking.tourLocation} />
            <Detail icon={<CalendarDays className="w-4 h-4 text-brand-500" />} label="Travel Date" value={formatDate(booking.date)} />
            <Detail icon={<Users className="w-4 h-4 text-brand-500" />} label="Guests" value={`${booking.guests} guest${booking.guests !== 1 ? 's' : ''}`} />
            <Detail icon={<Clock className="w-4 h-4 text-brand-500" />} label="Duration" value={booking.tourDuration} />
          </div>
        </div>

        {/* Price summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 mb-5">
          <p className="text-sm font-bold text-gray-900 mb-3">Payment Summary</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>${booking.pricePerPerson} × {booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
              <span>${booking.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>${booking.serviceFee}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
              <span>Total Paid</span>
              <span className="text-base">${booking.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Traveler info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 mb-8">
          <p className="text-sm font-bold text-gray-900 mb-3">Traveler</p>
          <p className="text-sm text-gray-700 font-medium">{booking.travelerName}</p>
          <p className="text-xs text-gray-500">{booking.email} · {booking.phone}</p>
          <p className="text-xs text-gray-500">{booking.country}</p>
          {booking.specialRequests && (
            <div className="mt-2 pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-500 italic">&ldquo;{booking.specialRequests}&rdquo;</p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/tours"
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
            Browse More Tours
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/"
            className="w-full py-3.5 border border-gray-200 bg-white text-gray-700 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            Return to Home
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? Email us at{' '}
          <a href="mailto:support@wemongolia.com" className="underline hover:text-gray-600">
            support@wemongolia.com
          </a>
        </p>

      </div>
    </div>
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
