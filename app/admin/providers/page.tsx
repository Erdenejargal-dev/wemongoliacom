'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import {
  Search, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Building2,
} from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { fetchAdminProviders, setAdminProviderVerification } from '@/lib/api/admin'
import type { AdminProvider } from '@/lib/api/admin'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const verifyConfig: Record<string, { label: string; cls: string; dotCls: string }> = {
  unverified:     { label: 'Unverified',      cls: 'bg-gray-50 text-gray-500 border-gray-200',     dotCls: 'bg-gray-400' },
  pending_review: { label: 'Pending Review',  cls: 'bg-amber-50 text-amber-700 border-amber-200',  dotCls: 'bg-amber-400 animate-pulse' },
  verified:       { label: 'Verified',        cls: 'bg-green-50 text-green-700 border-green-200',  dotCls: 'bg-green-500' },
  rejected:       { label: 'Rejected',        cls: 'bg-red-50 text-red-700 border-red-200',        dotCls: 'bg-red-500' },
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft:    { label: 'Draft',    cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  active:   { label: 'Active',   cls: 'bg-green-50 text-green-700 border-green-200' },
  paused:   { label: 'Paused',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  archived: { label: 'Archived', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function VerifyBadge({ status }: { status: string }) {
  const cfg = verifyConfig[status] ?? verifyConfig.unverified
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  )
}

// ── detail panel ─────────────────────────────────────────────────────────────

function ProviderDetailPanel({
  provider,
  onVerify,
  onClose,
  saving,
}: {
  provider: AdminProvider
  onVerify: (id: string, status: 'verified' | 'rejected', rejectionReason?: string) => void
  onClose: () => void
  saving: boolean
}) {
  const [rejectStep, setRejectStep]   = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  function startReject() { setRejectStep(true); setRejectReason('') }
  function cancelReject() { setRejectStep(false); setRejectReason('') }
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
          {/* Status pair */}
          <div className="flex items-center gap-3">
            <VerifyBadge status={provider.verificationStatus} />
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              (statusConfig[provider.status] ?? statusConfig.draft).cls
            }`}>
              {(statusConfig[provider.status] ?? statusConfig.draft).label}
            </span>
          </div>

          {/* Rejection reason (read-only, for rejected providers) */}
          {provider.verificationStatus === 'rejected' && provider.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-xs text-red-800 leading-relaxed">{provider.rejectionReason}</p>
            </div>
          )}

          {/* Owner */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Owner</p>
            <p className="text-sm font-medium text-gray-900">
              {provider.owner.firstName} {provider.owner.lastName}
            </p>
            <p className="text-xs text-gray-500">{provider.owner.email}</p>
          </div>

          {/* Contact */}
          {(provider.email || provider.phone) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Contact</p>
              {provider.email && <p className="text-xs text-gray-600">{provider.email}</p>}
              {provider.phone && <p className="text-xs text-gray-600">{provider.phone}</p>}
            </div>
          )}

          {/* Description */}
          {provider.description && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">About</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                {provider.description}
              </p>
            </div>
          )}

          {/* Location */}
          {(provider.city || provider.region) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</p>
              <p className="text-xs text-gray-600">
                {[provider.city, provider.region].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Listings */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Listings</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Tours',           val: provider._count.tours },
                { label: 'Vehicles',        val: provider._count.vehicles },
                { label: 'Accommodations',  val: provider._count.accommodations },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-base font-bold text-gray-900">{item.val}</p>
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings / Reviews */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Activity</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{provider._count.bookings}</p>
                <p className="text-[10px] text-gray-500">Bookings</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-base font-bold text-gray-900">{provider.reviewsCount}</p>
                <p className="text-[10px] text-gray-500">Reviews</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">Joined {fmtDate(provider.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {/* Rejection reason step */}
          {rejectStep && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Rejection reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Describe why this provider is being rejected. This will be sent to them by email."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={cancelReject}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={saving || !rejectReason.trim()}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}

          {/* Primary action buttons */}
          {!rejectStep && (
            <div className="flex gap-2">
              {provider.verificationStatus !== 'verified' && (
                <>
                  {provider.verificationStatus !== 'rejected' && (
                    <button
                      onClick={startReject}
                      disabled={saving}
                      className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  )}
                  {provider.verificationStatus === 'rejected' && (
                    <button
                      onClick={startReject}
                      disabled={saving}
                      className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Again
                    </button>
                  )}
                  <button
                    onClick={() => onVerify(provider.id, 'verified')}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Verify'}
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
                  Revoke Verification
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminProvidersPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const searchParams = useSearchParams()

  const [providers, setProviders]   = useState<AdminProvider[]>([])
  const [total, setTotal]           = useState(0)
  const [pages, setPages]           = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const debouncedSearch             = useDebounce(search, 300)
  // Initialise from URL param so overview "Pending Review" link pre-filters the table
  const [vFilter, setVFilter]       = useState(() => searchParams.get('verificationStatus') ?? '')
  const [page, setPage]             = useState(1)

  // Reset to page 1 only when debounced search value changes — not on every keystroke
  useEffect(() => { setPage(1) }, [debouncedSearch])
  const [selected, setSelected]     = useState<AdminProvider | null>(null)
  const [saving, setSaving]         = useState(false)

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
      setError(e?.message ?? 'Failed to load providers')
    } finally {
      setLoading(false)
    }
  }, [token, debouncedSearch, vFilter, page])

  useEffect(() => { load() }, [load])

  async function handleVerify(providerId: string, status: 'verified' | 'rejected', rejectionReason?: string) {
    if (!token) return
    setSaving(true)
    try {
      await setAdminProviderVerification(providerId, status, token, rejectionReason)
      setSelected(null)
      load()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update verification')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Providers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} registered businesses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search business name, email, city…"
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
          <option value="">All verification states</option>
          <option value="unverified">Unverified</option>
          <option value="pending_review">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
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
          <div className="p-8 text-center text-sm text-gray-500">No providers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Joined</th>
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
                          {p.city && <p className="text-xs text-gray-400">{p.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[140px]">{p.owner.firstName} {p.owner.lastName}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{p.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">
                        {p.providerTypes.map(t => t.replace(/_/g, ' ')).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <VerifyBadge status={p.verificationStatus} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        (statusConfig[p.status] ?? statusConfig.draft).cls
                      }`}>
                        {(statusConfig[p.status] ?? statusConfig.draft).label}
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
                        Review
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
            <p className="text-gray-500 text-xs">Page {page} of {pages} · {total} total</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
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
          onClose={() => setSelected(null)}
          saving={saving}
        />
      )}
    </div>
  )
}
