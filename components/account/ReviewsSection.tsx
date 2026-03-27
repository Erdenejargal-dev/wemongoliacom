'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Pencil, Trash2, X, CheckCircle2, MessageSquare } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { UserReview } from '@/lib/mock-data/account'
import { deleteMyTourReview, updateMyTourReview, type BackendMyTourReview, ApiError } from '@/lib/api/reviews'
import { getFreshAccessToken } from '@/lib/auth-utils'

interface ReviewsSectionProps {
  initialReviews: UserReview[]
  accessToken: string
  onReviewsChange?: (next: UserReview[]) => void
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export function ReviewsSection({ initialReviews, accessToken, onReviewsChange }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<UserReview[]>(initialReviews)
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editRating, setEditRating] = useState(5)
  const [saved, setSaved] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  function startEdit(r: UserReview) {
    setEditing(r.id); setEditText(r.comment); setEditRating(r.rating)
  }

  const router = useRouter()

  async function saveEdit() {
    if (!editing) return
    if (saving) return
    setSaving(true)
    setActionError(null)

    const token = await getFreshAccessToken()
    if (!token) {
      setActionError('Session expired. Please log in again.')
      setSaving(false)
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }

    try {
      const updated = await updateMyTourReview(token, editing, { rating: editRating, comment: editText })
      const mapped: UserReview = {
        id: updated.id,
        tourSlug: updated.tourSlug,
        tourTitle: updated.tourTitle,
        tourImage: updated.tourImage ?? '',
        rating: updated.rating,
        comment: updated.comment ?? '',
        date: updated.date,
      }
      setReviews(prev => {
        const next = prev.map(r => r.id === editing ? mapped : r)
        onReviewsChange?.(next)
        return next
      })
      setEditing(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setActionError('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setActionError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to update review.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    if (saving) return
    setSaving(true)
    setActionError(null)

    const token = await getFreshAccessToken()
    if (!token) {
      setActionError('Session expired. Please log in again.')
      setSaving(false)
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }

    try {
      await deleteMyTourReview(token, id)
      setReviews(prev => {
        const next = prev.filter(r => r.id !== id)
        onReviewsChange?.(next)
        return next
      })
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setActionError('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setActionError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete review.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm mb-1">No reviews yet</p>
        <p className="text-gray-400 text-xs mb-4">Reviews you write after tours will appear here.</p>
        <Link href="/tours" className="text-sm text-brand-600 hover:text-brand-700 font-semibold underline">Find a Tour</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">My Reviews ({reviews.length})</h3>
        {saved && <span className="flex items-center gap-1 text-xs text-brand-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Review updated</span>}
      </div>
      {actionError && (
        <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {actionError}
        </p>
      )}
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-gray-50">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
              <img src={review.tourImage} alt={review.tourTitle} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{review.tourTitle}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRow rating={review.rating} />
                <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-start gap-1 shrink-0">
              <button onClick={() => startEdit(review)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-brand-100 flex items-center justify-center transition-colors">
                <Pencil className="w-3.5 h-3.5 text-gray-500 hover:text-brand-600" />
              </button>
              <button onClick={() => deleteReview(review.id)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {editing === review.id ? (
              <div className="space-y-3">
                {/* Edit rating */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setEditRating(n)}>
                      <Star className={`w-5 h-5 transition-colors ${n <= editRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 hover:text-amber-200'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 resize-none" />
                <div className="flex gap-2">
                  <button onClick={saveEdit}
                    className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" />Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
