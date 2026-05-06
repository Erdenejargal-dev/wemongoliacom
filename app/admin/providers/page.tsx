  'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import {
  Search, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Building2,
} from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { fetchAdminProviders, setAdminProviderVerification, setAdminProviderPlan } from '@/lib/api/admin'
import type { AdminProvider } from '@/lib/api/admin'
import { useAdminLocale } from '@/lib/i18n/admin/context'

// ── Badges ────────────────────────────────────────────────────────────────────

const verifyDotCls: Record<string, string> = {
  unverified:     'bg-gray-400',
  pending_review: 'bg-amber-400 animate-pulse',
  verified:       'bg-green-500',
  rejected:       'bg-red-500',
}

const verifyBgCls: Record<string, string> = {
  unverified:     'bg-gray-50 text-gray-500 border-gray-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  verified:       'bg-green-50 text-green-700 border-green-200',
  rejected:       'bg-red-50 text-red-700 border-red-200',
}

const statusBgCls: Record<string, string> = {
  draft:    'bg-gray-50 text-gray-500 border-gray-200',
  active:   'bg-green-50 text-green-700 border-green-200',
  paused:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
}

function VerifyBadge({ status, label }: { status: string; label: string }) {
  const bg  = verifyBgCls[status]  ?? verifyBgCls.unverified
  const dot = verifyDotCls[status] ?? 'bg-gray-400'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function ProviderDetailPanel({
  provider,
  onVerify,
  onPlanChange,
  onClose,
  saving,
}: {
  provider:      AdminProvider
  onVerify:      (id: string, status: 'verified' | 'rejected', rejectionReason?: string) => void
  onPlanChange:  (id: string, plan: 'FREE' | 'PRO') => Promise<void>
  onClose:       () => void
  saving:        boolean
}) {
  const { t }       = useAdminLocale()
  const tp          = t.providers
  const [rejectStep,   setRejectStep]   = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [planSaving,   setPlanSaving]   = useState(false)

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const verifyLabel = (s: string) =>
    (tp.verifyLabels as Record<string, string>)[s] ?? s
  const statusLabel = (s: string) =>
    (tp.statusLabels as Record<string, string>)[s] ?? s

  function startReject()   { setRejectStep(true);  setRejectReason('') }
  function cancelReject()  { setRejectStep(false); setRejectReason('') }
  function confirmReject() {
    if (!rejectReason.trim()) return
    onVerify(provider.id, 'rejected', rejectReason.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{provider.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {provider.providerTypes.join(', ').replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <VerifyBadge status={provider.verificationStatus} label={verifyLabel(provider.verificationStatus)} />
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              statusBgCls[provider.status] ?? statusBgCls.draft
            }`}>
              {statusLabel(provider.status)}
            </span>
          </div>

          {/* Rejection reason (read-only) */}
          {provider.verificationStatus === 'rejected' && provider.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">
                {tp.detail.rejectionReasonBadge}
              </p>
              <p className="text-xs text-red-800 leading-relaxed">{provider.rejectionReason}</p>
            </div>
          )}

          {/* Owner */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tp.detail.owner}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {provider.owner.firstName} {provider.owner.lastName}
            </p>
            <p className="text-xs text-gray-500">{provider.owner.email}</p>
          </div>

          {/* Contact */}
          {(provider.email || provider.phone) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tp.detail.contact}
              </p>
              {provider.email && <p className="text-xs text-gray-600">{provider.email}</p>}
              {provider.phone && <p className="text-xs text-gray-600">{provider.phone}</p>}
            </div>
          )}

          {/* About */}
          {provider.description && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tp.detail.about}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                {provider.description}
              </p>
            </div>
          )}

          {/* Location */}
          {(provider.city || provider.region) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {tp.detail.location}
              </p>
              <p className="text-xs text-gray-600">
                {[provider.city, provider.region].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Listings */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tp.detail.listings}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: tp.detail.tours,          val: provider._count.tours },
                { label: tp.detail.vehicles,        val: provider._count.vehicles },
                { label: tp.detail.accommodations,  val: provider._count.accommodations },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-base font-bold text-gray-900">{item.val}</p>
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {tp.detail.activity}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{provider._count.bookings}</p>
                <p className="text-[10px] text-gray-500">{tp.detail.bookings}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{provider.reviewsCount}</p>
                <p className="text-[10px] text-gray-500">{tp.detail.reviews}</p>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Plan
            </p>
            <div className="flex gap-2">
              {(['FREE', 'PRO'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={async () => {
                    if (provider.plan === plan || planSaving) return
                    setPlanSaving(true)
                    try { await onPlanChange(provider.id, plan) }
                    finally { setPlanSaving(false) }
                  }}
                  disabled={planSaving || provider.plan === plan}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    provider.plan === plan
                      ? plan === 'PRO'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 cursor-default'
                        : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'
                      : plan === 'PRO'
                        ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {plan === 'PRO' ? '⭐ PRO' : 'FREE'}
                  {provider.plan === plan && ' ✓'}
                </button>
              ))}
            </div>
            {planSaving && <p className="text-[10px] text-gray-400 mt-1.5 text-center">Updating plan…</p>}
          </div>

          <p className="text-xs text-gray-400">{tp.detail.joined(fmtDate(provider.createdAt))}</p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {/* Rejection reason form */}
          {rejectStep && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                {tp.detail.rejectionReasonLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder={tp.detail.rejectionPlaceholder}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={cancelReject}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={confirmReject}
                  disabled={saving || !rejectReason.trim()}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {saving ? t.common.saving : tp.actions.confirmRejection}
                </button>
              </div>
            </div>
          )}

          {/* Primary action buttons */}
          {!rejectStep && (
            <div className="flex gap-2">
              {provider.verificationStatus !== 'verified' && (
                <>
                  <button
                    onClick={startReject}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    {provider.verificationStatus === 'rejected'
                      ? tp.actions.rejectAgain
                      : tp.actions.reject}
                  </button>
                  <button
                    onClick={() => onVerify(provider.id, 'verified')}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {saving ? t.common.saving : tp.actions.verify}
                  </button>
                </>
              )}
              {provider.verificationStatus === 'verified' && (
                <button
                  onClick={startReject}
                  disabled={saving}
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  {tp.actions.revokeVerification}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProvidersPage() {
  const { data: session } = useSession()
  const token             = session?.user?.accessToken
  const searchParams      = useSearchParams()
  const { t }             = useAdminLocale()
  const tp                = t.providers

  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [total,     setTotal]     = useState(0)
  const [pages,     setPages]     = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [search,    setSearch]    = useState('')
  const debouncedSearch           = useDebounce(search, 300)
  const [vFilter,   setVFilter]   = useState(() => searchParams.get('verificationStatus') ?? '')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState<AdminProvider | null>(null)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const verifyLabel = (s: string) =>
    (tp.verifyLabels as Record<string, string>)[s] ?? s
  const statusLabel = (s: string) =>
    (tp.statusLabels as Record<string, string>)[s] ?? s

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const LIMIT = 20

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminProviders(
        { search: debouncedSearch || undefined, verificationStatus: vFilter || undefined, page, limit: LIMIT },
        token,
      )
      setProviders(result.data)
      setTotal(result.pagination.total)
      setPages(result.pagination.pages)
    } catch (e: any) {
      setError(e?.message ?? tp.errorLoading)
    } finally {
      setLoading(false)
    }
  }, [token, debouncedSearch, vFilter, page])

  useEffect(() => { load() }, [load])

  async function handleVerify(
    providerId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string,
  ) {
    if (!token) return
    setSaving(true)
    try {
      await setAdminProviderVerification(providerId, status, token, rejectionReason)
      setSelected(null)
      load()
    } catch (e: any) {
      alert(e?.message ?? tp.errorLoading)
    } finally {
      setSaving(false)
    }
  }

  async function handlePlanChange(providerId: string, plan: 'FREE' | 'PRO') {
    if (!token) return
    try {
      await setAdminProviderPlan(providerId, plan, token)
      // Optimistic: update selected provider in-panel immediately
      setSelected(prev => prev && prev.id === providerId ? { ...prev, plan } : prev)
      // Refresh table row in background
      load()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update plan.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{tp.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tp.totalBusinesses(total)}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={tp.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <select
          value={vFilter}
          onChange={e => { setVFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">{tp.verifyFilter.all}</option>
          <option value="unverified">{tp.verifyFilter.unverified}</option>
          <option value="pending_review">{tp.verifyFilter.pendingReview}</option>
          <option value="verified">{tp.verifyFilter.verified}</option>
          <option value="rejected">{tp.verifyFilter.rejected}</option>
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
        ) : providers.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{tp.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tp.table.business}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{tp.table.owner}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">{tp.table.type}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tp.table.verification}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">{tp.table.status}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">{tp.table.joined}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {providers.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.city && <p className="text-xs text-gray-400">{p.city}</p>}
                            <span className={`inline-flex text-[10px] font-bold px-1 py-px rounded-full border ${
                              p.plan === 'PRO'
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-gray-400 bg-gray-50 border-gray-200'
                            }`}>
                              {p.plan === 'PRO' ? '⭐PRO' : 'FREE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[140px]">{p.owner.firstName} {p.owner.lastName}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{p.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">
                        {p.providerTypes.map(pt => pt.replace(/_/g, ' ')).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <VerifyBadge status={p.verificationStatus} label={verifyLabel(p.verificationStatus)} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        statusBgCls[p.status] ?? statusBgCls.draft
                      }`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell whitespace-nowrap">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(p)}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {t.common.reviewAction}
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
            <p className="text-gray-500 text-xs">{t.common.pageInfo(page, pages, total)}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ProviderDetailPanel
          provider={selected}
          onVerify={handleVerify}
          onPlanChange={handlePlanChange}
          onClose={() => setSelected(null)}
          saving={saving}
        />
      )}
    </div>
  )
}
