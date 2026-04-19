'use client'

/**
 * app/admin/fx-rates/page.tsx
 *
 * Phase 6 (MVP) — admin-managed FX rates.
 *
 * WHY THIS PAGE EXISTS
 *   Non-MNT bookings (currently USD listings) are converted to MNT at
 *   payment initiation so Bonum — the only live gateway, MNT-only — can
 *   settle them. That conversion reads the most recent FxRate row whose
 *   `effectiveFrom <= now` via `backend/src/utils/fx.ts#getActiveRate`.
 *   Before Phase 6, the only way to populate that table was the
 *   `seed:fx` CLI. In production that meant the payment flow could fail
 *   with "FX rate unavailable for USD→MNT" and nobody could fix it
 *   without shell access. This page is the operator-facing fix: admins
 *   can add a rate, see the active rate, see history, and see freshness
 *   warnings — all from the dashboard.
 *
 * WHAT THIS PAGE DOES NOT DO
 *   - It does NOT edit or delete existing rows. FxRate is append-only
 *     by design so payment snapshots remain reproducible. Corrections
 *     are a new row with a later `effectiveFrom`.
 *   - It does NOT recalculate any booking or payment. Existing payment
 *     snapshots persist the rate that was used at the time.
 *   - It does NOT invent a fallback rate. If the pair is missing, the
 *     page surfaces that loudly — payments will keep failing until an
 *     admin adds one here.
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  fetchAdminFxRates,
  createAdminFxRate,
  fetchAdminFxRateHealth,
  type AdminFxRate,
  type FxRateHealth,
} from '@/lib/api/admin'
import { AlertTriangle, CheckCircle2, Clock, ArrowLeftRight, Info } from 'lucide-react'

type Pair = 'USD->MNT' | 'MNT->USD'

const SUPPORTED_PAIRS: Array<{ from: 'USD' | 'MNT'; to: 'USD' | 'MNT'; label: Pair }> = [
  { from: 'USD', to: 'MNT', label: 'USD->MNT' },
  { from: 'MNT', to: 'USD', label: 'MNT->USD' },
]

const DEFAULT_SOURCE = 'admin_manual'
const STALE_WARN_SECONDS = 24 * 60 * 60  // amber after 24h
const STALE_ERR_SECONDS  = 48 * 60 * 60  // red after 48h

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'ok' | 'warn' | 'err' | 'info'
}) {
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
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.round(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`
  return `${Math.round(seconds / 86400)}d ago`
}

/** Pick a health tone from freshness, with softer thresholds than the
 *  backend so the admin sees a warning before the payment system is at
 *  risk of a full outage. */
function healthTone(h: FxRateHealth): 'ok' | 'warn' | 'err' {
  if (h.status === 'missing')              return 'err'
  if (h.ageSeconds == null)                return 'warn'
  if (h.ageSeconds > STALE_ERR_SECONDS)    return 'err'
  if (h.ageSeconds > STALE_WARN_SECONDS)   return 'warn'
  return 'ok'
}

