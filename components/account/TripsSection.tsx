'use client'

import Link from 'next/link'
import { CalendarDays, Users, ExternalLink, Compass } from 'lucide-react'
import type { UserTrip, TripStatus } from '@/lib/mock-data/account'
import { useTravelerLocale } from '@/lib/i18n/traveler/context'
import { formatMoney } from '@/lib/money'

interface TripsSectionProps {
  trips: UserTrip[]
}

const statusStyle: Record<TripStatus, string> = {
  Upcoming:  'bg-brand-50 text-brand-700 border-brand-100',
  Completed: 'bg-blue-50 text-blue-700 border-blue-100',
  Cancelled: 'bg-red-50 text-red-600 border-red-100',
}

export function TripsSection({ trips }: TripsSectionProps) {
  const { t } = useTravelerLocale()
  const tt    = t.trips

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString(t.dateLocale, {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm mb-1">{tt.noTrips}</p>
        <p className="text-gray-400 text-xs mb-4">{tt.noTripsDesc}</p>
        <Link href="/tours" className="text-sm text-brand-600 hover:text-brand-700 font-semibold underline">
          {tt.browseTrips}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">{tt.myTripsCount(trips.length)}</h3>
      {trips.map(trip => {
        const statusLabel = tt.statusLabels[trip.status] ?? trip.status
        return (
          <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="h-32 sm:h-auto sm:w-36 shrink-0 overflow-hidden bg-gray-200">
                <img src={trip.tourImage} alt={trip.tourTitle} className="w-full h-full object-cover" />
              </div>
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{trip.tourTitle}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle[trip.status]}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                      {formatDate(trip.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-500" />
                      {tt.guestCount(trip.guests)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-gray-400">
                      {tt.bookingId} <span className="font-bold text-gray-700">{trip.bookingId}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {tt.totalLabel} <span className="font-bold text-gray-700">{formatMoney(trip.price, trip.currency ?? 'USD')}</span>
                    </p>
                  </div>
                  <Link href={`/tours/${trip.tourSlug}`}
                    className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />{tt.viewTour}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
