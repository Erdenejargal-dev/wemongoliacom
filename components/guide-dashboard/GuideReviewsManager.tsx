'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Star, Send } from 'lucide-react'
import { fetchMyGuideReviews, replyToGuideReview, type GuideReview } from '@/lib/api/guides'

export function GuideReviewsManager() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [reviews,   setReviews]   = useState<GuideReview[]>([])
  const [loading,   setLoading]   = useState(true)
  const [replyOpen, setReplyOpen] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending,   setSending]   = useState(false)

  useEffect(() => {
    let alive = true
    if (!token) { setLoading(false); return }
    fetchMyGuideReviews(token, { limit: 50 })
      .then(r => { if (alive) { setReviews(r.data); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token])

  async function sendReply(id: string) {
    if (!token || !replyText.trim()) return
    setSending(true)
    try {
      const updated = await replyToGuideReview(token, id, replyText.trim())
      setReviews(prev => prev.map(r => r.id === id ? updated : r))
      setReplyOpen(null)
      setReplyText('')
    } catch { /* non-fatal */ }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Traveler Reviews</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{review.author}</p>
                  {review.country && <p className="text-xs text-gray-400">{review.country}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.comment}</p>

              {review.tourName && (
                <p className="mt-1 text-xs text-gray-400">Tour: {review.tourName}</p>
              )}

              <p className="mt-2 text-xs text-gray-300">{new Date(review.date).toLocaleDateString()}</p>

              {(review as GuideReview & { guideReply?: string }).guideReply && (
                <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600 border-l-2 border-brand-400">
                  <p className="text-xs font-medium text-brand-600 mb-1">Your reply</p>
                  {(review as GuideReview & { guideReply?: string }).guideReply}
                </div>
              )}

              {!(review as GuideReview & { guideReply?: string }).guideReply && (
                <div className="mt-3">
                  {replyOpen === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Write your reply to this review…"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendReply(review.id)}
                          disabled={sending || !replyText.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Post reply
                        </button>
                        <button
                          onClick={() => { setReplyOpen(null); setReplyText('') }}
                          className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyOpen(review.id)}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Reply to review
                    </button>
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
