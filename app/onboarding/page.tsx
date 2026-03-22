'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Loader2, Upload, Globe, Plus, X, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { DEFAULT_ONBOARDING, type OnboardingState, type ProviderType } from '@/lib/mock-data/provider'
import { apiClient, ApiError } from '@/lib/api/client'
import { getFreshAccessToken } from '@/lib/auth-utils'

const LANGUAGE_OPTIONS = ['English', 'Mongolian', 'Russian', 'Chinese', 'Japanese', 'Korean', 'German', 'French']

// ── Shared field wrapper ────────────────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const INPUT = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10'

// ── Step 1 ──────────────────────────────────────────────────────────────────
function StepBusinessInfo({ data, onNext }: { data: OnboardingState; onNext: (p: Partial<OnboardingState>) => void }) {
  const [form, setForm] = useState({ name: data.name, description: data.description, location: data.location, phone: data.phone, email: data.email })
  function patch(p: Partial<typeof form>) { setForm(prev => ({ ...prev, ...p })) }
  function handleNext(e: React.FormEvent) { e.preventDefault(); onNext(form) }

  return (
    <form onSubmit={handleNext} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tell us about your business</h2>
        <p className="text-sm text-gray-500">This information will appear on your public provider profile.</p>
      </div>
      <Field label="Business Name" required>
        <input required value={form.name} onChange={e => patch({ name: e.target.value })} className={INPUT} placeholder="Gobi Adventure Tours" />
      </Field>
      <Field label="Description" required>
        <textarea required rows={3} value={form.description} onChange={e => patch({ description: e.target.value })} className={`${INPUT} resize-none`} placeholder="Describe what your business offers…" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location" required>
          <input required value={form.location} onChange={e => patch({ location: e.target.value })} className={INPUT} placeholder="Ulaanbaatar" />
        </Field>
        <Field label="Phone" required>
          <input required type="tel" value={form.phone} onChange={e => patch({ phone: e.target.value })} className={INPUT} placeholder="+976 9900 0000" />
        </Field>
      </div>
      <Field label="Business Email" required>
        <input required type="email" value={form.email} onChange={e => patch({ email: e.target.value })} className={INPUT} placeholder="info@yourbusiness.mn" />
      </Field>
      <div className="pt-2 flex justify-end">
        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// ── Step 2 ──────────────────────────────────────────────────────────────────
function StepServiceType({ data, onNext, onBack }: { data: OnboardingState; onNext: (p: Partial<OnboardingState>) => void; onBack: () => void }) {
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
    iconBgClass,
  }: {
    value: ProviderCombo
    title: string
    subtitle: string
    badge: string
    colorClass: string
    iconBgClass: string
  }) => {
    const selected = combo === value
    return (
      <button
        type="button"
        onClick={() => setCombo(value)}
        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 relative ${
          selected ? colorClass : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
        }`}
        aria-pressed={selected}
      >
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass}`}>
            <span className="text-xl">{badge}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">What services do you offer?</h2>
        <p className="text-sm text-gray-500">Pick one option that matches what you&apos;ll offer first. You can extend later.</p>
      </div>

      <div className="space-y-3">
        <Card
          value="hotel"
          title="Hotel only"
          subtitle="List accommodations (hotels/camps) for travelers."
          badge="🏨"
          colorClass="border-green-400 bg-green-50/50"
          iconBgClass="bg-green-100"
        />
        <Card
          value="tour_operator"
          title="Tour Operator only"
          subtitle="Offer guided tours, excursions, and experiences."
          badge="🗺️"
          colorClass="border-blue-400 bg-blue-50/50"
          iconBgClass="bg-blue-100"
        />
        <Card
          value="car_rental"
          title="Car Rental only"
          subtitle="Rent vehicles and provide driver services."
          badge="🚐"
          colorClass="border-orange-400 bg-orange-50/50"
          iconBgClass="bg-orange-100"
        />
        <Card
          value="multiple"
          title="Multiple Services"
          subtitle="Offer all supported types: hotel + tours + car rental."
          badge="✨"
          colorClass="border-gray-900 bg-gray-50"
          iconBgClass="bg-gray-900 text-white"
        />
      </div>

      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          disabled={!combo}
          onClick={() => {
            if (!combo) return
            onNext({ providerTypes: toProviderTypes(combo) })
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-colors"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Step 3 ──────────────────────────────────────────────────────────────────
function StepProfileSetup({ data, onFinish, onBack, saving }: { data: OnboardingState; onFinish: (p: Partial<OnboardingState>) => void; onBack: () => void; saving: boolean }) {
  const [form, setForm] = useState({ website: data.website, logo: data.logo, coverImage: data.coverImage, languages: data.languages })
  const [langInput, setLangInput] = useState('')
  const logoRef  = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  function patch(p: Partial<typeof form>) { setForm(prev => ({ ...prev, ...p })) }
  function handleFile(key: 'logo' | 'coverImage', file: File) {
    const url = URL.createObjectURL(file)
    patch({ [key]: url })
  }
  function addLang(l: string) {
    if (!l.trim() || form.languages.includes(l)) return
    patch({ languages: [...form.languages, l] })
    setLangInput('')
  }
  function removeLang(l: string) { patch({ languages: form.languages.filter(x => x !== l) }) }

  function handleFinish(e: React.FormEvent) { e.preventDefault(); onFinish(form) }

  return (
    <form onSubmit={handleFinish} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Set up your profile</h2>
        <p className="text-sm text-gray-500">Add a logo, cover photo, and contact details.</p>
      </div>

      {/* Logo */}
      <Field label="Business Logo">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-green-400 transition-colors" onClick={() => logoRef.current?.click()}>
            {form.logo ? <img src={form.logo} className="w-full h-full object-cover" alt="logo" /> : <Upload className="w-5 h-5 text-gray-300" />}
          </div>
          <div>
            <button type="button" onClick={() => logoRef.current?.click()} className="text-xs text-green-600 hover:text-green-700 font-semibold underline">Upload logo</button>
            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG · Recommended 200×200</p>
          </div>
        </div>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile('logo', f) }} />
      </Field>

      {/* Cover Image */}
      <Field label="Cover Image">
        <div className="h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green-400 transition-colors relative" onClick={() => coverRef.current?.click()}>
          {form.coverImage
            ? <img src={form.coverImage} className="w-full h-full object-cover" alt="cover" />
            : <div className="text-center"><Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-400">Click to upload cover image</p></div>
          }
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile('coverImage', f) }} />
      </Field>

      {/* Website */}
      <Field label="Website" hint="Optional">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10">
          <span className="px-3 border-r border-gray-200 bg-gray-50 text-gray-400 h-full flex items-center py-2.5"><Globe className="w-4 h-4" /></span>
          <input type="url" value={form.website} onChange={e => patch({ website: e.target.value })} className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none" placeholder="https://yourbusiness.mn" />
        </div>
      </Field>

      {/* Languages */}
      <Field label="Languages Spoken">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.languages.map(l => (
            <span key={l} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              {l}
              <button type="button" onClick={() => removeLang(l)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={langInput} onChange={e => setLangInput(e.target.value)} className={`${INPUT} flex-1`}>
            <option value="">Select language…</option>
            {LANGUAGE_OPTIONS.filter(l => !form.languages.includes(l)).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="button" onClick={() => addLang(langInput)} disabled={!langInput}
            className="px-3 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Field>

      <div className="pt-2 flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold text-sm rounded-xl transition-colors">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Setting up…</> : 'Finish Setup 🎉'}
        </button>
      </div>
    </form>
  )
}

// ── Main wizard ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken
  const [step, setStep]     = useState<1 | 2 | 3>(1)
  const [data, setData]     = useState<OnboardingState>(DEFAULT_ONBOARDING)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [checkingProvider, setCheckingProvider] = useState(true)

  function patch(p: Partial<OnboardingState>) { setData(prev => ({ ...prev, ...p })) }

  function handleStep1(p: Partial<OnboardingState>) { patch(p); setStep(2) }
  function handleStep2(p: Partial<OnboardingState>) { patch(p); setStep(3) }
  function handleBack()  { setStep(prev => (prev - 1) as 1 | 2 | 3) }

  function mapProviderTypes(providerTypes: ProviderType[]): 'hotel' | 'tour_operator' | 'car_rental' | 'multiple' {
    const sorted = [...providerTypes].sort().join(',')
    if (sorted === ['accommodation', 'car_rental', 'tour_operator'].sort().join(',')) return 'multiple'
    if (sorted === ['accommodation'].sort().join(',')) return 'hotel'
    if (sorted === ['tour_operator'].sort().join(',')) return 'tour_operator'
    if (sorted === ['car_rental'].sort().join(',')) return 'car_rental'
    throw new Error('Invalid service selection.')
  }

  // Redirect unauthenticated users to login.
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  // If user already has a provider profile, skip onboarding.
  // Backend returns 404 when provider does not exist yet.
  // Backend provider routes are role-protected; travelers may receive 403, which we ignore.
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
        // Ignore "no provider profile" and "not a provider role yet".
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
    return () => { alive = false }
  }, [status, token, router])

  if (status === 'loading' || checkingProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  async function handleFinish(p: Partial<OnboardingState>) {
    const final = { ...data, ...p }
    patch(p)
    setSaving(true)
    setSubmitError(null)

    // Fetch fresh token right before submit to avoid stale token after long idle
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
    } catch (e) {
      setSubmitError('Invalid service selection. Please restart onboarding.')
      setSaving(false)
      return
    }

    try {
      await apiClient.post(
        '/account/provider',
        {
          businessName: final.name,
          businessType,
          description: final.description,
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
        setSubmitError(err instanceof Error ? err.message : 'Failed to complete onboarding.')
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

      {step === 1 && <StepBusinessInfo data={data} onNext={handleStep1} />}
      {step === 2 && <StepServiceType data={data} onNext={handleStep2} onBack={handleBack} />}
      {step === 3 && <StepProfileSetup data={data} onFinish={handleFinish} onBack={handleBack} saving={saving} />}
    </OnboardingLayout>
  )
}
