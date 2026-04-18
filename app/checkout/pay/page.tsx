'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { initiatePayment } from '@/lib/api/payments'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

function PayContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const bookingId = params.get('bookingId') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'starting' | 'redirecting'>('idle')
  const started = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/checkout/pay?bookingId=${bookingId}`)}`)
      return
    }
    if (!bookingId) {
      setError('Missing booking. Please start checkout again.')
      return
    }
    if (started.current) return
    started.current = true

    let cancelled = false
    async function start() {
      setPhase('starting')
      setError(null)
      try {
        const token = await getFreshAccessToken()
        if (!token) {
          setError('Session expired. Please sign in again.')
          return
        }
        const res = await initiatePayment(bookingId, token)
        if (cancelled) return
        setPhase('redirecting')
        if (res.deeplinkUrl && typeof window !== 'undefined' && /iPhone|Android/i.test(navigator.userAgent)) {
          window.location.href = res.deeplinkUrl
          return
        }
        window.location.href = res.followUpUrl
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError) {
          setError(e.message || 'Could not start payment.')
        } else {
          setError('Could not start payment.')
        }
        setPhase('idle')
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [bookingId, session, status, router])

  if (!bookingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-600 text-center">Missing booking information.</p>
        <Link href="/tours" className="text-brand-600 font-semibold text-sm">Browse tours</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">{error}</p>
        <Link href="/account/trips" className="text-brand-600 font-semibold text-sm">My trips</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      <p className="text-sm text-gray-600">
        {phase === 'redirecting' ? 'Redirecting to secure payment…' : 'Starting secure payment…'}
      </p>
    </div>
  )
}

export default function CheckoutPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <PayContent />
    </Suspense>
  )
}
