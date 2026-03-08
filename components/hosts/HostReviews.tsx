import { Star, Quote } from 'lucide-react'
import type { HostReview } from '@/lib/mock-data/hosts'

interface HostReviewsProps {
  reviews: HostReview[]
  rating: number
  reviewsCount: number
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function HostReviews({ reviews, rating, reviewsCount }: HostReviewsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Traveler Reviews</h2>
          <p className="text-xs text-gray-500">{reviewsCount} verified reviews</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</p>
          <StarRow rating={Math.round(rating)} />
          <p className="text-xs text-gray-500 mt-0.5">Overall</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-5">
        {reviews.map(review => (
          <div key={review.id} className="relative border border-gray-100 rounded-2xl p-5 hover:border-green-100 hover:bg-green-50/30 transition-colors">
            <Quote className="absolute top-4 right-4 w-6 h-6 text-gray-100" />
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar initials */}
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 shrink-0">
                {review.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{review.author}</p>
                    <p className="text-xs text-gray-500">{review.country}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRow rating={review.rating} />
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(review.date)}</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Tour: {review.tourName}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
