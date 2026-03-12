'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { TableToolbar } from '@/components/dashboard/ui/TableToolbar'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import {
  fetchProviderBookings,
  confirmProviderBooking,
  completeProviderBooking,
  cancelProviderBooking,
  type ProviderBooking,
} from '@/lib/api/provider'

export default function BookingsPage() {
  const { data: session } = useSession()

  const [bookings,      setBookings]      = useState<ProviderBooking[]>([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const token = session?.user?.accessToken

  // ── Fetch bookings ────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchProviderBookings(token, { status: statusFilter })
      setBookings(result.data)
      setTotal(result.total)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter])

  useEffect(() => { load() }, [load])

  // ── Client-side search filter ─────────────────────────────────────────
  const filtered = bookings.filter(b => {
    if (!search) return true
    const s = search.toLowerCase()
    const fullName = b.user ? `${b.user.firstName} ${b.user.lastName}` : ''
    return (
      b.bookingCode.toLowerCase().includes(s) ||
      fullName.toLowerCase().includes(s) ||
      (b.user?.email ?? '').toLowerCase().includes(s)
    )
  })

  // ── Actions ──────────────────────────────────────────────────────────
  async function handleConfirm(code: string) {
    if (!token) return
    setActionLoading(code)
    try {
      await confirmProviderBooking(code, token)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete(code: string) {
    if (!token) return
    setActionLoading(code)
    try {
      await completeProviderBooking(code, token)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel(code: string) {
    if (!token) return
    const reason = window.prompt('Reason for cancellation:')
    if (!reason) return
    setActionLoading(code)
    try {
      await cancelProviderBooking(code, reason, token)
      await load()
    } finally {
      setActionLoading(null)
    }
  }

  // ── Columns ──────────────────────────────────────────────────────────
  const columns: Column<ProviderBooking>[] = [
    {
      key: 'bookingCode',
      header: 'Booking ID',
      render: r => <span className="font-mono text-xs text-gray-500">{r.bookingCode}</span>,
    },
    {
      key: 'user',
      header: 'Customer',
      sortable: true,
      render: r => {
        const name  = r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : '—'
        const email = r.user?.email ?? ''
        return (
          <div>
            <p className="font-medium text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
        )
      },
    },
    { key: 'listingType', header: 'Type', render: r => <span className="capitalize">{r.listingType}</span> },
    {
      key: 'startDate',
      header: 'Date',
      sortable: true,
      render: r => new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    { key: 'guests', header: 'Guests', render: r => `${r.guests}` },
    { key: 'bookingStatus',  header: 'Status',  render: r => <StatusBadge status={r.bookingStatus as any} /> },
    { key: 'paymentStatus',  header: 'Payment', render: r => <StatusBadge status={r.paymentStatus as any} /> },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: r => (
        <span className="font-semibold text-gray-900">
          {r.currency} {r.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: r => {
        const busy = actionLoading === r.bookingCode
        return (
          <div className="flex gap-1">
            {r.bookingStatus === 'pending' && (
              <button
                onClick={() => handleConfirm(r.bookingCode)}
                disabled={busy}
                className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {busy ? '…' : 'Confirm'}
              </button>
            )}
            {r.bookingStatus === 'confirmed' && (
              <button
                onClick={() => handleComplete(r.bookingCode)}
                disabled={busy}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {busy ? '…' : 'Complete'}
              </button>
            )}
            {(r.bookingStatus === 'pending' || r.bookingStatus === 'confirmed') && (
              <button
                onClick={() => handleCancel(r.bookingCode)}
                disabled={busy}
                className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        )
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Bookings"
        description={loading ? 'Loading…' : `${total} booking${total !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Unauthenticated notice */}
      {!token && !loading && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Sign in as a provider to see your bookings.
        </div>
      )}

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer name or booking ID…"
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status',   value: 'all'       },
              { label: 'Pending',      value: 'pending'   },
              { label: 'Confirmed',    value: 'confirmed' },
              { label: 'Completed',    value: 'completed' },
              { label: 'Cancelled',    value: 'cancelled' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={r => r.id}
        pageSize={10}
        emptyState={
          loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading bookings…
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No bookings found"
              description="Bookings will appear here once customers reserve your services."
            />
          )
        }
      />
    </div>
  )
}
