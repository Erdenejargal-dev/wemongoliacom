'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchAdminGuideApplications,
  approveGuideApplication,
  rejectGuideApplication,
  type GuideApplication,
  type GuideApplicationStatus,
} from '@/lib/api/guides'

type AdminApp = GuideApplication & { user: { id: string; firstName: string; lastName: string; email: string } }

const STATUS_COLORS: Record<GuideApplicationStatus, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

const FILTER_TABS: { label: string; status?: GuideApplicationStatus }[] = [
  { label: 'All' },
  { label: 'Pending',  status: 'pending' },
  { label: 'Approved', status: 'approved' },
  { label: 'Rejected', status: 'rejected' },
]

export default function AdminGuideApplicationsPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [filterStatus, setFilterStatus] = useState<GuideApplicationStatus | undefined>('pending')
  const [apps,         setApps]         = useState<AdminApp[]>([])
  const [loading,      setLoading]      = useState(true)
  const [expanded,     setExpanded]     = useState<string | null>(null)
  const [rejecting,    setRejecting]    = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busy,         setBusy]         = useState<string | null>(null)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    if (!token) { setLoading(false); return }
    fetchAdminGuideApplications(token, { status: filterStatus })
      .then(r => { if (alive) { setApps(r.applications); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token, filterStatus])

  async function approve(id: string) {
    if (!token) return
    setBusy(id); setError(null)
    try {
      await approveGuideApplication(token, id)
      setApps(prev => prev.filter(a => a.id !== id))
      setExpanded(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve')
    } finally { setBusy(null) }
  }

  async function reject(id: string) {
    if (!token || !rejectReason.trim()) return
    setBusy(id); setError(null)
    try {
      await rejectGuideApplication(token, id, rejectReason.trim())
      setApps(prev => prev.filter(a => a.id !== id))
      setRejecting(null); setRejectReason(''); setExpanded(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reject')
    } finally { setBusy(null) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Guide Applications</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setFilterStatus(tab.status)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterStatus === tab.status
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : apps.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">No applications</div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Row */}
              <button
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{app.name}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[app.status])}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{app.user.email} · {app.location}</p>
                  <p className="text-xs text-gray-400">{app.specialties.join(', ')} · {app.yearsExperience} yrs exp.</p>
                </div>
                <div className="shrink-0 text-gray-300">
                  {expanded === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Detail */}
              {expanded === app.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Languages"    value={app.languages.join(', ')} />
                    <Detail label="Daily rate"   value={app.dailyRate ? `$${app.dailyRate}/day` : 'Not specified'} />
                    <Detail label="Contact"      value={app.contactEmail} />
                    {app.contactPhone && <Detail label="Phone" value={app.contactPhone} />}
                    <Detail label="Submitted"    value={new Date(app.createdAt).toLocaleDateString()} />
                    {app.rejectionReason && <Detail label="Rejection" value={app.rejectionReason} />}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-700">{app.bio}</p>
                  </div>

                  {app.about && app.about !== app.bio && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">About</p>
                      <p className="text-sm text-gray-700">{app.about}</p>
                    </div>
                  )}

                  {app.idPhotoUrl && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">ID Photo</p>
                      <a href={app.idPhotoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={app.idPhotoUrl} alt="ID" className="w-48 h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity" />
                      </a>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="flex items-center gap-3 flex-wrap pt-2">
                      <button
                        onClick={() => approve(app.id)}
                        disabled={busy === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {busy === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>

                      {rejecting === app.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Rejection reason…"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => reject(app.id)}
                            disabled={busy === app.id || !rejectReason.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {busy === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Reject
                          </button>
                          <button onClick={() => { setRejecting(null); setRejectReason('') }} className="text-gray-400 text-sm hover:text-gray-600">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRejecting(app.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-all">{value}</p>
    </div>
  )
}
