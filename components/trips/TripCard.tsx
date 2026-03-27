'use client'

import { useState } from 'react'
import { CalendarDays, Users, ChevronDown } from 'lucide-react'
import type { Trip } from '@/lib/mock-data/trips'
import { TripStatusBadge } from './TripStatusBadge'
import { BookingDetails } from './BookingDetails'
import { CancelBookingButton } from './CancelBookingButton'

interface TripCardProps {
  trip: Trip
  onCancel: (bookingCode: string) => void
}

export function TripCard({ trip, onCancel }: TripCardProps) {
  const [expanded, setExpanded] = useState(false)

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header — always visible */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative h-36 sm:h-auto sm:w-40 shrink-0 overflow-hidden bg-gray-200">
          <img src={trip.image} alt={trip.listingTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between gap-2.5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{trip.listingTitle}</h3>
              <p className="text-xs text-gray-500">{trip.location} · {trip.hostName}</p>
            </div>
            <TripStatusBadge status={trip.status} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
              {formatDate(trip.date)} · {trip.durationDays} {trip.durationUnit}{trip.durationDays !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-500" />
              {trip.guests} guest{trip.guests !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-gray-800">${trip.price.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] text-gray-400 font-mono">#{trip.bookingId}</p>
            <div className="flex items-center gap-2">
              {trip.status === 'Upcoming' && (
                <CancelBookingButton
                  bookingId={trip.bookingId}
                  listingTitle={trip.listingTitle}
                  onConfirm={() => onCancel(trip.bookingId)}
                />
              )}
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-gray-100"
              >
                {expanded ? 'Hide' : 'Details'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded booking details */}
      {expanded && <BookingDetails trip={trip} />}
    </div>
  )
}
