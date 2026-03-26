'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Star, Users, CalendarDays, Minus, Plus, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import type { BackendDeparture } from '@/lib/api/tours'

interface TourBookingCardProps {
  tour: {
    id: string
    slug: string
    basePrice: number
    currency?: string
    durationDays?: number | null
    ratingAverage?: number | null
    reviewsCount?: number | null
    maxGuests: number
  }
  departures?: BackendDeparture[] | null
}

function fmtDate(dateLike: string): string {
  const d = new Date(dateLike)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDateFull(dateLike: string): string {
  const d = new Date(dateLike)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function TourBookingCard({ tour, departures }: TourBookingCardProps) {
  const router = useRouter()
  const [guests, setGuests] = useState(1)
  const [selectedDepId, setSelectedDepId] = useState<string | null>(
    departures?.[0]?.id ?? null,
  )

  const selectedDeparture = departures?.find(d => d.id === selectedDepId) ?? null

  const remainingSeats = selectedDeparture
    ? selectedDeparture.availableSeats - (selectedDeparture.bookedSeats ?? 0)
    : null

  const maxGuestsForDate = remainingSeats != null
    ? Math.min(tour.maxGuests, remainingSeats)
    : tour.maxGuests

  const canReserve = selectedDeparture != null && remainingSeats != null && remainingSeats > 0 && guests <= remainingSeats

  useEffect(() => {
    if (remainingSeats != null && guests > remainingSeats) {
      setGuests(Math.max(1, remainingSeats))
    }
  }, [remainingSeats])

  const pricePerPerson = selectedDeparture?.priceOverride ?? tour.basePrice
  const total = pricePerPerson * guests

  const handleReserve = () => {
    if (!selectedDeparture) return
    const params = new URLSearchParams({
      tourId: tour.id,
      depId: selectedDeparture.id,
      slug: tour.slug,
      guests: String(guests),
      date: selectedDeparture.startDate.slice(0, 10),
      total: String(total),
    })
    router.push(`/checkout?${params.toString()}`)
  }

  const durationLabel = tour.durationDays ? `${tour.durationDays} day${tour.durationDays > 1 ? 's' : ''}` : ''
  const hasDepartures = departures && departures.length > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-gray-900">${pricePerPerson}</span>
        <span className="text-sm text-gray-500">/ person</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-gray-900">{tour.ratingAverage ?? 0}</span>
        <span className="text-gray-500">({tour.reviewsCount ?? 0} reviews)</span>
        {durationLabel && (
          <>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-500">{durationLabel}</span>
          </>
        )}
      </div>

      {/* Departure selection */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          Select Departure
        </label>
        {hasDepartures ? (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {departures.map(dep => {
              const seats = dep.availableSeats - (dep.bookedSeats ?? 0)
              const isSelected = dep.id === selectedDepId
              const hasOverride = dep.priceOverride != null && dep.priceOverride !== tour.basePrice
              return (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => setSelectedDepId(dep.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-green-400 bg-green-50/50 ring-2 ring-green-400/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CalendarDays className={`w-4 h-4 shrink-0 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                      {fmtDate(dep.startDate)} — {fmtDate(dep.endDate ?? dep.startDate)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {seats} seat{seats !== 1 ? 's' : ''} left
                      {seats <= 4 && seats > 0 && <span className="text-amber-600 ml-1">· Selling fast</span>}
                      {hasOverride && <span className="text-green-600 ml-1">· ${dep.priceOverride}/person</span>}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500">
              No upcoming departures available. Contact the provider for more information.
            </p>
          </div>
        )}
      </div>

      {/* Selected date summary */}
      {selectedDeparture && (
        <div className="px-3 py-2 bg-green-50 border border-green-100 rounded-xl mb-4">
          <p className="text-xs text-green-800 font-medium">
            {fmtDateFull(selectedDeparture.startDate)} — {fmtDateFull(selectedDeparture.endDate ?? selectedDeparture.startDate)}
          </p>
        </div>
      )}

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
            <button onClick={() => setGuests(g => Math.min(maxGuestsForDate, g + 1))} disabled={guests >= maxGuestsForDate}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        {remainingSeats != null ? (
          <p className="text-xs text-gray-400 mt-1">
            {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} remaining
            {remainingSeats < 5 && remainingSeats > 0 && (
              <span className="text-amber-600 ml-1">· Selling out</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Max {tour.maxGuests} guests per booking</p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>${pricePerPerson} × {guests} guest{guests !== 1 ? 's' : ''}</span>
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
        disabled={!canReserve}
        className="w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-green-200 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {canReserve ? (
          <>Reserve Tour <ChevronRight className="w-4 h-4" /></>
        ) : hasDepartures ? (
          'Select a departure to book'
        ) : (
          'No departures available'
        )}
      </button>

      {/* Trust badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
          Free cancellation up to 7 days before tour
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-green-500 shrink-0" />
          Confirmation after provider review
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">You won&apos;t be charged yet</p>
    </div>
  )
}
