'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  BookOpen, RefreshCw, X, User, Calendar, Users,
  CreditCard, Hash, MapPin, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { TableToolbar } from '@/components/dashboard/ui/TableToolbar'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { ConfirmDialog, PromptDialog } from '@/components/dashboard/ui/ConfirmDialog'
import {
  fetchProviderBookings,
  confirmProviderBooking,
  completeProviderBooking,
  cancelProviderBooking,
  type ProviderBooking,
} from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useProviderLocale } from '@/lib/i18n/provider/context'
import { formatMoney } from '@/lib/money'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
const STATUS_VALUES: StatusFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
function isStatusFilter(v: string): v is StatusFilter { return (STATUS_VALUES as string[]).includes(v) }

// ── Booking detail drawer ─────────────────────────────────────────────────────

function BookingDrawer({ booking, onClose, onConfirm, onComplete, onCancel, actionLoading }: {
  booking: ProviderBooking
  onClose: () => void
  onConfirm: (code: string) => void
  onComplete: (code: string) => void
  onCancel: (code: string) => void
  actionLoading: string | null
}) {
  const { t } = useProviderLocale()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(t.dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })

  const name  = booking.user ? `${booking.user.firstName} ${booking.user.lastName}`.trim() : '—'
  const busy  = actionLoading === booking.bookingCode

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-brand-100 text-brand-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const payColors: Record<string, string> = {
    paid:       'bg-green-100 text-green-700',
    unpaid:     'bg-gray-100 text-gray-600',
    authorized: 'bg-brand-100 text-brand-700',
    refunded:   'bg-purple-100 text-purple-700',
    failed:     'bg-red-100 text-red-700',
    partial:    'bg-amber-100 text-amber-700',
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/35 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Booking Details</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.bookingCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColors[booking.bookingStatus] ?? 'bg-gray-100 text-gray-600'}`}>
              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${payColors[booking.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </span>
            <span className="ml-auto text-lg font-bold text-gray-900">
              {formatMoney(booking.totalAmount, booking.currency)}
            </span>
          </div>

          {/* Guest info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Guest</p>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium">{name}</span>
            </div>
            {booking.user?.email && (
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <span className="w-4 shrink-0" />
                <span>{booking.user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Trip info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Trip</p>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="capitalize">{booking.listingType}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Starts {fmtDate(booking.startDate)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Payment</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">{formatMoney(booking.totalAmount, booking.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment status</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payColors[booking.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {(booking.bookingStatus === 'pending' || booking.bookingStatus === 'confirmed') && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-2">
            {booking.bookingStatus === 'pending' && (
              <button
                onClick={() => onConfirm(booking.bookingCode)}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy ? 'Confirming…' : 'Confirm Booking'}
              </button>
            )}
            {booking.bookingStatus === 'confirmed' && (
              <button
                onClick={() => onComplete(booking.bookingCode)}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy ? 'Completing…' : 'Mark as Completed'}
              </button>
            )}
            <button
              onClick={() => onCancel(booking.bookingCode)}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 rounded-xl transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Mobile card list ──────────────────────────────────────────────────────────

function BookingCardList({ bookings, onOpen, onConfirm, onComplete, onCancel, actionLoading }: {
  bookings: ProviderBooking[]
  onOpen: (b: ProviderBooking) => void
  onConfirm: (code: string) => void
  onComplete: (code: string) => void
  onCancel: (code: string) => void
  actionLoading: string | null
}) {
  const { t } = useProviderLocale()

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-brand-100 text-brand-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (bookings.length === 0) return null

  return (
    <div className="space-y-2.5">
      {bookings.map(b => {
        const busy = actionLoading === b.bookingCode
        const name = b.user ? `${b.user.firstName} ${b.user.lastName}`.trim() : '—'
        const sc   = statusColors[b.bookingStatus] ?? 'bg-gray-100 text-gray-600'
        const statusLabel = (t.statusLabels as Record<string, string>)[b.bookingStatus] ?? b.bookingStatus

        return (
          <button
            key={b.id}
            onClick={() => onOpen(b)}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 active:bg-gray-50 transition-colors"
          >
            {/* Row 1: name + status badge */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${sc}`}>
                {statusLabel}
              </span>
            </div>

            {/* Row 2: code + date */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="font-mono">{b.bookingCode}</span>
              <span>·</span>
              <span>{fmtDate(b.startDate)}</span>
              <span>·</span>
              <span>{b.guests} guest{b.guests !== 1 ? 's' : ''}</span>
            </div>

            {/* Row 3: amount + action buttons */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-gray-900">
                {formatMoney(b.totalAmount, b.currency)}
              </span>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                {b.bookingStatus === 'pending' && (
                  <button
                    onClick={() => onConfirm(b.bookingCode)}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50 min-h-[36px]"
                  >
                    {busy ? '…' : t.bookings.confirmBtn}
                  </button>
                )}
                {b.bookingStatus === 'confirmed' && (
                  <button
                    onClick={() => onComplete(b.bookingCode)}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 min-h-[36px]"
                  >
                    {busy ? '…' : t.bookings.completeBtn}
                  </button>
                )}
                {(b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed') && (
                  <button
                    onClick={() => onCancel(b.bookingCode)}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[36px]"
                  >
                    {t.bookings.cancelBtn}
                  </button>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { data: session } = useSession()
  const searchParams      = useSearchParams()
  const statusParam       = searchParams.get('status')
  const { t }             = useProviderLocale()
  const bt                = t.bookings

  const [bookings,      setBookings]      = useState<ProviderBooking[]>([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Drawer state
  const [selected, setSelected] = useState<ProviderBooking | null>(null)

  // Dialogs
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [completeOpen,   setCompleteOpen]   = useState(false)
  const [cancelPrompt,   setCancelPrompt]   = useState(false)
  const [pendingCode,    setPendingCode]    = useState<string | null>(null)

  const codeParam  = searchParams.get('bookingCode')
  const token      = session?.user?.accessToken
  const router     = useRouter()

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  useEffect(() => {
    const v = statusParam?.toLowerCase()
    if (v && isStatusFilter(v)) setStatusFilter(v)
  }, [statusParam])

  // Auto-open drawer when ?bookingCode= is in the URL (linked from overview)
  useEffect(() => {
    if (!codeParam || bookings.length === 0) return
    const match = bookings.find(b => b.bookingCode === codeParam)
    if (match) setSelected(match)
  }, [codeParam, bookings])

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchProviderBookings(token, { status: statusFilter })
      setBookings(result.data)
      setTotal(result.total)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        // Token stale — refresh once before giving up
        const freshToken = await getFreshAccessToken()
        if (!freshToken) { await signOut({ redirect: false }); router.push('/auth/login'); return }
        try {
          const result = await fetchProviderBookings(freshToken, { status: statusFilter })
          setBookings(result.data)
          setTotal(result.total)
        } catch {
          await signOut({ redirect: false }); router.push('/auth/login')
        }
      } else {
        setError(e instanceof Error ? e.message : bt.errorLoading)
      }
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = bookings.filter(b => {
    if (!search) return true
    const s = search.toLowerCase()
    const fullName = b.user ? `${b.user.firstName} ${b.user.lastName}` : ''
    return b.bookingCode.toLowerCase().includes(s) || fullName.toLowerCase().includes(s) || (b.user?.email ?? '').toLowerCase().includes(s)
  })

  // ── Action handlers (called from both table and drawer) ───────────────────

  function requestConfirm(code: string) { setPendingCode(code); setConfirmOpen(true) }
  function requestComplete(code: string) { setPendingCode(code); setCompleteOpen(true) }
  function requestCancel(code: string) { setPendingCode(code); setCancelPrompt(true) }

  async function doConfirm() {
    if (!pendingCode) return
    setConfirmOpen(false)
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setActionLoading(pendingCode)
    try { await confirmProviderBooking(pendingCode, ft); setSelected(null); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null); setPendingCode(null) }
  }

  async function doComplete() {
    if (!pendingCode) return
    setCompleteOpen(false)
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setActionLoading(pendingCode)
    try { await completeProviderBooking(pendingCode, ft); setSelected(null); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null); setPendingCode(null) }
  }

  async function doCancel(reason: string) {
    if (!pendingCode) return
    setCancelPrompt(false)
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setActionLoading(pendingCode)
    try { await cancelProviderBooking(pendingCode, reason, ft); setSelected(null); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null); setPendingCode(null) }
  }

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-brand-100 text-brand-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const columns: Column<ProviderBooking>[] = [
    {
      key: 'bookingCode',
      header: bt.columns.bookingId,
      render: r => <span className="font-mono text-xs text-gray-500">{r.bookingCode}</span>,
    },
    {
      key: 'user',
      header: bt.columns.customer,
      sortable: true,
      render: r => {
        const name  = r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : '—'
        const email = r.user?.email ?? ''
        return <div><p className="font-medium text-gray-900 text-sm">{name}</p><p className="text-xs text-gray-400">{email}</p></div>
      },
    },
    { key: 'listingType', header: bt.columns.type, render: r => <span className="capitalize text-sm">{r.listingType}</span> },
    {
      key: 'startDate',
      header: bt.columns.date,
      sortable: true,
      render: r => <span className="text-sm">{fmtDate(r.startDate)}</span>,
    },
    { key: 'guests', header: bt.columns.guests, render: r => <span className="text-sm">{r.guests}</span> },
    {
      key: 'bookingStatus',
      header: bt.columns.status,
      render: r => {
        const allowed = ['pending', 'confirmed', 'cancelled', 'completed'] as const
        const s = r.bookingStatus as (typeof allowed)[number]
        const label = (t.statusLabels as Record<string, string>)[r.bookingStatus] ?? r.bookingStatus
        return <StatusBadge status={allowed.includes(s) ? s : 'pending'} label={label} />
      },
    },
    {
      key: 'totalAmount',
      header: bt.columns.amount,
      sortable: true,
      render: r => <span className="font-semibold text-gray-900 text-sm">{formatMoney(r.totalAmount, r.currency)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: r => {
        const busy = actionLoading === r.bookingCode
        return (
          <div className="flex gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); setSelected(r) }}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View
            </button>
            {r.bookingStatus === 'pending' && (
              <button
                onClick={e => { e.stopPropagation(); requestConfirm(r.bookingCode) }}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
              >
                {busy ? '…' : bt.confirmBtn}
              </button>
            )}
            {r.bookingStatus === 'confirmed' && (
              <button
                onClick={e => { e.stopPropagation(); requestComplete(r.bookingCode) }}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {busy ? '…' : bt.completeBtn}
              </button>
            )}
            {(r.bookingStatus === 'pending' || r.bookingStatus === 'confirmed') && (
              <button
                onClick={e => { e.stopPropagation(); requestCancel(r.bookingCode) }}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {bt.cancelBtn}
              </button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title={bt.title}
        description={loading ? '…' : bt.totalCount(total)}
        actions={
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {bt.refresh}
          </button>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}
      {!token && !loading && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          {bt.signInNotice}
        </div>
      )}

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={bt.searchPlaceholder}
        filters={[{
          label: bt.columns.status,
          value: statusFilter,
          onChange: (v: string) => { if (isStatusFilter(v)) setStatusFilter(v) },
          options: [
            { label: bt.statusOptions.all,       value: 'all'       },
            { label: bt.statusOptions.pending,   value: 'pending'   },
            { label: bt.statusOptions.confirmed, value: 'confirmed' },
            { label: bt.statusOptions.completed, value: 'completed' },
            { label: bt.statusOptions.cancelled, value: 'cancelled' },
          ],
        }]}
      />

      {/* Mobile card list */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {bt.totalCount(0)}…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title={bt.empty.title} description={bt.empty.description} />
        ) : (
          <BookingCardList
            bookings={filtered}
            onOpen={setSelected}
            onConfirm={requestConfirm}
            onComplete={requestComplete}
            onCancel={requestCancel}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={r => r.id}
          pageSize={10}
          onRowClick={r => setSelected(r)}
          emptyState={
            loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {bt.totalCount(0)}…
              </div>
            ) : (
              <EmptyState icon={BookOpen} title={bt.empty.title} description={bt.empty.description} />
            )
          }
        />
      </div>

      {/* Booking detail drawer */}
      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onConfirm={requestConfirm}
          onComplete={requestComplete}
          onCancel={requestCancel}
          actionLoading={actionLoading}
        />
      )}

      {/* Confirm booking dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm this booking?"
        description="The guest will be notified that their booking is confirmed."
        confirmLabel="Confirm Booking"
        onConfirm={doConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingCode(null) }}
      />

      {/* Complete booking dialog */}
      <ConfirmDialog
        open={completeOpen}
        title="Mark booking as completed?"
        description="This marks the trip as finished. This action cannot be undone."
        confirmLabel="Mark Completed"
        onConfirm={doComplete}
        onCancel={() => { setCompleteOpen(false); setPendingCode(null) }}
      />

      {/* Cancel booking prompt */}
      <PromptDialog
        open={cancelPrompt}
        title="Cancel this booking"
        description="Please provide a reason for cancellation. The guest will be notified."
        placeholder="e.g. Tour dates no longer available due to weather conditions"
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        required
        onConfirm={doCancel}
        onCancel={() => { setCancelPrompt(false); setPendingCode(null) }}
      />
    </div>
  )
}
