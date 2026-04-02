'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star, RefreshCw, MessageSquare, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import {
  fetchProviderReviews,
  replyToProviderReview,
  type ProviderReview,
} from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useProviderLocale } from '@/lib/i18n/provider/context'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

function ReviewCard({ review, onReplySuccess }: { review: ProviderReview; onReplySuccess: () => void }) {
  const { t }             = useProviderLocale()
  const rt                = t.reviews
  const [showForm, setShowForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [saving,   setSaving]    = useState(false)
  const [error,    setError]     = useState<string | null>(null)

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim()) return
    const ft = await getFreshAccessToken()
    if (!ft) return
    setSaving(true); setError(null)
    try {
      const updated = await replyToProviderReview(review.id, replyText.trim(), ft)
      if (updated) { setShowForm(false); setReplyText(''); onReplySuccess() }
      else setError(rt.failedReply)
    } catch { setError(rt.failedReply) }
    finally { setSaving(false) }
  }

  const reviewerName = `${review.user.firstName} ${review.user.lastName}`.trim() || 'Anonymous'

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Stars rating={review.rating} />
            <span className="text-sm font-semibold text-gray-900">{reviewerName}</span>
            <span className="text-xs text-gray-400">{fmtDate(review.createdAt)}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2 capitalize">{review.listingName}</p>
          {review.title   && <p className="text-sm font-medium text-gray-900 mb-1">{review.title}</p>}
          {review.comment && <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p>}
        </div>
      </div>

      {review.providerReply && (
        <div className="mt-4 pl-4 border-l-2 border-brand-200 bg-brand-50/50 rounded-r-lg py-2 pr-3">
          <p className="text-xs font-semibold text-brand-800 mb-0.5">{rt.yourReply}</p>
          <p className="text-sm text-brand-900 whitespace-pre-wrap">{review.providerReply}</p>
        </div>
      )}

      {!review.providerReply && !showForm && (
        <button type="button" onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700">
          <MessageSquare className="w-3.5 h-3.5" />
          {rt.replyBtn}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} required rows={3} maxLength={2000}
            placeholder={rt.replyPlaceholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none" />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={saving || !replyText.trim()}
              className="px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? rt.savingReply : rt.postReply}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setReplyText(''); setError(null) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
              {rt.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const router            = useRouter()
  const token             = session?.user?.accessToken
  const { t }             = useProviderLocale()
  const rt                = t.reviews

  const [reviews, setReviews] = useState<ProviderReview[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    const ft = token ? await getFreshAccessToken() : null
    if (!ft) { setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const result = await fetchProviderReviews(ft, { limit: 50 })
      setReviews(result.data); setTotal(result.total)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : rt.errorLoading)
    } finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>

  if (!token) return (
    <div className="space-y-4">
      <PageHeader title={rt.title} description="" />
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">{rt.signInNotice}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title={rt.title}
        description={loading ? '…' : rt.totalDescription(total)}
        actions={
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {rt.refresh}
          </button>
        }
      />
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title={rt.empty.title} description={rt.empty.description} />
      ) : (
        <div className="space-y-4">
          {reviews.map(r => <ReviewCard key={r.id} review={r} onReplySuccess={load} />)}
        </div>
      )}
    </div>
  )
}
