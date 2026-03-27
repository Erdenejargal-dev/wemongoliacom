'use client'

import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import type { Review } from '@/lib/mock-data/reviews'

interface ReviewCardProps {
  review: Review
  onReply?: (id: string, reply: string) => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  const initials = review.customerName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-900">{review.customerName}</p>
              <p className="text-xs text-gray-500">{review.serviceName}</p>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.text}</p>

          {review.replied && review.reply && (
            <div className="mt-3 pl-3 border-l-2 border-brand-200 bg-brand-50 rounded-r-lg py-2 pr-3">
              <p className="text-xs font-medium text-brand-700 mb-1">Your reply</p>
              <p className="text-xs text-brand-600">{review.reply}</p>
            </div>
          )}

          {!review.replied && (
            <div className="mt-3">
              {!showReply ? (
                <button
                  onClick={() => setShowReply(true)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Reply
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onReply?.(review.id, replyText); setShowReply(false) }}
                      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => setShowReply(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
