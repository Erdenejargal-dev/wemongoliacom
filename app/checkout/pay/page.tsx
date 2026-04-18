'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Loader2,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Clock,
  Lock,
  LifeBuoy,
  ChevronDown,
} from 'lucide-react'
import {
  getBonumAndroidPackage,
  getBonumAppStoreId,
  getBonumBankDescription,
  getBonumBankDisplayName,
  getBonumBankLogo,
  getBonumDeeplinkHref,
  getPaymentStatus,
  initiatePayment,
  type InitiatePaymentResponse,
} from '@/lib/api/payments'
import { BankDeeplinkCard } from '@/components/checkout/BankDeeplinkCard'
import { partitionPreferredBankDeeplinks } from '@/lib/checkout/preferred-bank-deeplinks'
import {
  clearCheckoutPayPayload,
  loadCheckoutPayPayload,
  saveCheckoutPayPayload,
} from '@/lib/checkout-session-storage'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

/** Dedupe concurrent initiate calls for the same booking (e.g. React Strict Mode, effect re-runs). */
const initiatePromiseByBookingId = new Map<string, Promise<InitiatePaymentResponse>>()

/** Premium accent — WeMongolia checkout */
const ACCENT = '#0489d1'

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

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style:    'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function PayContent() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  const bookingId = params.get('bookingId') ?? ''
  const searchParamsString = params.toString()

  const loginHref = useMemo(() => {
    const target = `${pathname}${searchParamsString ? `?${searchParamsString}` : ''}`
    return `/auth/login?callbackUrl=${encodeURIComponent(target)}`
  }, [pathname, searchParamsString])

  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<UiPhase>('starting')
  const [payload, setPayload] = useState<InitiatePaymentResponse | null>(null)
  const [pollMessage, setPollMessage] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [showAllBankApps, setShowAllBankApps] = useState(false)
  const pollStarted = useRef(false)
  const phaseRef = useRef(phase)

  useLayoutEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useLayoutEffect(() => {
    if (!bookingId || typeof window === 'undefined') return
    const saved = loadCheckoutPayPayload(bookingId)
    if (saved?.bookingId === bookingId) {
      /* eslint-disable react-hooks/set-state-in-effect -- sync read from sessionStorage before paint */
      setPayload(saved)
      setPhase('qr_ready')
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [bookingId])

  useEffect(() => {
    if (payload?.bookingId === bookingId) {
      saveCheckoutPayPayload(bookingId, payload)
    }
  }, [payload, bookingId])

  useEffect(() => {
    if (!sessionExpired) return
    let cancelled = false
    ;(async () => {
      const token = await getFreshAccessToken()
      if (cancelled) return
      if (token) {
        setSessionExpired(false)
        setPollMessage(null)
        pollStarted.current = false
        setPhase((p) => (p === 'processing' || p === 'paid' ? 'qr_ready' : p))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionExpired, status])

  useEffect(() => {
    pollStarted.current = false
  }, [bookingId])

  const qrImageDataUrl = useMemo(() => {
    const raw = payload?.qrImage
    if (raw == null || typeof raw !== 'string') return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    return normalizeBonumQrImageSrc(trimmed)
  }, [payload?.qrImage])

  useEffect(() => {
    if (status === 'loading') return
    if (!bookingId) return
    if (status === 'unauthenticated') return
    if (status !== 'authenticated') return

    if (payload?.bookingId === bookingId) {
      return
    }

    let cancelled = false
    async function start() {
      setPhase('starting')
      setError(null)
      try {
        const token = await getFreshAccessToken()
        if (!token) {
          setSessionExpired(true)
          setPollMessage('Sign in again to continue payment.')
          return
        }

        let p = initiatePromiseByBookingId.get(bookingId)
        if (!p) {
          p = initiatePayment(bookingId, token).finally(() => {
            initiatePromiseByBookingId.delete(bookingId)
          })
          initiatePromiseByBookingId.set(bookingId, p)
        }

        const res = await p
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
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setSessionExpired(true)
          setPollMessage('Sign in again to continue payment.')
          return
        }
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
  }, [bookingId, status, payload?.bookingId])

  const paymentId = payload?.paymentId ?? ''

  const bankOptions = useMemo(() => {
    if (!payload?.deeplinks?.length) return []
    return payload.deeplinks.filter((d) => getBonumDeeplinkHref(d))
  }, [payload?.deeplinks])

  const firstBankDeeplinkSample = bankOptions[0]

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!firstBankDeeplinkSample) return
    console.log('[checkout pay] deeplink debug (first usable link)', {
      raw:             firstBankDeeplinkSample,
      resolvedLogoUrl: getBonumBankLogo(firstBankDeeplinkSample),
    })
  }, [firstBankDeeplinkSample])

  const { initial: preferredBankApps, more: moreBankApps } = useMemo(
    () => partitionPreferredBankDeeplinks(bankOptions),
    [bankOptions],
  )

  useEffect(() => {
    setShowAllBankApps(false)
  }, [bankOptions])

  const visibleBankApps = showAllBankApps ? bankOptions : preferredBankApps
  const hasMoreBankApps = moreBankApps.length > 0

  useEffect(() => {
    if (phaseRef.current !== 'qr_ready') return
    if (!paymentId) return
    if (status === 'loading') return
    if (pollStarted.current) return
    pollStarted.current = true
    queueMicrotask(() => {
      setPhase('processing')
    })

    let cancelled = false
    ;(async () => {
      const token = await getFreshAccessToken()
      if (cancelled) return
      if (!token) {
        pollStarted.current = false
        setSessionExpired(true)
        setPollMessage('Sign in again to refresh payment status.')
        return
      }
      for (let i = 0; i < 120; i++) {
        if (cancelled) return
        try {
          const s = await getPaymentStatus(paymentId, token)
          if (s.paymentStatus === 'paid' && s.bookingStatus === 'confirmed') {
            setPhase('paid')
            clearCheckoutPayPayload(bookingId)
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
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            pollStarted.current = false
            setSessionExpired(true)
            setPollMessage('Sign in again to refresh payment status.')
            return
          }
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
  }, [paymentId, router, payload?.holdExpiresAt, bookingId, status, sessionExpired])

  const openHosted = useCallback(() => {
    const url = payload?.followUpUrl?.trim()
    if (url) window.location.href = url
  }, [payload?.followUpUrl])

  const showAuthRecovery = status === 'unauthenticated' || sessionExpired

  const shellClass =
    'min-h-screen bg-gradient-to-b from-slate-50 via-white to-[#e8f4fb]/40 text-slate-900'

  const cardClass =
    'rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)]'

  if (!bookingId) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center px-4 py-16`}>
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
            aria-hidden
          >
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">We couldn’t find this checkout</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Start again from your trip or browse available tours.
          </p>
          <Link
            href="/tours"
            className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: ACCENT }}
          >
            Browse tours
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'loading' && !payload) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center gap-4 px-4 py-24`}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: ACCENT }} />
        <p className="text-sm font-medium text-slate-600">Preparing your secure checkout…</p>
      </div>
    )
  }

  if (showAuthRecovery && !payload) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center px-4 py-16`}>
        <div className={`${cardClass} w-full max-w-md overflow-hidden`}>
          <div className="border-b border-amber-100 bg-amber-50/90 px-6 py-4">
            <p className="text-sm font-semibold text-amber-950">Sign in to continue</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900/85">
              {pollMessage ??
                (status === 'unauthenticated'
                  ? 'Sign in to open your secure payment and complete this booking.'
                  : 'Your session ended. Sign in once more to finish paying safely.')}
            </p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <Link
              href={loginHref}
              className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
              style={{ backgroundColor: ACCENT }}
            >
              Sign in to pay
            </Link>
            <Link
              href="/account/trips"
              className="block text-center text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
            >
              View my trips
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error && phase === 'failed' && !sessionExpired) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center px-4 py-16`}>
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
            aria-hidden
          >
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Payment couldn’t be completed</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{pollMessage ?? error}</p>
          <Link
            href="/account/trips"
            className="mt-6 inline-block text-sm font-semibold underline-offset-4 hover:underline"
            style={{ color: ACCENT }}
          >
            Go to My trips
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'expired') {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center px-4 py-16`}>
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
            aria-hidden
          >
            <Clock className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">This reservation window closed</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {pollMessage ?? 'The time to complete payment has passed. You can start a new booking when you’re ready.'}
          </p>
          <Link
            href="/account/trips"
            className="mt-6 inline-block text-sm font-semibold underline-offset-4 hover:underline"
            style={{ color: ACCENT }}
          >
            Go to My trips
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'starting' && !showAuthRecovery) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center gap-4 px-4 py-24`}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: ACCENT }} />
        <p className="text-sm font-medium text-slate-600">Setting up your secure payment…</p>
      </div>
    )
  }

  if (phase === 'hosted_fallback' && payload?.followUpUrl) {
    return (
      <div className={`${shellClass} px-4 py-10 sm:px-6 lg:py-14`}>
        <div className="mx-auto max-w-lg">
          {showAuthRecovery && (
            <div
              className={`${cardClass} mb-6 border-amber-200/80 bg-amber-50/95 px-5 py-4 text-left text-amber-950`}
            >
              <p className="font-semibold">Sign in to see your payment status</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/90">
                {pollMessage ??
                  'You can still pay on the next screen. Sign in so we can confirm your trip automatically.'}
              </p>
              <Link
                href={loginHref}
                className="mt-3 inline-block text-sm font-semibold underline-offset-4"
                style={{ color: ACCENT }}
              >
                Sign in
              </Link>
            </div>
          )}
          <div className={`${cardClass} p-8 text-center`}>
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: ACCENT }}
            >
              <ExternalLink className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Continue on the payment page</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              You’ll complete payment in a secure window. We’ll confirm your booking as soon as it succeeds.
            </p>
            <button
              type="button"
              onClick={openHosted}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:opacity-95 sm:w-auto sm:min-w-[240px] sm:px-10"
              style={{ backgroundColor: ACCENT }}
            >
              <ExternalLink className="h-4 w-4" />
              Open secure payment
            </button>
            <Link
              href="/account/trips"
              className="mt-6 inline-block text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
            >
              View my trips
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if ((phase === 'qr_ready' || phase === 'processing' || phase === 'paid') && payload) {
    const hold = payload.holdExpiresAt ? new Date(payload.holdExpiresAt) : null
    const confirming = phase === 'processing' || phase === 'paid'
    const statusLabel = showAuthRecovery
      ? 'Waiting for sign-in'
      : confirming
        ? 'Confirming payment'
        : 'Ready to pay'
    const statusDetail = showAuthRecovery
      ? (pollMessage ??
        'Your QR code is still valid. Sign in so we can mark this trip as paid when your bank finishes.')
      : confirming
        ? (pollMessage ?? 'Hang tight — we’re confirming with your bank. This usually takes a few seconds.')
        : 'Scan the code or open your bank app. Your reservation stays on hold until the timer below.'

    return (
      <div className={`${shellClass}`}>
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
              <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Complete your payment
              </h1>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                Secure payment
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          {showAuthRecovery && (
            <div
              className={`${cardClass} mb-8 border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-50/30 p-5 sm:p-6`}
            >
              <p className="font-semibold text-amber-950">Sign in to refresh status</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-amber-900/90">
                {pollMessage ??
                  'Keep this page open. Your QR code still works — sign in so we can confirm payment when your transfer completes.'}
              </p>
              <Link
                href={loginHref}
                className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                style={{ backgroundColor: ACCENT }}
              >
                Sign in again
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
            {/* Left: summary + trust — mobile order last */}
            <aside className="order-3 space-y-6 lg:order-1 lg:col-span-5">
              <div className={`${cardClass} overflow-hidden`}>
                <div
                  className="border-b border-slate-100 px-5 py-4 sm:px-6"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}08 0%, white 60%)` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trip summary</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{payload.bookingCode}</p>
                </div>
                <div className="space-y-4 px-5 py-5 sm:px-6">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm text-slate-600">Total due</span>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                      {formatMoney(payload.amount, payload.currency)}
                    </span>
                  </div>
                  {hold && (
                    <div
                      className="flex items-start gap-3 rounded-xl border border-[#0489d1]/20 bg-[#0489d1]/[0.06] px-4 py-3"
                    >
                      <Clock className="mt-0.5 h-5 w-5 shrink-0" style={{ color: ACCENT }} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Reservation timer
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">
                          Held until {hold.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Complete payment before this time to keep this price and availability.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop trust block */}
              <div className={`${cardClass} hidden p-5 sm:p-6 lg:block`}>
                <div className="flex gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Encrypted checkout</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Your payment is processed through trusted partners. We never store your card details on this page
                      for QR bank transfers.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${cardClass} hidden p-5 sm:p-6 lg:block`}>
                <div className="flex gap-3">
                  <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Need help?</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      If payment succeeds but this screen doesn’t update, check your email or visit{' '}
                      <Link href="/account/trips" className="font-medium underline-offset-4 hover:underline" style={{ color: ACCENT }}>
                        My trips
                      </Link>{' '}
                      — your booking may already be confirmed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile: collapsible summary duplicate for compact trust */}
              <details className={`${cardClass} group lg:hidden`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  Trip details & help
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 px-5 pb-5 pt-2 text-sm leading-relaxed text-slate-600">
                  <p className="flex items-center gap-2 py-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                    Secure, encrypted checkout with our payment partner.
                  </p>
                  <p className="py-2">
                    Questions? Visit{' '}
                    <Link href="/account/trips" className="font-medium underline-offset-4 hover:underline" style={{ color: ACCENT }}>
                      My trips
                    </Link>{' '}
                    or contact support if your bank shows a completed transfer.
                  </p>
                </div>
              </details>
            </aside>

            {/* Right: QR first, then bank apps, then status */}
            <section className="order-1 space-y-6 lg:order-2 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:hidden">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  Secure payment
                </span>
                {hold && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0489d1]/25 bg-[#0489d1]/10 px-3 py-1.5 text-xs font-semibold text-slate-800">
                    <Clock className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                    Timer active
                  </span>
                )}
              </div>

              {/* QR */}
              <div
                className={`${cardClass} p-6 sm:p-8`}
                style={{ boxShadow: `0 12px 48px -12px ${ACCENT}33` }}
              >
                <p className="text-center text-sm font-semibold text-slate-900 lg:text-base">Scan QR to pay</p>
                <p className="mx-auto mt-1 max-w-sm text-center text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Open your banking app and scan — amount and reference are included in the code.
                </p>
                <div className="mt-6 flex justify-center">
                  {qrImageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrImageDataUrl}
                      alt=""
                      className="h-64 w-64 max-w-[85vw] rounded-2xl border border-white bg-white object-contain p-4 shadow-inner ring-1 ring-slate-200/80 sm:h-72 sm:w-72 lg:h-80 lg:w-80"
                    />
                  ) : (
                    <div className="flex h-64 w-64 max-w-[85vw] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs leading-relaxed text-slate-500 sm:h-72 sm:w-72">
                      QR image unavailable — use a bank app below if available.
                    </div>
                  )}
                </div>
              </div>

              {/* Bank apps */}
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Smartphone className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                    Pay with your bank app
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 lg:max-w-md">
                    Or choose your bank — we’ll open the app with this payment ready.
                  </p>
                </div>
                {bankOptions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {visibleBankApps.map((d, i) => (
                      <BankDeeplinkCard
                        key={`${getBonumDeeplinkHref(d)}-${i}`}
                        href={getBonumDeeplinkHref(d)}
                        name={getBonumBankDisplayName(d)}
                        description={getBonumBankDescription(d)}
                        logoUrl={getBonumBankLogo(d)}
                        appStoreId={getBonumAppStoreId(d)}
                        androidPackageName={getBonumAndroidPackage(d)}
                        accent={ACCENT}
                        onLogoError={
                          firstBankDeeplinkSample &&
                          getBonumDeeplinkHref(d) === getBonumDeeplinkHref(firstBankDeeplinkSample)
                            ? () =>
                                console.log(
                                  '[checkout pay] deeplink debug (first usable link): logo fallback triggered (image onError)',
                                )
                            : undefined
                        }
                      />
                    ))}
                    {hasMoreBankApps ? (
                      <button
                        type="button"
                        onClick={() => setShowAllBankApps((v) => !v)}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${
                          showAllBankApps ? 'text-slate-800' : ''
                        }`}
                        style={showAllBankApps ? undefined : { color: ACCENT }}
                        aria-expanded={showAllBankApps}
                      >
                        {showAllBankApps ? (
                          <>Show fewer banks</>
                        ) : (
                          <>
                            Show all payment apps
                            <span className="text-xs font-medium text-slate-500">
                              ({moreBankApps.length} more)
                            </span>
                          </>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-500 transition ${showAllBankApps ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-4 text-sm leading-relaxed text-slate-600">
                    No bank shortcuts for this session. Use the QR code above — it works with any supported banking app.
                  </p>
                )}
              </div>

              {/* Payment status */}
              <div className={`${cardClass} overflow-hidden`}>
                <div
                  className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 sm:px-6"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}12, transparent)` }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Payment status</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="px-5 py-4 sm:px-6">
                  {!showAuthRecovery && confirming && (
                    <div className="flex items-start gap-3">
                      <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" style={{ color: ACCENT }} />
                      <p className="text-sm leading-relaxed text-slate-700">{statusDetail}</p>
                    </div>
                  )}
                  {(showAuthRecovery || !confirming) && (
                    <p className="text-sm leading-relaxed text-slate-700">{statusDetail}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`${shellClass} flex flex-col items-center justify-center gap-3 px-4 py-24`}>
      <Loader2 className="h-10 w-10 animate-spin" style={{ color: ACCENT }} />
      <p className="text-sm font-medium text-slate-600">Almost there…</p>
    </div>
  )
}

export default function CheckoutPayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-white px-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0489d1]" />
          <p className="text-sm font-medium text-slate-600">Loading checkout…</p>
        </div>
      }
    >
      <PayContent />
    </Suspense>
  )
}