export default function AdminFxRatesPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [history, setHistory] = useState<AdminFxRate[] | null>(null)
  const [health,  setHealth]  = useState<FxRateHealth[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // Create form
  const [pair,   setPair]   = useState<Pair>('USD->MNT')
  const [rate,   setRate]   = useState<string>('')
  const [source, setSource] = useState<string>(DEFAULT_SOURCE)
  const [note,   setNote]   = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState<string | null>(null)
  const [formOk,     setFormOk]     = useState<string | null>(null)

  async function reload() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const [list, hx] = await Promise.all([
        fetchAdminFxRates({ limit: 50 }, token),
        fetchAdminFxRateHealth(token),
      ])
      setHistory(list.data)
      setHealth(hx.rates)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load FX rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // Re-run once we get a token after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const usdToMnt = useMemo(
    () => health?.find((r) => r.fromCurrency === 'USD' && r.toCurrency === 'MNT'),
    [health],
  )
  const mntToUsd = useMemo(
    () => health?.find((r) => r.fromCurrency === 'MNT' && r.toCurrency === 'USD'),
    [health],
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    setFormOk(null)

    const parsed = Number(rate)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFormError('Rate must be a positive number.')
      return
    }
    const pairDef = SUPPORTED_PAIRS.find((p) => p.label === pair)!
    const sanity = pairDef.from === 'USD' && pairDef.to === 'MNT'
      ? parsed < 100 || parsed > 100000
      : pairDef.from === 'MNT' && pairDef.to === 'USD'
        ? parsed < 1 / 100000 || parsed > 1 / 100
        : false
    if (sanity) {
      // Soft sanity check, not blocking: just warn via confirm so a real
      // typo doesn't silently break payments for everyone.
      const ok = window.confirm(
        `Rate ${parsed} for ${pair} looks unusual. Continue anyway?`,
      )
      if (!ok) return
    }

    const warning =
      'This affects NEW quotes and payments only. Existing bookings and ' +
      'payments stay unchanged — their FX snapshot was recorded at the ' +
      'time of booking/payment.\n\nContinue?'
    if (!window.confirm(warning)) return

    try {
      setSubmitting(true)
      await createAdminFxRate(
        {
          fromCurrency: pairDef.from,
          toCurrency:   pairDef.to,
          rate:         parsed,
          source:       source.trim() || DEFAULT_SOURCE,
          note:         note.trim() || null,
        },
        token,
      )
      setFormOk(`Saved ${pair} = ${parsed}. It is now active for new payments.`)
      setRate('')
      setNote('')
      await reload()
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to save FX rate')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !history) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FX rates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage USD↔MNT exchange rates used by the payment conversion layer.
            Rows are append-only — corrections are a new entry, not an edit.
          </p>
        </div>
        <Link
          href="/admin/pricing-health"
          className="shrink-0 text-xs text-amber-700 hover:text-amber-800 underline"
        >
          ← Pricing health
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Active-rate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActiveRateCard title="USD → MNT (primary)" h={usdToMnt} emphasise />
        <ActiveRateCard title="MNT → USD (reverse)" h={mntToUsd} />
      </div>

      {/* Warnings */}
      {(usdToMnt && usdToMnt.status === 'missing') && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">No USD→MNT rate is set.</p>
            <p className="mt-0.5">
              Payments on USD listings will fail until you add a rate below.
              Existing MNT bookings are unaffected.
            </p>
          </div>
        </div>
      )}
      {usdToMnt && usdToMnt.status !== 'missing' && healthTone(usdToMnt) !== 'ok' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">USD→MNT rate is stale.</p>
            <p className="mt-0.5">
              Last update {fmtAge(usdToMnt.ageSeconds)}. Payments still work,
              but add a refreshed rate to keep conversions accurate.
            </p>
          </div>
        </div>
      )}

      {/* Add-rate form */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Add / update rate</h2>
        <p className="text-xs text-gray-500 mb-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          This affects new quotes and payments only. Existing bookings and
          payments stay unchanged.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">
            <span className="block text-xs font-medium text-gray-600 mb-1">Pair</span>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value as Pair)}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm"
            >
              {SUPPORTED_PAIRS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.from} → {p.to}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="block text-xs font-medium text-gray-600 mb-1">Rate</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              required
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={pair === 'USD->MNT' ? 'e.g. 3450' : 'e.g. 0.000290'}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="block text-xs font-medium text-gray-600 mb-1">Source</span>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={DEFAULT_SOURCE}
              maxLength={80}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ref bank rate, manual update, …"
              maxLength={500}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm"
            />
          </label>

          <div className="md:col-span-4 flex items-center justify-between gap-3 pt-1">
            <div className="text-xs">
              {formError && <span className="text-red-700">{formError}</span>}
              {formOk    && <span className="text-green-700">{formOk}</span>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {submitting ? 'Saving…' : 'Save new rate'}
            </button>
          </div>
        </form>
      </section>

      {/* History table */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent rates</h2>
          <span className="text-[11px] text-gray-500">
            Top row of each pair is what payments use.
          </span>
        </div>
        {!history || history.length === 0 ? (
          <p className="text-sm text-gray-500">No FX rates have been recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wide">
              <tr className="text-left">
                <th className="py-2 pr-4">Pair</th>
                <th className="py-2 pr-4">Rate</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Effective from</th>
                <th className="py-2 pr-4">Note</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, idx) => {
                const isActive = history.findIndex(
                  (x) => x.fromCurrency === r.fromCurrency && x.toCurrency === r.toCurrency,
                ) === idx
                return (
                  <tr key={r.id} className="border-t border-gray-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-800">
                      {r.fromCurrency} → {r.toCurrency}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{r.rate}</td>
                    <td className="py-2 pr-4 text-xs text-gray-500">{r.source}</td>
                    <td className="py-2 pr-4 text-xs text-gray-500">
                      {new Date(r.effectiveFrom).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-500 max-w-[22ch] truncate" title={r.note ?? ''}>
                      {r.note ?? '—'}
                    </td>
                    <td className="py-2 pr-4">
                      {isActive
                        ? <Badge tone="ok"><CheckCircle2 className="w-3 h-3" /> active</Badge>
                        : <Badge tone="info">history</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function ActiveRateCard({
  title,
  h,
  emphasise = false,
}: {
  title:      string
  h:          FxRateHealth | undefined
  emphasise?: boolean
}) {
  const tone = h ? healthTone(h) : 'err'
  const ring = emphasise ? 'ring-1 ring-amber-200' : ''
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        {!h || h.status === 'missing' ? (
          <Badge tone="err"><AlertTriangle className="w-3 h-3" /> missing</Badge>
        ) : tone === 'err' ? (
          <Badge tone="err"><Clock className="w-3 h-3" /> very stale</Badge>
        ) : tone === 'warn' ? (
          <Badge tone="warn"><Clock className="w-3 h-3" /> stale</Badge>
        ) : (
          <Badge tone="ok"><CheckCircle2 className="w-3 h-3" /> fresh</Badge>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
        {h?.rate != null ? h.rate : '—'}
      </p>
      <p className="text-[11px] text-gray-500 mt-1">
        {h?.source ?? '—'} · updated {fmtAge(h?.ageSeconds ?? null)}
      </p>
    </div>
  )
}
