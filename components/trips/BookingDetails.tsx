import Link from 'next/link'
import { CalendarDays, Users, Receipt, Building2, ExternalLink, MessageSquare } from 'lucide-react'
import type { Trip } from '@/lib/mock-data/trips'
import { TripTimeline } from './TripTimeline'

interface BookingDetailsProps {
  trip: Trip
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-xs font-bold text-gray-900 text-right">{value}</span>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function BookingDetails({ trip }: BookingDetailsProps) {
  return (
    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 space-y-5">
      {/* Timeline */}
      <TripTimeline status={trip.status} date={trip.date} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Booking info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">Booking Information</p>
          <Row label="Booking ID" value={<span className="font-mono text-green-700">{trip.bookingId}</span>} />
          <Row label="Listing" value={trip.listingTitle} />
          <Row label="Location" value={trip.location} />
          <Row label="Start Date" value={<span className="flex items-center gap-1 justify-end"><CalendarDays className="w-3 h-3 text-green-500" />{formatDate(trip.date)}</span>} />
          <Row
            label="Duration"
            value={`${trip.durationDays} ${trip.durationUnit}${trip.durationDays !== 1 ? 's' : ''}`}
          />
          <Row label="Guests" value={<span className="flex items-center gap-1 justify-end"><Users className="w-3 h-3 text-green-500" />{trip.guests} guest{trip.guests !== 1 ? 's' : ''}</span>} />
          <Row label="Price Paid" value={<span className="flex items-center gap-1 justify-end text-green-700"><Receipt className="w-3 h-3" />${trip.price.toLocaleString()}</span>} />
        </div>

        {/* Host info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">Provider</p>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{trip.hostName}</p>
              <Link href={`/hosts/${trip.hostSlug}`} className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
                View profile →
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            {trip.listingType === 'tour' && (
              <Link href={`/tours/${trip.listingSlug}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />View Tour Page
              </Link>
            )}
            <Link href={`/hosts/${trip.hostSlug}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />Contact Host
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
