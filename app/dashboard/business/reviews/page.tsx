'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { ReviewCard } from '@/components/dashboard/domain/ReviewCard'
import { mockReviews, type Review } from '@/lib/mock-data/reviews'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'

  const handleReply = (id: string, reply: string) => {
    setReviews(rs => rs.map(r => r.id === id ? { ...r, replied: true, reply } : r))
  }

  return (
    <div>
      <PageHeader
        title="Reviews"
        description={`${reviews.length} reviews`}
        actions={
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-amber-700">{avg}</span>
            <span className="text-xs text-amber-500">avg rating</span>
          </div>
        }
      />
      <div className="space-y-4">
        {reviews.map(r => <ReviewCard key={r.id} review={r} onReply={handleReply} />)}
      </div>
    </div>
  )
}
