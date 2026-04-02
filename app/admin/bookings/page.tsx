'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Search, ChevronLeft, ChevronRight, X, MapPin, Users, Calendar } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { fetchAdminBookings } from '@/lib/api/admin'
import type { AdminBooking } from '@/lib/api/admin'
import { useAdminLocale } from '@/lib/i18n/admin/context'

// ── Status badge ──────────────────────────────────────────────────────────────

const statusBgCls: Record<string, { cls: string; dotCls: string }> = {
  pending:   { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotCls: 'bg-yellow-400 animate-pulse' },
  confirmed: { cls: 'bg-green-50 text-green-700 border-green-200',   dotCls: 'bg-green-500' },
  cancelled: { cls: 'bg-red-50 text-red-700 border-red-200',         dotCls: 'bg-red-500' },
  completed: { cls: 'bg-blue-50 text-blue-700 border-blue-200',      dotCls: 'bg-blue-500' },
}

const paymentBgCls: Record<string, string> = {
  unpaid:     'bg-gray-50 text-gray-500 border-gray-200',
  authorized: 'bg-blue-50 text-blue-600 border-blue-200',
  paid:       'bg-green-50 text-green-700 border-green-200',
  refunded:   'bg-purple-50 text-purple-700 border-purple-200',
  failed:     'bg-red-50 text-red-600 border-red-200',
}

function BookingStatusBadge({ status, label }: { status: string; label: string }) {
  const cfg = statusBgCls[status]
    ?? { cls: 'bg-gray-50 text-gray-500 border-gray-200', dotCls: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      {label}
    </span>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function BookingDetailPanel({
  booking,
  onClose,
}: {
  booking: AdminBooking
  onClose: () => void
}) {
  const { t } = useAdminLocale()
  const tb    = t.bookings

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  function fmtMoney(amount: number, currency = 'USD') {
    return new Intl.NumberFormat(t.dateLocale, {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(amount)
  }

  const bsc = statusBgCls[booking.bookingStatus]
    ?? { cls: 'bg-gray-50 text-gray-500 border-gray-200', dotCls: 'bg-gray-400' }
  const bLabel = (tb.statusLabels as Record<string, string>)[booking.bookingStatus]
    ?? booking.bookingStatus
  const pLabel = (tb.paymentLabels as Record<string, string>)[booking.paymentStatus]
    ?? booking.paymentStatus
  const pCls = paymentBgCls[booking.paymentStatus] ?? 'bg-gray-50 text-gray-500 border-gray-200'
  const typeLabel = (tb.listingTypeLabels as Record<string, string>)[booking.listingType]
    ?? booking.listingType
  const listingTitle =
    (booking.listingSnapshot as any)?.title ?? (booking.listingSnapshot as any)?.name ?? '—'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              {tb.detail.bookingLabel}
            </p>
            <h2 className="text-base font-bold text-gray-900 font-mono">{booking.bookingCode}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <BookingStatusBadge status={booking.bookingStatus} label={bLabel} />
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${pCls}`}>
              {pLabel}
            </span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
              {typeLabel}
            </span>
          </div>

          {/* Listing */}
          {listingTitle !== '—' && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tb.detail.listing}
              </p>
              <p className="text-sm font-medium text-gray-900">{listingTitle}</p>
            </div>
          )}

          {/* Traveler */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tb.detail.traveler}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {booking.travelerFullName ?? `${booking.user.firstName} ${booking.user.lastName}`}
            </p>
            <p className="text-xs text-gray-500">{booking.travelerEmail ?? booking.user.email}</p>
          </div>

          {/* Provider */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tb.detail.provider}
            </p>
            <p className="text-sm font-medium text-gray-900">{booking.provider.name}</p>
          </div>

          {/* Dates + guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {booking.listingType === 'accommodation'
                  ? tb.detail.checkIn
                  : tb.detail.departure}
              </p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-900">{fmtDate(booking.startDate)}</p>
              </div>
              {booking.endDate && (
                <p className="text-xs text-gray-500 mt-0.5">→ {fmtDate(booking.endDate)}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tb.detail.guests}
              </p>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-900">
                  {t.common.guestCount(booking.guests)}
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tb.detail.total}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {fmtMoney(booking.totalAmount, booking.currency)}
            </p>
          </div>

          {/* Special requests */}
          {booking.specialRequests && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tb.detail.specialRequests}
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* IDs */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <p className="text-[10px] text-gray-400">
              {tb.detail.bookingId} <span className="font-mono">{booking.id}</span>
            </p>
            <p className="text-[10px] text-gray-400">
              {tb.detail.created} {fmtDate(booking.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBookingsPage() {
  const { data: session } = useSession()
  const token             = session?.user?.accessToken
  const { t }             = useAdminLocale()
  const tb                = t.bookings

  const [bookings,      setBookings]      = useState<AdminBooking[]>([])
  const [total,         setTotal]         = useState(0)
  const [pages,         setPages]         = useState(1)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const debouncedSearch                   = useDebounce(search, 300)
  const [statusFilter,  setStatusFilter]  = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')
  const [page,          setPage]          = useState(1)
  const [selected,      setSelected]      = useState<AdminBooking | null>(null)

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const LIMIT = 25

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  function fmtMoney(amount: number, currency = 'USD') {
    return new Intl.NumberFormat(t.dateLocale, {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(amount)
  }

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminBookings(
        {
          search:      debouncedSearch || undefined,
          status:      statusFilter    || undefined,
          listingType: typeFilter      || undefined,
          page,
          limit: LIMIT,
        },
        token,
      )
      setBookings(result.data)
      setTotal(result.pagination.total)
      setPages(result.pagination.pages)
    } catch (e: any) {
      setError(e?.message ?? tb.errorLoading)
    } finally {
      setLoading(false)
    }
  }, [token, debouncedSearch, statusFilter, typeFilter, page])

  useEffect(() => { load() }, [load])

  const statusLabel = (s: string) =>
    (tb.statusLabels as Record<string, string>)[s] ?? s
  const typeLabel = (s: string) =>
    (tb.listingTypeLabels as Record<string, string>)[s] ?? s

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{tb.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tb.totalBookings(total)}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={tb.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">{tb.statusFilter.all}</option>
          <option value="pending">{tb.statusFilter.pending}</option>
          <option value="confirmed">{tb.statusFilter.confirmed}</option>
          <option value="completed">{tb.statusFilter.completed}</option>
          <option value="cancelled">{tb.statusFilter.cancelled}</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">{tb.typeFilter.all}</option>
          <option value="tour">{tb.typeFilter.tour}</option>
          <option value="vehicle">{tb.typeFilter.vehicle}</option>
          <option value="accommodation">{tb.typeFilter.accommodation}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{tb.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tb.table.code}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tb.table.traveler}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">{tb.table.provider}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{tb.table.type}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tb.table.status}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{tb.table.amount}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">{tb.table.date}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-800">{b.bookingCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                        {b.travelerFullName ?? `${b.user.firstName} ${b.user.lastName}`}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">
                        {b.travelerEmail ?? b.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[120px]">{b.provider.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {typeLabel(b.listingType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.bookingStatus} label={statusLabel(b.bookingStatus)} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtMoney(b.totalAmount, b.currency)}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(b.startDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(b)}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {t.common.details}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500 text-xs">
              {t.common.pageInfo(page, pages, total)}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <BookingDetailPanel booking={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
