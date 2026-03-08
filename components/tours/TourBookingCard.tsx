'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Star, Users, CalendarDays, Minus, Plus, ChevronRight, Clock } from 'lucide-react'
import type { TourDetail } from '@/lib/mock-data/tourDetails'

interface TourBookingCardProps {
  tour: TourDetail
}

export function TourBookingCard({ tour }: TourBookingCardProps) {
  const router = useRouter()
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const total = tour.price * guests

  const handleReserve = () => {
    const params = new URLSearchParams({
      tourId: tour.id,
      slug: tour.slug,
      guests: String(guests),
      date,
      total: String(total),
    })
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-gray-900">${tour.price}</span>
        <span className="text-sm text-gray-500">/ person</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-gray-900">{tour.rating}</span>
        <span className="text-gray-500">({tour.reviewCount} reviews)</span>
        <span className="text-gray-300 mx-1">·</span>
        <span className="text-gray-500">{tour.duration}</span>
      </div>

      {/* Date */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Travel Date
        </label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10 transition-all">
          <CalendarDays className="w-4 h-4 text-green-500 shrink-0" />
          <input
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Guests
        </label>
        <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">{guests} guest{guests !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={guests <= 1}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-gray-900">{guests}</span>
            <button onClick={() => setGuests(g => Math.min(tour.maxGuests, g + 1))} disabled={guests >= tour.maxGuests}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Max {tour.maxGuests} guests per booking</p>
      </div>

      {/* Price breakdown */}
      <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>${tour.price} × {guests} guest{guests !== 1 ? 's' : ''}</span>
          <span>${total}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-green-200 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        Reserve Tour
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Trust badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
          Free cancellation up to 7 days before tour
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-green-500 shrink-0" />
          Instant confirmation
        </div>
      </div>

      {/* No charge reminder */}
      <p className="text-center text-xs text-gray-400 mt-3">You won&apos;t be charged yet</p>
    </div>
  )
}
