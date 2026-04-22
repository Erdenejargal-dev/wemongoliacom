'use client'

/**
 * components/trips/BookingDetails.tsx
 *
 * Expanded booking details panel shown inside TripCard.
 *
 * "Contact Host" no longer links to /hosts/[slug] (which 404s).
 * It instead opens an inline message form that calls POST /conversations,
 * creating or re-using an existing conversation with the provider, then
 * redirects to /account/messages.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  CalendarDays, Users, Receipt, Building2, ExternalLink,
  MessageSquare, Send, Loader2, X, AlertCircle,
} from 'lucide-react'
import type { Trip } from '@/lib/mock-data/trips'
import { formatMoney } from '@/lib/money'
import { TripTimeline } from './TripTimeline'
import { startConversation } from '@/lib/api/conversations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { useTravelerLocale } from '@/lib/i18n/traveler/context'
import { formatDateForLocaleString } from '@/lib/i18n/format-date'

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

export function BookingDetails({ trip }: BookingDetailsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { t: dash } = useTravelerLocale()

  function formatDate(d: string) {
    return formatDateForLocaleString(`${d}T00:00:00`, dash.dateLocale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const [showContactForm, setShowContactForm] = useState(false)
  const [message, setMessage]   = useState(
    `Hi! I have a question about my booking #${trip.bookingId} for "${trip.listingTitle}".`,
  )
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function handleContactHost(e: React.FormEvent) {
    e.preventDefault()
    if (!trip.providerId || !message.trim()) return

    const token = session ? await getFreshAccessToken() : null
    if (!token) {
      setSendError('Please sign in to contact the host.')
      return
    }

    setSending(true)
    setSendError(null)
    try {
      const result = await startConversation(
        trip.providerId,
        message.trim(),
        token,
        trip.listingType,
      )
      // Deep-link to the exact conversation thread
      const convId = result?.conversation?.id
      router.push(convId ? `/account/messages?convId=${convId}` : '/account/messages')
    } catch (err: any) {
      setSendError(err?.message ?? 'Failed to send message. Please try again.')
      setSending(false)
    }
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 space-y-5">
      {/* Timeline */}
      <TripTimeline status={trip.status} date={trip.date} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Booking info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">Booking Information</p>
          <Row label="Booking ID" value={<span className="font-mono text-brand-700">{trip.bookingId}</span>} />
          {trip.status === 'Cancelled' && trip.cancelReason && (
            <Row label="Reason" value={<span className="text-amber-700 text-left">{trip.cancelReason}</span>} />
          )}
          <Row label="Listing" value={trip.listingTitle} />
          <Row label="Location" value={trip.location} />
          <Row label="Start Date" value={
            <span className="flex items-center gap-1 justify-end">
              <CalendarDays className="w-3 h-3 text-brand-500" />{formatDate(trip.date)}
            </span>
          } />
          <Row label="Duration" value={`${trip.durationDays} ${trip.durationUnit}${trip.durationDays !== 1 ? 's' : ''}`} />
          <Row label="Guests" value={
            <span className="flex items-center gap-1 justify-end">
              <Users className="w-3 h-3 text-brand-500" />{trip.guests} guest{trip.guests !== 1 ? 's' : ''}
            </span>
          } />
          <Row label="Price Paid" value={
            <span className="flex items-center gap-1 justify-end text-brand-700">
              <Receipt className="w-3 h-3" />{formatMoney(trip.price, trip.currency)}
            </span>
          } />
        </div>

        {/* Host / provider info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-700 mb-3">Provider</p>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{trip.hostName}</p>
              <p className="text-xs text-gray-400">Provider</p>
            </div>
          </div>

          <div className="space-y-2">
            {trip.listingType === 'tour' && (
              <Link
                href={`/tours/${trip.listingSlug}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />View Tour Page
              </Link>
            )}

            {/* Contact Host — real messaging flow */}
            {!showContactForm ? (
              <button
                type="button"
                onClick={() => {
                  if (!trip.providerId) return
                  setShowContactForm(true)
                  setSendError(null)
                }}
                disabled={!trip.providerId}
                title={!trip.providerId ? 'Provider information not available' : undefined}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />Contact Host
              </button>
            ) : (
              /* Inline message form */
              <form onSubmit={handleContactHost} className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">Send a message</span>
                  <button
                    type="button"
                    onClick={() => { setShowContactForm(false); setSendError(null) }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  required
                  disabled={sending}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60"
                />

                {sendError && (
                  <div className="flex items-start gap-1.5 text-[11px] text-red-600">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    {sendError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowContactForm(false); setSendError(null) }}
                    className="flex-1 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="flex-1 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    {sending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" />Sending…</>
                    ) : (
                      <><Send className="w-3 h-3" />Send</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
