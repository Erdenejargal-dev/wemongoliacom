'use client'

/**
 * components/booking-requests/RequestBookingModal.tsx
 *
 * Phase 6 — UX + Growth Layer. Modal form that creates a BookingRequest
 * lead for listings that aren't directly payable today (USD listings).
 *
 * Design rules from the Phase 6 spec:
 *   - Professional, trust-building copy — this is NOT "we can't take
 *     your money", it's "we'll get back to you".
 *   - No pricing math on the frontend.
 *   - Keep form minimal: name / email / phone / message + dates & guests.
 *   - Prefill from session when logged in; still allow anonymous submit.
 *   - Success state: soft confirmation copy with a close CTA.
 */

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { X, Mail, Phone, MessageSquare, User, Check, AlertCircle, Loader2 } from 'lucide-react'
import { createBookingRequest, type BookingRequestListingType } from '@/lib/api/booking-requests'
import { track } from '@/lib/analytics'

export interface RequestBookingModalProps {
  open:        boolean
  onClose:     () => void
  listingType: BookingRequestListingType
  listingId:   string
  listingTitle?: string
  /** Currency the listing is priced in — shown to the user for clarity. */
  listingCurrency?: string | null
  /** Optional pre-selected dates / guests from the booking card. */
  initialStartDate?: string
  initialEndDate?:   string
  initialGuests?:    number
  initialQuantity?:  number
}

function fmt(d?: string | null): string {
  if (!d) return ''
  // Accept either full ISO or "YYYY-MM-DD"; trim to ISO date.
  return d.length >= 10 ? d.slice(0, 10) : d
}

export function RequestBookingModal({
  open, onClose,
  listingType, listingId, listingTitle, listingCurrency,
  initialStartDate, initialEndDate, initialGuests, initialQuantity,
}: RequestBookingModalProps) {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const authed = !!session

  const [name,    setName]    = React.useState('')
  const [email,   setEmail]   = React.useState('')
  const [phone,   setPhone]   = React.useState('')
  const [message, setMessage] = React.useState('')
  const [startDate, setStartDate] = React.useState(fmt(initialStartDate))
  const [endDate,   setEndDate]   = React.useState(fmt(initialEndDate))
  const [guests,    setGuests]    = React.useState<number | ''>(initialGuests ?? '')

  const [submitting, setSubmitting] = React.useState(false)
  const [error,      setError]      = React.useState<string | null>(null)
  const [success,    setSuccess]    = React.useState(false)

  // Prefill from session whenever the modal is (re)opened.
  React.useEffect(() => {
    if (!open) return
    setError(null)
    setSuccess(false)
    setName(session?.user?.name ?? '')
    setEmail(session?.user?.email ?? '')
    setStartDate(fmt(initialStartDate))
    setEndDate(fmt(initialEndDate))
    setGuests(initialGuests ?? '')
  }, [open, session?.user?.name, session?.user?.email, initialStartDate, initialEndDate, initialGuests])

  // Emit the open event for funnel tracking.
  React.useEffect(() => {
    if (!open) return
    track('booking_request_opened', {
      listingType, listingId, currency: listingCurrency ?? null,
    })
  }, [open, listingType, listingId, listingCurrency])

  // Close on Esc.
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (name.trim().length < 2)                           return setError('Please enter your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email.')

    setSubmitting(true)
    try {
      await createBookingRequest({
        listingType, listingId,
        name:    name.trim(),
        email:   email.trim(),
        phone:   phone.trim() || undefined,
        message: message.trim() || undefined,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
        guests:    typeof guests === 'number' ? guests : undefined,
        quantity:  initialQuantity,
      }, token ?? null)

      track('booking_request_submitted', {
        listingType, listingId, currency: listingCurrency ?? null, authenticated: authed,
      })
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send your request. Please try again.'
      setError(msg)
      track('booking_request_error', { listingType, listingId, message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
          <div>
            <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">Booking request</p>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              {success ? 'Request sent' : (listingTitle ? `Contact about "${listingTitle}"` : 'Contact the host')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="px-5 pb-6">
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 flex gap-3">
              <Check className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div className="text-sm text-brand-900">
                <p className="font-semibold mb-1">We&apos;ll contact you to confirm and arrange payment.</p>
                <p className="text-brand-800">
                  The host usually responds within 1 business day. You&apos;ll receive a copy at <span className="font-medium">{email}</span>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
            {listingCurrency && listingCurrency !== 'MNT' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900 leading-relaxed">
                This listing is priced in <span className="font-semibold">{listingCurrency}</span>.
                International card payments are coming soon — for now, send a
                request and the host will arrange payment directly with you.
              </div>
            )}

            <Field icon={User} label="Your name" required>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </Field>

            <Field icon={Mail} label="Email" required>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </Field>

            <Field icon={Phone} label="Phone (optional)">
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 1234"
                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">From</span>
                <input
                  type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 mt-0.5"
                />
              </label>
              <label className="flex flex-col border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">To (optional)</span>
                <input
                  type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 mt-0.5"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Guests</span>
              <input
                type="number" min={1} max={200} value={guests}
                onChange={(e) => setGuests(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                className="flex-1 text-right bg-transparent outline-none text-sm text-gray-900"
              />
            </label>

            <Field icon={MessageSquare} label="Message (optional)">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Anything the host should know?"
                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send request
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              No charge now. The host will contact you to confirm availability and arrange payment.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  icon: Icon, label, required, children,
}: {
  icon: React.ElementType; label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {children}
      </div>
    </label>
  )
}
