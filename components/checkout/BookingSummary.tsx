'use client'

import { CalendarDays, Users, Clock, MapPin, Shield, Tag } from 'lucide-react'
import { calcServiceFee } from '@/lib/booking'

interface BookingSummaryProps {
  tourTitle: string
  tourLocation: string
  tourDuration: string
  tourImage?: string
  date: string
  guests: number
  pricePerPerson: number
  slug: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'To be confirmed'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function BookingSummary({
  tourTitle, tourLocation, tourDuration, tourImage, date, guests, pricePerPerson, slug,
}: BookingSummaryProps) {
  const subtotal = pricePerPerson * guests
  const serviceFee = calcServiceFee(subtotal)
  const total = subtotal + serviceFee

  return (
    <div className="space-y-4">
      {/* Tour card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {tourImage && (
          <div className="h-36 overflow-hidden">
            <img src={tourImage} alt={tourTitle} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-5">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Your tour</p>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-3">{tourTitle}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
              {tourLocation}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 text-green-500 shrink-0" />
              {tourDuration}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-3.5 h-3.5 text-green-500 shrink-0" />
              {formatDate(date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-3.5 h-3.5 text-green-500 shrink-0" />
              {guests} guest{guests !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Price Details</h4>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              ${pricePerPerson} × {guests} guest{guests !== 1 ? 's' : ''}
            </span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              Service fee
            </span>
            <span>${serviceFee}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-lg">${total.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">All prices in USD · Taxes may apply at destination</p>
      </div>

      {/* Trust badges */}
      <div className="bg-green-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-green-800 font-medium">
          <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
          Free cancellation up to 7 days before your tour
        </div>
        <div className="flex items-center gap-2 text-xs text-green-800 font-medium">
          <svg className="w-3.5 h-3.5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instant booking confirmation
        </div>
        <div className="flex items-center gap-2 text-xs text-green-800 font-medium">
          <svg className="w-3.5 h-3.5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          24/7 traveler support
        </div>
      </div>
    </div>
  )
}
