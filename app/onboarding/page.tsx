'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Loader2, Upload, Globe, Plus, X } from 'lucide-react'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { ServiceTypeCard } from '@/components/onboarding/ServiceTypeCard'
import { DEFAULT_ONBOARDING, type OnboardingState, type ProviderType } from '@/lib/mock-data/provider'

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
  const [selected, setSelected] = useState<ProviderType[]>(data.providerTypes)

  function toggle(t: ProviderType) {
    setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const TYPES: ProviderType[] = ['tour_operator', 'car_rental', 'accommodation']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">What services do you offer?</h2>
        <p className="text-sm text-gray-500">Select all that apply. You can always add more later.</p>
      </div>
      <div className="space-y-3">
        {TYPES.map(t => (
          <ServiceTypeCard key={t} type={t} selected={selected.includes(t)} onToggle={toggle} />
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Please select at least one service type to continue.
        </p>
      )}
      <div className="pt-2 flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" disabled={selected.length === 0} onClick={() => onNext({ providerTypes: selected })}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-colors">
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
  const [step, setStep]     = useState<1 | 2 | 3>(1)
  const [data, setData]     = useState<OnboardingState>(DEFAULT_ONBOARDING)
  const [saving, setSaving] = useState(false)

  function patch(p: Partial<OnboardingState>) { setData(prev => ({ ...prev, ...p })) }

  function handleStep1(p: Partial<OnboardingState>) { patch(p); setStep(2) }
  function handleStep2(p: Partial<OnboardingState>) { patch(p); setStep(3) }
  function handleBack()  { setStep(prev => (prev - 1) as 1 | 2 | 3) }

  async function handleFinish(p: Partial<OnboardingState>) {
    const final = { ...data, ...p }
    patch(p)
    setSaving(true)
    // Mock save — store in localStorage
    await new Promise(r => setTimeout(r, 1000))
    localStorage.setItem('wm_provider', JSON.stringify({ ...final, id: `provider-${Date.now()}`, completedOnboarding: true }))
    setSaving(false)
    router.push('/host/dashboard')
  }

  return (
    <OnboardingLayout step={step}>
      {step === 1 && <StepBusinessInfo data={data} onNext={handleStep1} />}
      {step === 2 && <StepServiceType  data={data} onNext={handleStep2} onBack={handleBack} />}
      {step === 3 && <StepProfileSetup data={data} onFinish={handleFinish} onBack={handleBack} saving={saving} />}
    </OnboardingLayout>
  )
}
