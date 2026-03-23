'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { DEFAULT_ONBOARDING, type OnboardingState, type ProviderType } from '@/lib/mock-data/provider'
import { apiClient, ApiError } from '@/lib/api/client'
import { getFreshAccessToken } from '@/lib/auth-utils'

// ── Shared field wrapper ────────────────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

const INPUT =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors min-h-[44px]'

// ── Step 1: Business type ───────────────────────────────────────────────────
function StepBusinessType({ data, onNext }: { data: OnboardingState; onNext: (p: Partial<OnboardingState>) => void }) {
  type ProviderCombo = 'hotel' | 'tour_operator' | 'car_rental' | 'multiple'

  const comboFromProviderTypes = (providerTypes: ProviderType[]): ProviderCombo | null => {
    const sorted = [...providerTypes].sort().join(',')
    if (sorted === ['accommodation'].sort().join(',')) return 'hotel'
    if (sorted === ['tour_operator'].sort().join(',')) return 'tour_operator'
    if (sorted === ['car_rental'].sort().join(',')) return 'car_rental'
    if (sorted === ['accommodation', 'car_rental', 'tour_operator'].sort().join(',')) return 'multiple'
    return null
  }

  const toProviderTypes = (combo: ProviderCombo): ProviderType[] => {
    switch (combo) {
      case 'hotel':
        return ['accommodation']
      case 'tour_operator':
        return ['tour_operator']
      case 'car_rental':
        return ['car_rental']
      case 'multiple':
        return ['accommodation', 'tour_operator', 'car_rental']
    }
  }

  const [combo, setCombo] = useState<ProviderCombo | null>(comboFromProviderTypes(data.providerTypes))

  const Card = ({
    value,
    title,
    subtitle,
    badge,
    colorClass,
  }: {
    value: ProviderCombo
    title: string
    subtitle: string
    badge: string
    colorClass: string
  }) => {
    const selected = combo === value
    return (
      <button
        type="button"
        onClick={() => setCombo(value)}
        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 relative touch-manipulation ${
          selected ? colorClass : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
        }`}
        aria-pressed={selected}
      >
        {selected && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <div className="flex items-start gap-4">
          <span className="text-2xl shrink-0">{badge}</span>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-gray-900 mb-0.5">{title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">What do you offer?</h2>
        <p className="text-sm text-gray-600">Choose the option that fits your business. You can add more later.</p>
      </div>

      <div className="space-y-3">
        <Card
          value="tour_operator"
          title="Tours & experiences"
          subtitle="Guided tours, excursions, and adventures"
          badge="🗺️"
          colorClass="border-green-400 bg-green-50/50"
        />
        <Card
          value="hotel"
          title="Accommodation"
          subtitle="Hotels, ger camps, lodges"
          badge="🏨"
          colorClass="border-blue-400 bg-blue-50/50"
        />
        <Card
          value="car_rental"
          title="Transport & drivers"
          subtitle="Vehicle rentals and driver services"
          badge="🚐"
          colorClass="border-orange-400 bg-orange-50/50"
        />
        <Card
          value="multiple"
          title="All of the above"
          subtitle="Tours, stays, and transport"
          badge="✨"
          colorClass="border-gray-800 bg-gray-50"
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          disabled={!combo}
          onClick={() => combo && onNext({ providerTypes: toProviderTypes(combo) })}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl transition-colors touch-manipulation"
        >
          Next step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Basic info ───────────────────────────────────────────────────────
function StepBasicInfo({ data, onNext, onBack }: { data: OnboardingState; onNext: (p: Partial<OnboardingState>) => void; onBack: () => void }) {
  const [form, setForm] = useState({
    name: data.name,
    description: data.description,
    location: data.location,
    phone: data.phone,
    email: data.email,
    website: data.website,
  })

  function patch(p: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    onNext(form)
  }

  const canProceed = form.name.trim().length >= 2

  return (
    <form onSubmit={handleNext} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tell us about your business</h2>
        <p className="text-sm text-gray-600">Travelers will see this on your profile. You can edit it anytime.</p>
      </div>

      <Field label="Business name" required>
        <input
          required
          minLength={2}
          value={form.name}
          onChange={(e) => patch({ name: e.target.value })}
          className={INPUT}
          placeholder="e.g. Gobi Adventure Tours"
          autoComplete="organization"
        />
      </Field>

      <Field label="Short description" hint="What makes your business special?">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          className={`${INPUT} resize-none min-h-[80px]`}
          placeholder="We offer authentic Mongolian experiences…"
        />
      </Field>

      <Field label="City or location" required>
        <input
          required
          value={form.location}
          onChange={(e) => patch({ location: e.target.value })}
          className={INPUT}
          placeholder="e.g. Ulaanbaatar"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            className={INPUT}
            placeholder="info@yourbusiness.mn"
          />
        </Field>
        <Field label="Phone" required>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            className={INPUT}
            placeholder="+976 9900 0000"
          />
        </Field>
      </div>

      <Field label="Website" hint="Optional — add later if you prefer">
        <input
          type="url"
          value={form.website}
          onChange={(e) => patch({ website: e.target.value })}
          className={INPUT}
          placeholder="https://yourbusiness.mn"
        />
      </Field>

      <p className="text-xs text-gray-500">You can add a logo and more details in your dashboard after setup.</p>

      <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!canProceed}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl transition-colors touch-manipulation"
        >
          Next step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// ── Step 3: Review & submit ───────────────────────────────────────────────────
function StepReview({
  data,
  onFinish,
  onBack,
  saving,
}: {
  data: OnboardingState
  onFinish: (p: Partial<OnboardingState>) => void
  onBack: () => void
  saving: boolean
}) {
  const typeLabel =
    data.providerTypes.length === 3
      ? 'Tours, accommodation & transport'
      : data.providerTypes.includes('tour_operator')
        ? 'Tours & experiences'
        : data.providerTypes.includes('accommodation')
          ? 'Accommodation'
          : 'Transport & drivers'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">You&apos;re ready</h2>
        <p className="text-sm text-gray-600">Here&apos;s what we&apos;ll set up. No commitment — you can edit anything later.</p>
      </div>

      <div className="space-y-4 rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business</p>
          <p className="font-semibold text-gray-900">{data.name || '—'}</p>
          <p className="text-sm text-gray-600 mt-0.5">{typeLabel}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
          <p className="text-gray-900">{data.location || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
          <p className="text-gray-900">{data.email || '—'}</p>
          <p className="text-gray-900">{data.phone || '—'}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        We&apos;ll help you get your first customers. Once you submit, you&apos;ll land in your dashboard where you can add tours, rooms, or vehicles.
      </p>

      <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors touch-manipulation disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onFinish({})}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold text-base rounded-xl transition-colors touch-manipulation"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Setting up…
            </>
          ) : (
            <>Start receiving bookings</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main wizard ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<OnboardingState>(DEFAULT_ONBOARDING)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [checkingProvider, setCheckingProvider] = useState(true)

  function patch(p: Partial<OnboardingState>) {
    setData((prev) => ({ ...prev, ...p }))
  }

  function handleStep1(p: Partial<OnboardingState>) {
    patch(p)
    setStep(2)
  }
  function handleStep2(p: Partial<OnboardingState>) {
    patch(p)
    setStep(3)
  }
  function handleBack() {
    setStep((prev) => (prev - 1) as 1 | 2 | 3)
  }

  function mapProviderTypes(providerTypes: ProviderType[]): 'hotel' | 'tour_operator' | 'car_rental' | 'multiple' {
    const sorted = [...providerTypes].sort().join(',')
    if (sorted === ['accommodation', 'car_rental', 'tour_operator'].sort().join(',')) return 'multiple'
    if (sorted === ['accommodation'].sort().join(',')) return 'hotel'
    if (sorted === ['tour_operator'].sort().join(',')) return 'tour_operator'
    if (sorted === ['car_rental'].sort().join(',')) return 'car_rental'
    throw new Error('Invalid service selection.')
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    let alive = true
    async function check() {
      if (status !== 'authenticated' || !token) {
        setCheckingProvider(false)
        return
      }
      const freshToken = await getFreshAccessToken()
      if (!freshToken || !alive) {
        setCheckingProvider(false)
        return
      }
      setCheckingProvider(true)
      try {
        await apiClient.get('/provider/profile', freshToken, { cache: 'no-store' })
        if (alive) router.push('/dashboard/business')
      } catch (err: unknown) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) return
        if (err instanceof ApiError && err.status === 401) {
          if (alive) router.push('/auth/login')
          return
        }
        if (alive) setSubmitError(err instanceof Error ? err.message : 'Failed to verify provider profile.')
      } finally {
        if (alive) setCheckingProvider(false)
      }
    }
    check()
    return () => {
      alive = false
    }
  }, [status, token, router])

  if (status === 'loading' || checkingProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  async function handleFinish(p: Partial<OnboardingState>) {
    const final = { ...data, ...p }
    patch(p)
    setSaving(true)
    setSubmitError(null)

    const freshToken = await getFreshAccessToken()
    if (!freshToken) {
      setSubmitError('Session expired. Please log in again.')
      setSaving(false)
      router.push('/auth/login')
      return
    }

    let businessType: 'hotel' | 'tour_operator' | 'car_rental' | 'multiple'
    try {
      businessType = mapProviderTypes(final.providerTypes)
    } catch {
      setSubmitError('Please go back and select what you offer.')
      setSaving(false)
      return
    }

    try {
      await apiClient.post(
        '/account/provider',
        {
          businessName: final.name,
          businessType,
          description: final.description || undefined,
          contactEmail: final.email,
          contactPhone: final.phone,
          city: final.location,
          websiteUrl: final.website || undefined,
        },
        freshToken,
      )
      router.push('/dashboard/business')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setSubmitError('Session expired. Please log in again.')
        router.push('/auth/login')
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout step={step}>
      {submitError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      {step === 1 && <StepBusinessType data={data} onNext={handleStep1} />}
      {step === 2 && <StepBasicInfo data={data} onNext={handleStep2} onBack={handleBack} />}
      {step === 3 && <StepReview data={data} onFinish={handleFinish} onBack={handleBack} saving={saving} />}
    </OnboardingLayout>
  )
}
