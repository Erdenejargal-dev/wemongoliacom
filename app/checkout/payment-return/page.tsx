'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { getPaymentStatus, retryPayment } from '@/lib/api/payments'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function ReturnContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const paymentId = params.get('paymentId') ?? ''
  const stub = params.get('stub') === '1'

  const [ui, setUi] = useState<'processing' | 'failed' | 'expired'>('processing')
  const [message, setMessage] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/checkout/payment-return?paymentId=${paymentId}`)}`)
      return
    }
    if (!paymentId) {
      setUi('failed')
      setMessage('Missing payment reference.')
      return
    }
    if (ran.current) return
    ran.current = true

    let cancelled = false

    ;(async () => {
      const token = await getFreshAccessToken()
      if (!token || cancelled) {
        setUi('failed')
        setMessage('Session expired. Please sign in again.')
        return
      }
      for (let i = 0; i < 90; i++) {
        if (cancelled) return
        try {
          const s = await getPaymentStatus(paymentId, token)
          if (s.paymentStatus === 'paid' && s.bookingStatus === 'confirmed') {
            router.replace(`/booking-success?bookingCode=${encodeURIComponent(s.bookingCode)}`)
            return
          }
          if (s.bookingStatus === 'cancelled') {
            setUi('expired')
            setMessage('This booking is no longer active.')
            return
          }
          if (s.paymentStatus === 'failed') {
            setUi('failed')
            setMessage('Payment was not completed.')
            return
          }
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setUi('failed')
            setMessage('Payment not found.')
            return
          }
        }
        await sleep(2000)
      }
      setMessage('Still confirming… Check My trips in a few minutes if this does not update.')
    })()

    return () => {
      cancelled = true
    }
  }, [session, status, paymentId, router])

  async function handleRetry() {
    setUi('processing')
    setMessage(null)
    try {
      const token = await getFreshAccessToken()
      if (!token) return
      const res = await retryPayment(paymentId, token)
      if (res.followUpUrl?.trim()) {
        window.location.href = res.followUpUrl
        return
      }
      if (res.checkoutMode === 'qr') {
        const st = await getPaymentStatus(paymentId, token)
        router.push(`/checkout/pay?bookingId=${encodeURIComponent(st.bookingId)}`)
        return
      }
      setMessage('Could not resume payment. Please open your trip and try again.')
    } catch (e) {
      setUi('failed')
      setMessage(e instanceof ApiError ? e.message : 'Retry failed.')
    }
  }

  if (!paymentId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-600">Missing payment reference.</p>
        <Link href="/tours" className="text-brand-600 font-semibold text-sm">Browse tours</Link>
      </div>
    )
  }

  if (ui === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">{message ?? 'Payment failed.'}</p>
        <button
          type="button"
          onClick={() => handleRetry()}
          className="inline-flex items-center gap-2 bg-brand-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link href="/account/trips" className="text-sm text-gray-600 underline">My trips</Link>
      </div>
    )
  }

  if (ui === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">{message ?? 'Booking expired.'}</p>
        <Link href="/tours" className="text-brand-600 font-semibold text-sm">Browse tours</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      <h1 className="text-lg font-bold text-gray-900">Confirming payment</h1>
      <p className="text-sm text-gray-600">
        {message ?? 'Please wait while we confirm payment. This usually takes a few seconds.'}
      </p>
      {stub && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
          Dev stub: POST /api/v1/internal/dev/bonum-simulate-paid/:paymentId with CRON_SECRET to simulate success.
        </p>
      )}
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  )
}
