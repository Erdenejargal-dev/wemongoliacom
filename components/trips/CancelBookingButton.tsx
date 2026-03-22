'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

interface CancelBookingButtonProps {
  bookingId: string
  listingTitle: string
  onConfirm: () => void
}

export function CancelBookingButton({ bookingId, listingTitle, onConfirm }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function handleConfirm() {
    setCancelling(true)
    await new Promise(r => setTimeout(r, 800))
    setCancelling(false)
    setOpen(false)
    onConfirm()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors py-1 px-2.5 rounded-lg hover:bg-red-50"
      >
        <X className="w-3.5 h-3.5" />
        Cancel Booking
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Cancel this trip?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-1">{listingTitle}</p>
              <p className="text-xs text-gray-400 mb-5">Booking ID: <span className="font-mono font-semibold text-gray-600">{bookingId}</span></p>
              <p className="text-sm text-gray-700 mb-5">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setOpen(false)} disabled={cancelling}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors">
                  Keep Booking
                </button>
                <button onClick={handleConfirm} disabled={cancelling}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                  {cancelling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Cancelling…</> : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
