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
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  fetchAdminPricingHealth,
  fetchAdminBackfillReports,
  resolveAdminBackfillReport,
  type PricingHealthOverview,
  type BackfillReport,
} from '@/lib/api/admin'
import { AlertTriangle, CheckCircle2, Clock, CircleDot, ArrowLeftRight } from 'lucide-react'
import { formatMoney, isSupportedCurrency, type Currency } from '@/lib/money'
import { useAdminLocale } from '@/lib/i18n/admin/context'
import type { AdminPricingHealthMessages } from '@/lib/i18n/messages/adminOperatorTools'

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

function fmtAge(seconds: number | null, af: AdminPricingHealthMessages['ageFmt']): string {
  if (seconds == null) return '—'
  if (seconds < 60) return af.sec(seconds)
  if (seconds < 3600) return af.min(Math.round(seconds / 60))
  if (seconds < 86400) return af.hour(Math.round(seconds / 3600))
  return af.day(Math.round(seconds / 86400))
}

function formatAmount(cur: string, amt: number): string {
  const c: Currency = isSupportedCurrency(cur) ? cur : 'MNT'
  return formatMoney(amt, c)
}

export default function AdminPricingHealthPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const { t } = useAdminLocale()
  const ph = t.pricingHealth

  const [data,    setData]    = useState<PricingHealthOverview | null>(null)
  const [backfill, setBackfill] = useState<BackfillReport[] | null>(null)
  const [backfillCounts, setBackfillCounts] = useState<Record<string, { total: number; unresolved: number }> | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  async function handleResolve(reportId: string) {
    if (!token) return
    if (!window.confirm(ph.backfill.confirmResolve)) return
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
      alert(e?.message ?? ph.resolveFailed)
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
      .catch((e) => setError(e?.message ?? ph.errorLoad))
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
        <p className="text-sm text-red-700 font-medium">{error ?? ph.noData}</p>
      </div>
    )
  }

  const staleRates = data.fxRates.filter((r) => r.status === 'stale').length
  const missingRates = data.fxRates.filter((r) => r.status === 'missing').length
  const usdToMnt = data.fxRates.find((r) => r.fromCurrency === 'USD' && r.toCurrency === 'MNT')
  const usdToMntTone: 'ok' | 'warn' | 'err' =
    !usdToMnt || usdToMnt.status === 'missing'
      ? 'err'
      : usdToMnt.status === 'stale'
        ? 'warn'
        : 'ok'
  const anyListingMissing =
    data.missingNormalization.tours + data.missingNormalization.rooms + data.missingNormalization.vehicles

  const atStr = new Date(data.generatedAt).toLocaleString(t.dateLocale, { dateStyle: 'medium', timeStyle: 'short' })
  const procStatusLabel = (s: string) =>
    (ph.processorStatus as Record<string, string>)[s] ?? s
  const reasonLabel = (code: string) =>
    (ph.reasonCode as Record<string, string>)[code] ?? code
  const backfillCategoryLabel = (c: string) =>
    (ph.backfill.category as Record<string, string>)[c] ?? c

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{ph.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {ph.subtitle(atStr)}
        </p>
      </div>

      {/* Headline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">{ph.kpi.fxIssues}</p>
          <p className="text-2xl font-bold text-gray-900">{staleRates + missingRates}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {ph.kpi.staleMissing(staleRates, missingRates)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">{ph.kpi.listingsNorm}</p>
          <p className="text-2xl font-bold text-gray-900">{anyListingMissing}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {ph.kpi.tourRoomVeh(
              data.missingNormalization.tours,
              data.missingNormalization.rooms,
              data.missingNormalization.vehicles,
            )}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">{ph.kpi.paymentBlocked}</p>
          <p className="text-2xl font-bold text-gray-900">{data.paymentBlockedBookings.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">{ph.kpi.nonMntNote}</p>
        </div>
      </div>

      {/* Processors */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{ph.sectionProcessors}</h2>
        <ul className="space-y-2">
          {data.processors.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-500">{p.constraintNote ?? '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={p.status === 'live' ? 'ok' : p.status === 'planned' ? 'info' : 'warn'}>
                  {procStatusLabel(p.status)}
                </Badge>
                <span className="text-xs text-gray-500">{p.supportedCurrencies.join(', ')}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FX summary → link into the admin-managed FX page */}
      <Link
        href="/admin/fx-rates"
        className="block rounded-xl border border-gray-100 bg-white p-4 hover:border-amber-200 hover:bg-amber-50/40 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{ph.usdMnt.title}</p>
              <p className="text-xs text-gray-500 truncate">
                {usdToMnt?.rate != null ? `${usdToMnt.rate}` : '—'}
                {' · '}
                {usdToMnt?.source ?? ph.usdMnt.noSource}
                {' · '}
                {ph.usdMnt.updated(fmtAge(usdToMnt?.ageSeconds ?? null, ph.ageFmt))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {usdToMntTone === 'ok'   && <Badge tone="ok"><CheckCircle2 className="w-3 h-3" />{ph.fxBadge.fresh}</Badge>}
            {usdToMntTone === 'warn' && <Badge tone="warn"><Clock className="w-3 h-3" />{ph.fxBadge.stale}</Badge>}
            {usdToMntTone === 'err'  && <Badge tone="err"><AlertTriangle className="w-3 h-3" />{ph.fxBadge.missing}</Badge>}
            <span className="text-xs text-amber-700 font-medium">{ph.usdMnt.manage}</span>
          </div>
        </div>
      </Link>

      {/* FX rates */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{ph.sectionFxRates}</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase tracking-wide">
            <tr className="text-left">
              <th className="py-2 pr-4">{ph.table.pair}</th>
              <th className="py-2 pr-4">{ph.table.rate}</th>
              <th className="py-2 pr-4">{ph.table.source}</th>
              <th className="py-2 pr-4">{ph.table.age}</th>
              <th className="py-2 pr-4">{ph.table.status}</th>
            </tr>
          </thead>
          <tbody>
            {data.fxRates.map((r) => (
              <tr key={`${r.fromCurrency}-${r.toCurrency}`} className="border-t border-gray-50">
                <td className="py-2 pr-4 font-mono text-xs text-gray-800">{r.fromCurrency} → {r.toCurrency}</td>
                <td className="py-2 pr-4">{r.rate != null ? r.rate.toFixed(4) : '—'}</td>
                <td className="py-2 pr-4 text-xs text-gray-500">{r.source ?? '—'}</td>
                <td className="py-2 pr-4 text-xs text-gray-500">{fmtAge(r.ageSeconds, ph.ageFmt)}</td>
                <td className="py-2 pr-4">
                  {r.status === 'ok'   && <Badge tone="ok"><CheckCircle2 className="w-3 h-3" />{ph.fxBadge.ok}</Badge>}
                  {r.status === 'stale' && <Badge tone="warn"><Clock className="w-3 h-3" />{ph.fxBadge.stale}</Badge>}
                  {r.status === 'missing' && <Badge tone="err"><AlertTriangle className="w-3 h-3" />{ph.fxBadge.missing}</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Currency distribution */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{ph.sectionCurrency}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{ph.currencyListings}</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(data.currencyDistribution.listings.tours).map(([cur, n]) => (
                <li key={`t-${cur}`} className="flex justify-between"><span>{ph.listingRow('tour', cur)}</span><span>{n}</span></li>
              ))}
              {Object.entries(data.currencyDistribution.listings.rooms).map(([cur, n]) => (
                <li key={`r-${cur}`} className="flex justify-between"><span>{ph.listingRow('room', cur)}</span><span>{n}</span></li>
              ))}
              {Object.entries(data.currencyDistribution.listings.vehicles).map(([cur, n]) => (
                <li key={`v-${cur}`} className="flex justify-between"><span>{ph.listingRow('vehicle', cur)}</span><span>{n}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{ph.currencyBookings}</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(data.currencyDistribution.bookings.byChargeCurrency).map(([cur, v]) => (
                <li key={`b-${cur}`} className="flex justify-between">
                  <span>{cur}</span>
                  <span className="text-gray-600">{ph.bookingStats(v.count, formatAmount(cur, v.totalAmount))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Payment-blocked bookings */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{ph.payBlocked.title}</h2>
          <Badge tone={data.paymentBlockedBookings.length ? 'warn' : 'ok'}>
            {ph.payBlocked.open(data.paymentBlockedBookings.length)}
          </Badge>
        </div>
        {data.paymentBlockedBookings.length === 0 ? (
          <p className="text-sm text-gray-500">{ph.payBlocked.empty}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wide">
              <tr className="text-left">
                <th className="py-2 pr-4">{ph.payBlocked.colBooking}</th>
                <th className="py-2 pr-4">{ph.payBlocked.colCurrency}</th>
                <th className="py-2 pr-4">{ph.payBlocked.colAmount}</th>
                <th className="py-2 pr-4">{ph.payBlocked.colReason}</th>
                <th className="py-2 pr-4">{ph.payBlocked.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {data.paymentBlockedBookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs">{b.bookingCode}</td>
                  <td className="py-2 pr-4">{b.currency}</td>
                  <td className="py-2 pr-4">{formatAmount(b.currency, b.totalAmount)}</td>
                  <td className="py-2 pr-4"><Badge tone="warn">{reasonLabel(b.reasonCode)}</Badge></td>
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
          <h2 className="text-sm font-semibold text-gray-900">{ph.backfill.title}</h2>
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
          <p className="text-sm text-gray-500">{ph.backfill.allResolved}</p>
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
                    {backfillCategoryLabel(r.category)}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleResolve(r.id)}
                    disabled={resolvingId === r.id}
                    className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    title={ph.backfill.closeTooltip}
                  >
                    {resolvingId === r.id ? ph.backfill.resolving : ph.backfill.markResolved}
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
