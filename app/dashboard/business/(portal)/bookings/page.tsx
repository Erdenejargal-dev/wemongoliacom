'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useProviderLocale } from '@/lib/i18n/provider/context'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
const STATUS_VALUES: StatusFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
function isStatusFilter(v: string): v is StatusFilter { return (STATUS_VALUES as string[]).includes(v) }

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

  const token  = session?.user?.accessToken
  const router = useRouter()

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  useEffect(() => {
    const v = statusParam?.toLowerCase()
    if (v && isStatusFilter(v)) setStatusFilter(v)
  }, [statusParam])

  const load = useCallback(async () => {
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchProviderBookings(freshToken, { status: statusFilter })
      setBookings(result.data)
      setTotal(result.total)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.errorLoading)
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

  async function handleConfirm(code: string) {
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setActionLoading(code)
    try { await confirmProviderBooking(code, ft); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null) }
  }

  async function handleComplete(code: string) {
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setActionLoading(code)
    try { await completeProviderBooking(code, ft); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null) }
  }

  async function handleCancel(code: string) {
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    const reason = window.prompt(bt.cancellationPrompt)
    if (!reason) return
    setActionLoading(code)
    try { await cancelProviderBooking(code, reason, ft); await load() }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : bt.actionFailed)
    } finally { setActionLoading(null) }
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
    { key: 'listingType', header: bt.columns.type,   render: r => <span className="capitalize">{r.listingType}</span> },
    {
      key: 'startDate',
      header: bt.columns.date,
      sortable: true,
      render: r => fmtDate(r.startDate),
    },
    { key: 'guests',  header: bt.columns.guests,  render: r => `${r.guests}` },
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
      key: 'paymentStatus',
      header: bt.columns.payment,
      render: r => {
        const allowed = ['unpaid', 'authorized', 'paid', 'refunded', 'failed', 'partial'] as const
        const s = r.paymentStatus as (typeof allowed)[number]
        const label = (t.paymentLabels as Record<string, string>)[r.paymentStatus] ?? r.paymentStatus
        return <StatusBadge status={allowed.includes(s) ? s : 'unpaid'} label={label} />
      },
    },
    {
      key: 'totalAmount',
      header: bt.columns.amount,
      sortable: true,
      render: r => <span className="font-semibold text-gray-900">{r.currency} {r.totalAmount.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: r => {
        const busy = actionLoading === r.bookingCode
        return (
          <div className="flex gap-1">
            {r.bookingStatus === 'pending' && (
              <button onClick={() => handleConfirm(r.bookingCode)} disabled={busy}
                className="px-2 py-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50">
                {busy ? '…' : bt.confirmBtn}
              </button>
            )}
            {r.bookingStatus === 'confirmed' && (
              <button onClick={() => handleComplete(r.bookingCode)} disabled={busy}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                {busy ? '…' : bt.completeBtn}
              </button>
            )}
            {(r.bookingStatus === 'pending' || r.bookingStatus === 'confirmed') && (
              <button onClick={() => handleCancel(r.bookingCode)} disabled={busy}
                className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
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

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={r => r.id}
        pageSize={10}
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
  )
}
