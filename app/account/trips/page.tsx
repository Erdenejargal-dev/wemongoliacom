'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Compass } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { Trip, TripStatus } from '@/lib/mock-data/trips'
import { TripCard } from '@/components/trips/TripCard'
import { useSession } from 'next-auth/react'
import { fetchMyBookings, cancelBooking } from '@/lib/api/bookings'
import { mapBackendBookingToTripCard } from '@/lib/account/mapBookingToTrips'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

function EmptyState({ status }: { status: string }) {
  return (
    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2.5" />
      <p className="text-gray-500 font-medium text-sm">No {status.toLowerCase()} trips</p>
      {status === 'Upcoming' && (
        <>
          <p className="text-gray-400 text-xs mt-1 mb-3">You haven&apos;t booked any upcoming trips yet.</p>
          <Link href="/tours"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
            <Compass className="w-3.5 h-3.5" />Explore Tours
          </Link>
        </>
      )}
    </div>
  )
}

interface Section { label: string; status: TripStatus; accent: string }
const SECTIONS: Section[] = [
  { label: 'Upcoming Trips',  status: 'Upcoming',  accent: 'text-green-600 bg-green-50 border-green-100' },
  { label: 'Past Trips',      status: 'Completed', accent: 'text-blue-600 bg-blue-50 border-blue-100'   },
  { label: 'Cancelled Trips', status: 'Cancelled', accent: 'text-red-500 bg-red-50 border-red-100'      },
]

export default function TripsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadTrips() {
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) {
      setTrips([])
      setLoading(false)
      setError('Not signed in.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const bookings = await fetchMyBookings(freshToken)
      const mapped = bookings
        .map(mapBackendBookingToTripCard)
        .filter((t): t is Trip => Boolean(t))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      setTrips(mapped)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load trips.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTrips() }, [token])

  async function handleCancel(bookingCode: string) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) {
      setError('Session expired. Please log in again.')
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }
    const reason = window.prompt('Reason for cancellation (optional):')
    try {
      await cancelBooking(bookingCode, reason ?? '', freshToken)
      await loadTrips()
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        setError('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to cancel booking.')
      }
    }
  }

  const grouped = useMemo(() => ({
    Upcoming:  trips.filter(t => t.status === 'Upcoming'),
    Completed: trips.filter(t => t.status === 'Completed'),
    Cancelled: trips.filter(t => t.status === 'Cancelled'),
  }), [trips])

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-green-500" />
            <h1 className="text-lg font-bold text-gray-900">My Trips</h1>
          </div>
          <p className="text-xs text-gray-500">View and manage your upcoming and past travel experiences.</p>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SECTIONS.map(s => (
              <span key={s.status} className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${s.accent}`}>
                {grouped[s.status].length} {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {loading && (
          <div className="text-center py-16 text-sm text-gray-500">Loading your trips…</div>
        )}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <p className="text-xs text-gray-500 mt-1">Please refresh and try again.</p>
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-20">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold text-base mb-1">You haven&apos;t booked any trips yet</p>
            <p className="text-gray-400 text-sm mb-5">Explore Mongolia&apos;s best tours and start your adventure.</p>
            <Link href="/tours"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md">
              <Compass className="w-4 h-4" />Explore Tours
            </Link>
          </div>
        )}

        {SECTIONS.map(s => (
          <section key={s.status}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 rounded-full bg-green-500 inline-block" />
              <h2 className="text-sm font-bold text-gray-900">{s.label}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.accent}`}>
                {grouped[s.status].length}
              </span>
            </div>

            {loading ? null : grouped[s.status].length === 0 ? (
              <EmptyState status={s.status} />
            ) : (
              <div className="space-y-4">
                {grouped[s.status].map(trip => (
                  <TripCard key={trip.id} trip={trip} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
