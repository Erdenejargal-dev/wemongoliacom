'use client'

/**
 * app/admin/pricing-health/page.tsx
 *
 * Phase 3 — ops visibility into pricing/FX integrity.
 *
 * Single-screen read-only dashboard that surfaces:
 *   1. Payment processor registry + Bonum MNT-only constraint
 *   2. FX rate freshness (per supported pair)
 *   3. Currency distribution across listings and bookings
 *   4. Listings missing normalizedAmountMnt
 *   5. Bookings blocked from payment because the current gateway can't
 *      settle their currency (today: non-MNT bookings)
 *
 * No repair actions here — this is an inspection surface. Repairs live in
 * explicit, guarded scripts/endpoints (see: `utils/fx.ts#createFxRate`).
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  fetchAdminPricingHealth,
  fetchAdminBackfillReports,
  resolveAdminBackfillReport,
  type PricingHealthOverview,
  type BackfillReport,
} from '@/lib/api/admin'
import { AlertTriangle, CheckCircle2, Clock, CircleDot } from 'lucide-react'
import { formatMoney, isSupportedCurrency, type Currency } from '@/lib/money'

function Badge({ children, tone }: { children: React.ReactNode; tone: 'ok' | 'warn' | 'err' | 'info' }) {
  const cls =
    tone === 'ok'   ? 'bg-green-50 text-green-700 border-green-200'
    : tone === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : tone === 'err'  ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {children}
    </span>
  )
}

function fmtAge(seconds: number | null): string {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`
  return `${Math.round(seconds / 86400)}d`
}

function formatAmount(cur: string, amt: number): string {
  const c: Currency = isSupportedCurrency(cur) ? cur : 'MNT'
  return formatMoney(amt, c)
}

export default function AdminPricingHealthPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [data,    setData]    = useState<PricingHealthOverview | null>(null)
  const [backfill, setBackfill] = useState<BackfillReport[] | null>(null)
  const [backfillCounts, setBackfillCounts] = useState<Record<string, { total: number; unresolved: number }> | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  async function handleResolve(reportId: string) {
    if (!token) return
    if (!window.confirm('Close this backfill report? This only marks the ticket resolved — it does NOT modify the flagged row.')) return
    try {
      setResolvingId(reportId)
      await resolveAdminBackfillReport(reportId, token)
      setBackfill((prev) => (prev ? prev.filter((r) => r.id !== reportId) : prev))
      setBackfillCounts((prev) => {
        if (!prev) return prev
        const next = { ...prev }
        const current = backfill?.find((r) => r.id === reportId)
        if (current?.category && next[current.category]) {
          next[current.category] = {
            total:      next[current.category].total,
            unresolved: Math.max(0, next[current.category].unresolved - 1),
          }
        }
        return next
      })
    } catch (e: any) {
      alert(e?.message ?? 'Failed to resolve report')
    } finally {
      setResolvingId(null)
    }
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      fetchAdminPricingHealth(token),
      fetchAdminBackfillReports({ resolved: false, limit: 50 }, token),
    ])
      .then(([overview, bf]) => {
        setData(overview)
        setBackfill(bf.data)
        setBackfillCounts(bf.categoryCounts)
      })
      .catch((e) => setError(e?.message ?? 'Failed to load pricing health'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700 font-medium">{error ?? 'No data'}</p>
      </div>
    )
  }

  const staleRates = data.fxRates.filter((r) => r.status === 'stale').length
  const missingRates = data.fxRates.filter((r) => r.status === 'missing').length
  const anyListingMissing =
    data.missingNormalization.tours + data.missingNormalization.rooms + data.missingNormalization.vehicles

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pricing & FX Health</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Read-only diagnostics. Updated {new Date(data.generatedAt).toLocaleString()}.
        </p>
      </div>

      {/* Headline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">FX rate issues</p>
          <p className="text-2xl font-bold text-gray-900">{staleRates + missingRates}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {staleRates} stale · {missingRates} missing
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Listings missing normalization</p>
          <p className="text-2xl font-bold text-gray-900">{anyListingMissing}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {data.missingNormalization.tours} tours · {data.missingNormalization.rooms} rooms · {data.missingNormalization.vehicles} vehicles
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Payment-blocked bookings</p>
          <p className="text-2xl font-bold text-gray-900">{data.paymentBlockedBookings.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Non-MNT with Bonum-only rail.</p>
        </div>
      </div>

      {/* Processors */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment processors</h2>
        <ul className="space-y-2">
          {data.processors.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-500">{p.constraintNote ?? '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={p.status === 'live' ? 'ok' : p.status === 'planned' ? 'info' : 'warn'}>
                  {p.status}
                </Badge>
                <span className="text-xs text-gray-500">{p.supportedCurrencies.join(', ')}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FX rates */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">FX rates</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase tracking-wide">
            <tr className="text-left">
              <th className="py-2 pr-4">Pair</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Age</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.fxRates.map((r) => (
              <tr key={`${r.fromCurrency}-${r.toCurrency}`} className="border-t border-gray-50">
                <td className="py-2 pr-4 font-mono text-xs text-gray-800">{r.fromCurrency} → {r.toCurrency}</td>
                <td className="py-2 pr-4">{r.rate != null ? r.rate.toFixed(4) : '—'}</td>
                <td className="py-2 pr-4 text-xs text-gray-500">{r.source ?? '—'}</td>
                <td className="py-2 pr-4 text-xs text-gray-500">{fmtAge(r.ageSeconds)}</td>
                <td className="py-2 pr-4">
                  {r.status === 'ok'   && <Badge tone="ok"><CheckCircle2 className="w-3 h-3" /> ok</Badge>}
                  {r.status === 'stale' && <Badge tone="warn"><Clock className="w-3 h-3" /> stale</Badge>}
                  {r.status === 'missing' && <Badge tone="err"><AlertTriangle className="w-3 h-3" /> missing</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Currency distribution */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Currency distribution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Listings</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(data.currencyDistribution.listings.tours).map(([cur, n]) => (
                <li key={`t-${cur}`} className="flex justify-between"><span>Tours ({cur})</span><span>{n}</span></li>
              ))}
              {Object.entries(data.currencyDistribution.listings.rooms).map(([cur, n]) => (
                <li key={`r-${cur}`} className="flex justify-between"><span>Rooms ({cur})</span><span>{n}</span></li>
              ))}
              {Object.entries(data.currencyDistribution.listings.vehicles).map(([cur, n]) => (
                <li key={`v-${cur}`} className="flex justify-between"><span>Vehicles ({cur})</span><span>{n}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bookings by charge currency</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(data.currencyDistribution.bookings.byChargeCurrency).map(([cur, v]) => (
                <li key={`b-${cur}`} className="flex justify-between">
                  <span>{cur}</span>
                  <span className="text-gray-600">{v.count} bookings · {formatAmount(cur, v.totalAmount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Payment-blocked bookings */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Payment-blocked bookings</h2>
          <Badge tone={data.paymentBlockedBookings.length ? 'warn' : 'ok'}>
            {data.paymentBlockedBookings.length} open
          </Badge>
        </div>
        {data.paymentBlockedBookings.length === 0 ? (
          <p className="text-sm text-gray-500">None — every open booking can be charged by a live processor.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wide">
              <tr className="text-left">
                <th className="py-2 pr-4">Booking</th>
                <th className="py-2 pr-4">Currency</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.paymentBlockedBookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs">{b.bookingCode}</td>
                  <td className="py-2 pr-4">{b.currency}</td>
                  <td className="py-2 pr-4">{formatAmount(b.currency, b.totalAmount)}</td>
                  <td className="py-2 pr-4"><Badge tone="warn">{b.reasonCode}</Badge></td>
                  <td className="py-2 pr-4 text-xs text-gray-500">{b.paymentStatus} · {b.bookingStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Backfill reports */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Unresolved backfill reports</h2>
          {backfillCounts && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CircleDot className="w-3 h-3" />
              {Object.entries(backfillCounts)
                .map(([k, v]) => `${k}: ${v.unresolved}/${v.total}`)
                .join(' · ')}
            </div>
          )}
        </div>
        {!backfill || backfill.length === 0 ? (
          <p className="text-sm text-gray-500">All backfill reports resolved.</p>
        ) : (
          <ul className="divide-y divide-gray-50 text-sm">
            {backfill.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-gray-800">{r.entityType}:{r.entityId}</p>
                  <p className="text-gray-600 truncate">{r.issue}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={r.category === 'missing_fx_rate' ? 'err' : r.category === 'legacy_currency' ? 'warn' : 'info'}>
                    {r.category}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleResolve(r.id)}
                    disabled={resolvingId === r.id}
                    className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    title="Close the report only. Does not modify the flagged row."
                  >
                    {resolvingId === r.id ? 'Resolving…' : 'Mark resolved'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
