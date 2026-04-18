'use client'

import { Suspense, useEffect, useMemo, useState, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  const paymentId = params.get('paymentId') ?? ''
  const stub = params.get('stub') === '1'
  const searchParamsString = params.toString()

  const loginHref = useMemo(() => {
    const target = `${pathname}${searchParamsString ? `?${searchParamsString}` : ''}`
    return `/auth/login?callbackUrl=${encodeURIComponent(target)}`
  }, [pathname, searchParamsString])

  const [ui, setUi] = useState<'processing' | 'failed' | 'expired'>('processing')
  const [message, setMessage] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (!sessionExpired) return
    let cancelled = false
    ;(async () => {
      const token = await getFreshAccessToken()
      if (cancelled) return
      if (token) {
        setSessionExpired(false)
        setMessage(null)
        ran.current = false
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionExpired, status])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return
    if (sessionExpired) return
    if (!paymentId) return
    if (ran.current) return
    ran.current = true

    let cancelled = false

    ;(async () => {
      const token = await getFreshAccessToken()
      if (cancelled) return
      if (!token) {
        ran.current = false
        setSessionExpired(true)
        setMessage('Sign in again to refresh payment status.')
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
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            ran.current = false
            setSessionExpired(true)
            setMessage('Sign in again to refresh payment status.')
            return
          }
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
  }, [status, paymentId, router, sessionExpired])

  async function handleRetry() {
    setUi('processing')
    setMessage(null)
    setSessionExpired(false)
    ran.current = false
    try {
      const token = await getFreshAccessToken()
      if (!token) {
        setSessionExpired(true)
        setMessage('Sign in again to continue.')
        return
      }
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">Sign in to confirm your payment and finish checkout.</p>
        <Link
          href={loginHref}
          className="inline-flex items-center justify-center gap-2 bg-brand-500 text-white font-semibold text-sm px-6 py-3 rounded-xl"
        >
          Sign in again
        </Link>
        <Link href="/account/trips" className="text-sm text-gray-600 underline">
          My trips
        </Link>
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
      {sessionExpired && (
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 text-left">
          <p className="font-medium">Sign in again to refresh status</p>
          <p className="text-sm mt-1 text-amber-900/90">
            {message ?? 'We will resume confirming as soon as you are signed in.'}
          </p>
          <Link
            href={loginHref}
            className="inline-block mt-3 font-semibold text-brand-600 underline"
          >
            Sign in again
          </Link>
        </div>
      )}
      {!sessionExpired && <Loader2 className="w-10 h-10 animate-spin text-brand-500" />}
      <h1 className="text-lg font-bold text-gray-900">Confirming payment</h1>
      <p className="text-sm text-gray-600">
        {sessionExpired
          ? 'Waiting for a fresh sign-in to continue checking your payment.'
          : message ?? 'Please wait while we confirm payment. This usually takes a few seconds.'}
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
