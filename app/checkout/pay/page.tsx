'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, AlertTriangle, ExternalLink, Smartphone } from 'lucide-react'
import { getPaymentStatus, initiatePayment, type InitiatePaymentResponse } from '@/lib/api/payments'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Bonum returns `qrImage` as raw base64; browsers need a full data URL for `<img src>`. */
function normalizeBonumQrImageSrc(qrImage: string | null | undefined): string | null {
  if (qrImage == null || typeof qrImage !== 'string') return null
  const t = qrImage.trim()
  if (!t) return null
  if (t.startsWith('data:image')) return t
  return `data:image/png;base64,${t}`
}

type UiPhase =
  | 'starting'
  | 'qr_ready'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'hosted_fallback'

function PayContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const bookingId = params.get('bookingId') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<UiPhase>('starting')
  const [payload, setPayload] = useState<InitiatePaymentResponse | null>(null)
  const [pollMessage, setPollMessage] = useState<string | null>(null)
  const pollStarted = useRef(false)

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)
  }, [])

  const qrImageDataUrl = useMemo(() => {
    const raw = payload?.qrImage
    if (raw == null || typeof raw !== 'string') return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    const hasDataPrefix = trimmed.startsWith('data:image')
    const normalized = normalizeBonumQrImageSrc(trimmed)
    if (normalized) {
      // TEMP: remove after QR display verified in prod
      console.log('[checkout/pay] qrImage', {
        hasDataUrlPrefix: hasDataPrefix,
        normalizedSrcLength: normalized.length,
      })
    }
    return normalized
  }, [payload?.qrImage])

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
          setPhase('failed')
          return
        }
        const res = await initiatePayment(bookingId, token)
        if (cancelled) return

        setPayload(res)

        if (res.checkoutMode === 'qr' && res.qrCode) {
          setPhase('qr_ready')
          return
        }
        if (res.followUpUrl?.trim()) {
          setPhase('hosted_fallback')
          return
        }
        setError('Payment could not start: no QR data and no hosted link. Please try again.')
        setPhase('failed')
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError) {
          setError(e.message || 'Could not start payment.')
        } else {
          setError('Could not start payment.')
        }
        setPhase('failed')
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [bookingId, session, status, router])

  const paymentId = payload?.paymentId ?? ''

  useEffect(() => {
    if (phase !== 'qr_ready') return
    if (!paymentId) return
    if (pollStarted.current) return
    pollStarted.current = true
    setPhase('processing')

    let cancelled = false
    ;(async () => {
      const token = await getFreshAccessToken()
      if (!token || cancelled) {
        setError('Session expired. Please sign in again.')
        setPhase('failed')
        return
      }
      for (let i = 0; i < 120; i++) {
        if (cancelled) return
        try {
          const s = await getPaymentStatus(paymentId, token)
          if (s.paymentStatus === 'paid' && s.bookingStatus === 'confirmed') {
            setPhase('paid')
            router.replace(`/booking-success?bookingCode=${encodeURIComponent(s.bookingCode)}`)
            return
          }
          if (s.bookingStatus === 'cancelled') {
            setPhase('expired')
            setPollMessage('This booking is no longer active.')
            return
          }
          if (s.paymentStatus === 'failed') {
            setPhase('failed')
            setPollMessage('Payment was not completed.')
            return
          }
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setPhase('failed')
            setPollMessage('Payment not found.')
            return
          }
        }
        const hold = payload?.holdExpiresAt ? new Date(payload.holdExpiresAt).getTime() : 0
        if (hold && Date.now() > hold) {
          setPhase('expired')
          setPollMessage('Payment window expired.')
          return
        }
        await sleep(2000)
      }
      setPollMessage('Still confirming… Check My trips if this does not update.')
    })()

    return () => {
      cancelled = true
    }
  }, [phase, paymentId, router, payload?.holdExpiresAt])

  const openHosted = useCallback(() => {
    const url = payload?.followUpUrl?.trim()
    if (url) window.location.href = url
  }, [payload?.followUpUrl])

  if (!bookingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-600 text-center">Missing booking information.</p>
        <Link href="/tours" className="text-brand-600 font-semibold text-sm">Browse tours</Link>
      </div>
    )
  }

  if (error && phase === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">{pollMessage ?? error}</p>
        <Link href="/account/trips" className="text-brand-600 font-semibold text-sm">My trips</Link>
      </div>
    )
  }

  if (phase === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 max-w-md mx-auto text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-gray-800">{pollMessage ?? 'Payment window expired.'}</p>
        <Link href="/account/trips" className="text-brand-600 font-semibold text-sm">My trips</Link>
      </div>
    )
  }

  if (phase === 'starting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm text-gray-600">Starting secure payment…</p>
      </div>
    )
  }

  if (phase === 'hosted_fallback' && payload?.followUpUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 max-w-md mx-auto text-center">
        <p className="text-sm text-gray-700">
          Open the secure Bonum payment page to complete your payment. We will confirm automatically when it finishes.
        </p>
        <button
          type="button"
          onClick={openHosted}
          className="inline-flex items-center justify-center gap-2 bg-brand-500 text-white font-semibold text-sm px-6 py-3 rounded-xl"
        >
          <ExternalLink className="w-4 h-4" />
          Open payment page
        </button>
        <Link href="/account/trips" className="text-sm text-gray-600 underline">My trips</Link>
      </div>
    )
  }

  if ((phase === 'qr_ready' || phase === 'processing' || phase === 'paid') && payload) {
    const exp = payload.expiresAt ? new Date(payload.expiresAt) : null
    const hold = payload.holdExpiresAt ? new Date(payload.holdExpiresAt) : null

    return (
      <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 max-w-lg mx-auto gap-6">
        <div className="text-center w-full">
          <h1 className="text-lg font-bold text-gray-900">Complete payment</h1>
          <p className="text-sm text-gray-600 mt-1">
            {phase === 'processing' || phase === 'paid'
              ? 'Waiting for payment confirmation…'
              : 'Scan the QR code or use your bank app.'}
          </p>
          {(exp || hold) && (
            <p className="text-xs text-gray-500 mt-2">
              {hold && `Hold until ${hold.toLocaleString()}`}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8 items-start">
          {/* Mobile: deeplinks first */}
          <div
            className={`flex flex-col gap-3 w-full ${isMobile ? 'order-1' : 'order-2 md:order-2'} md:w-1/2`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Smartphone className="w-4 h-4" />
              {isMobile ? 'Pay with your bank app' : 'Bank apps (optional)'}
            </div>
            {payload.deeplinks?.length ? (
              <div className="flex flex-col gap-2">
                {payload.deeplinks.map((d, i) => (
                  <a
                    key={`${d.url}-${i}`}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white text-sm font-semibold py-3 px-4 hover:bg-gray-800"
                  >
                    {d.label ?? 'Open bank app'}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No deeplinks were returned for this session.</p>
            )}
          </div>

          <div
            className={`flex flex-col items-center gap-3 w-full ${isMobile ? 'order-2' : 'order-1 md:order-1'} md:w-1/2`}
          >
            <div className="text-sm font-medium text-gray-700">
              {isMobile ? 'Or scan QR' : 'Scan QR code'}
            </div>
            {qrImageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImageDataUrl}
                alt="Payment QR"
                className="w-56 h-56 md:w-64 md:h-64 object-contain rounded-xl border border-gray-200 bg-white p-2"
              />
            ) : (
              <div className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 p-4 text-center break-all">
                {payload.qrCode}
              </div>
            )}
          </div>
        </div>

        {(phase === 'processing' || phase === 'paid') && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            {pollMessage ?? 'Confirming with your bank…'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      <p className="text-sm text-gray-600">Loading…</p>
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
