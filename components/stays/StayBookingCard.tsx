'use client'

/**
 * components/stays/StayBookingCard.tsx
 *
 * Sticky booking widget shown on the stay detail page.
 * Lets the user pick a room type, check-in/out dates, and guest count,
 * then navigates to /checkout/stay with those parameters.
 *
 * Booking is real — calls createBooking({ listingType: 'accommodation' })
 * via the /checkout/stay page.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Star, Users, Minus, Plus, ChevronRight, Shield, Clock, AlertCircle,
} from 'lucide-react'
import type { BackendStayDetail, BackendStayRoomType } from '@/lib/api/stays'

interface StayBookingCardProps {
  stay: Pick<
    BackendStayDetail,
    | 'id'
    | 'slug'
    | 'ratingAverage'
    | 'reviewsCount'
    | 'accommodationType'
    | 'roomTypes'
    | 'checkInTime'
    | 'checkOutTime'
    | 'cancellationPolicy'
  >
}

// ── Helpers ───────────────────────────────────────────────────────────────

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function nightsBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

// ── Component ─────────────────────────────────────────────────────────────

export function StayBookingCard({ stay }: StayBookingCardProps) {
  const router = useRouter()

  const today     = toInputDate(new Date())
  const tomorrow  = toInputDate(new Date(Date.now() + 86_400_000))
  const maxDate   = toInputDate(new Date(Date.now() + 60 * 86_400_000))

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    stay.roomTypes[0]?.id ?? '',
  )
  const [checkIn,  setCheckIn]  = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [guests,   setGuests]   = useState(1)

  const selectedRoom: BackendStayRoomType | undefined =
    stay.roomTypes.find((r) => r.id === selectedRoomId) ?? stay.roomTypes[0]

  const nights      = nightsBetween(checkIn, checkOut)
  const pricePerNight = selectedRoom?.basePricePerNight ?? 0
  const total       = nights * pricePerNight
  const maxGuests   = selectedRoom?.maxGuests ?? 1
  const canReserve  = !!selectedRoom && nights > 0 && guests >= 1 && guests <= maxGuests

  const handleCheckInChange = (val: string) => {
    setCheckIn(val)
    // push check-out forward if it's no longer after check-in
    if (val >= checkOut) {
      const next = new Date(val)
      next.setDate(next.getDate() + 1)
      setCheckOut(toInputDate(next))
    }
  }

  const handleRoomSelect = (room: BackendStayRoomType) => {
    setSelectedRoomId(room.id)
    setGuests((g) => Math.min(g, room.maxGuests))
  }

  const handleReserve = () => {
    if (!selectedRoom || !canReserve) return
    const params = new URLSearchParams({
      slug:       stay.slug,
      accId:      stay.id,
      roomTypeId: selectedRoom.id,
      checkIn,
      checkOut,
      guests:     String(guests),
      total:      String(total),
    })
    router.push(`/checkout/stay?${params.toString()}`)
  }

  const hasRooms = stay.roomTypes.length > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">

      {/* Price headline */}
      {selectedRoom && (
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold text-gray-900">
            ${selectedRoom.basePricePerNight.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">/ night</span>
        </div>
      )}

      {/* Rating */}
      {stay.ratingAverage > 0 && (
        <div className="flex items-center gap-1.5 mb-5 text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-900">
            {stay.ratingAverage.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({stay.reviewsCount} review{stay.reviewsCount !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {!hasRooms && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            No rooms listed yet. Contact the provider for availability.
          </p>
        </div>
      )}

      {/* Room type selection */}
      {hasRooms && stay.roomTypes.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            Room Type
          </label>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {stay.roomTypes.map((room) => {
              const isSelected = room.id === selectedRoomId
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomSelect(room)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50/50 ring-2 ring-brand-400/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 mr-2">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                      {room.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Up to {room.maxGuests} guest{room.maxGuests !== 1 ? 's' : ''}
                      {room.bedType ? ` · ${room.bedType}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    ${room.basePricePerNight}/night
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dates */}
      {hasRooms && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              max={maxDate}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn >= today ? (() => {
                const d = new Date(checkIn); d.setDate(d.getDate() + 1); return toInputDate(d)
              })() : tomorrow}
              max={maxDate}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Nights summary pill */}
      {nights > 0 && (
        <div className="px-3 py-2 bg-brand-50 border border-brand-100 rounded-xl mb-4">
          <p className="text-xs text-brand-800 font-medium">
            {nights} night{nights !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Guests */}
      {hasRooms && (
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Guests
          </label>
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="text-sm text-gray-700">
                {guests} guest{guests !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-gray-900">{guests}</span>
              <button
                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                disabled={guests >= maxGuests}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Max {maxGuests} guest{maxGuests !== 1 ? 's' : ''} for this room
          </p>
        </div>
      )}

      {/* Price breakdown */}
      {nights > 0 && selectedRoom && (
        <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              ${pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}
            </span>
            <span>${total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total before taxes</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={!canReserve}
        className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-brand-200 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {canReserve ? (
          <>Reserve Stay <ChevronRight className="w-4 h-4" /></>
        ) : !hasRooms ? (
          'No rooms available'
        ) : nights === 0 ? (
          'Select your dates'
        ) : (
          'Unable to reserve'
        )}
      </button>

      {/* Trust info */}
      <div className="mt-4 space-y-2">
        {stay.cancellationPolicy && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{stay.cancellationPolicy}</span>
          </div>
        )}
        {(stay.checkInTime || stay.checkOutTime) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            {stay.checkInTime && `Check-in from ${stay.checkInTime}`}
            {stay.checkInTime && stay.checkOutTime && ' · '}
            {stay.checkOutTime && `Check-out by ${stay.checkOutTime}`}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        You won&apos;t be charged yet
      </p>
    </div>
  )
}
