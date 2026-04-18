'use client'

import { Suspense, useEffect, useState } from 'react'
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

    let cancelled = false
    async function start() {
      setPhase('starting')
      setError(null)
      try {
        const token = await getFreshAccessToken()
        if (!token) {
          setError('Session expired. Please sign in again.')
          setPhase('idle')
          return
        }
        const res = await initiatePayment(bookingId, token)
        // TEMP debug — remove after payment redirect verified in prod
        console.log('[checkout/pay] initiate response payload', res)
        const followUpUrl = typeof res.followUpUrl === 'string' ? res.followUpUrl.trim() : ''
        console.log('[checkout/pay] resolved followUpUrl', followUpUrl || '(empty)')
        if (cancelled) {
          console.log('[checkout/pay] skipped redirect (effect cleaned up)')
          return
        }
        if (!followUpUrl) {
          console.error('[checkout/pay] missing followUpUrl in initiate response', res)
          setError('Payment could not start: missing redirect URL. Please try again.')
          setPhase('idle')
          return
        }
        setPhase('redirecting')
        if (res.deeplinkUrl && typeof window !== 'undefined' && /iPhone|Android/i.test(navigator.userAgent)) {
          console.log('[checkout/pay] redirect deeplink')
          window.location.href = res.deeplinkUrl
          return
        }
        console.log('[checkout/pay] redirect followUpUrl')
        window.location.href = followUpUrl
      } catch (e) {
        if (cancelled) {
          console.log('[checkout/pay] initiate error ignored (effect cleaned up)', e)
          return
        }
        if (e instanceof ApiError) {
          console.error('[checkout/pay] initiate API error', e.status, e.message)
          setError(e.message || 'Could not start payment.')
        } else {
          console.error('[checkout/pay] initiate unexpected error', e)
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
