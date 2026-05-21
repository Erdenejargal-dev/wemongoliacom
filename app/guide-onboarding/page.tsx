'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Clock, AlertCircle, Upload, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  submitGuideApplication,
  fetchMyApplication,
  type GuideApplication,
  type GuideApplicationPayload,
  type GuideSpecialty,
} from '@/lib/api/guides'
import { uploadImage } from '@/lib/api/media'

const SPECIALTIES: GuideSpecialty[] = [
  'Wildlife', 'Trekking', 'Cultural', 'Photography',
  'BirdWatching', 'Winter', 'Fishing', 'History', 'Adventure',
]

const STEPS = ['Basic info', 'Specialties & rate', 'Contact & ID', 'Review & submit']

interface FormState {
  name:           string
  bio:            string
  about:          string
  location:       string
  specialties:    GuideSpecialty[]
  languages:      string
  yearsExperience: string
  dailyRate:      string
  contactEmail:   string
  contactPhone:   string
  idPhotoUrl:     string
  photoUrl:       string
}

const EMPTY: FormState = {
  name: '', bio: '', about: '', location: '', specialties: [], languages: '',
  yearsExperience: '', dailyRate: '', contactEmail: '', contactPhone: '',
  idPhotoUrl: '', photoUrl: '',
}

export default function GuideOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token  = session?.user?.accessToken

  const [step,        setStep]        = useState(0)
  const [form,        setForm]        = useState<FormState>(EMPTY)
  const [existing,    setExisting]    = useState<GuideApplication | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?next=/guide-onboarding')
    }
  }, [status, router])

  useEffect(() => {
    let alive = true
    if (!token) return
    fetchMyApplication(token)
      .then(app => { if (alive) { setExisting(app); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleSpecialty(s: GuideSpecialty) {
    set('specialties', form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s])
  }

  async function handleIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploadingId(true)
    try {
      const asset = await uploadImage(file, 'gallery', token)
      set('idPhotoUrl', asset.secureUrl)
    } catch { setError('Failed to upload ID photo') }
    finally { setUploadingId(false) }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    try {
      const asset = await uploadImage(file, 'gallery', token)
      set('photoUrl', asset.secureUrl)
    } catch { /* non-fatal */ }
  }

  async function handleSubmit() {
    if (!token) return
    setSubmitting(true); setError(null)
    try {
      const payload: GuideApplicationPayload = {
        name:            form.name.trim(),
        bio:             form.bio.trim(),
        about:           form.about.trim() || form.bio.trim(),
        location:        form.location.trim(),
        specialties:     form.specialties,
        languages:       form.languages.split(',').map(l => l.trim()).filter(Boolean),
        yearsExperience: Number(form.yearsExperience) || 0,
        dailyRate:       form.dailyRate ? Number(form.dailyRate) : undefined,
        contactEmail:    form.contactEmail.trim(),
        contactPhone:    form.contactPhone.trim() || undefined,
        idPhotoUrl:      form.idPhotoUrl,
        photoUrl:        form.photoUrl || undefined,
      }
      await submitGuideApplication(token, payload)
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit application')
    } finally { setSubmitting(false) }
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
    </div>
  )

  if (status === 'unauthenticated') return null

  if (submitted || (existing && existing.status === 'pending')) return (
    <StatusScreen
      icon={<Clock className="w-12 h-12 text-amber-500" />}
      title="Application амжилттай илгээгдлээ"
      body="Таны өргөдөл амжилттай илгээгдлээ. Бид таньд ажлын 3 хоногийн дотор бүртгэлтэй и-майл хаягаар нь мэдэгдэх болно. — Баярлалаа"
    />
  )

  if (existing?.status === 'approved') {
    router.replace('/dashboard/guide')
    return null
  }

  if (existing?.status === 'rejected') {
    // Show rejection status but allow resubmission — fall through to form
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Become a Guide</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit your information — we verify every guide personally.
          </p>
        </div>

        {existing?.status === 'rejected' && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Application not approved</p>
              {existing.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{existing.rejectionReason}</p>}
              <p className="text-xs text-red-500 mt-1">You can resubmit with updated information.</p>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={cn(
                'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0',
                i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500',
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1', i < step ? 'bg-brand-600' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">{STEPS[step]}</h2>

          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

          {/* Step 1: Basic info */}
          {step === 0 && (
            <>
              <Field label="Full name" required>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  required minLength={2} maxLength={100}
                  className={inputCls} placeholder="Your full name" />
              </Field>
              <Field label="Your location" required>
                <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                  required className={inputCls} placeholder="e.g. Ulaanbaatar" />
              </Field>
              <Field label="Short bio (max 500 chars)" required>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  rows={2} maxLength={500} required
                  className={textareaCls} placeholder="A short introduction about yourself…" />
              </Field>
              <Field label="About you (full description)">
                <textarea value={form.about} onChange={e => set('about', e.target.value)}
                  rows={5}
                  className={textareaCls} placeholder="Tell travelers about your background, experience, and what makes your tours special." />
              </Field>
              <Field label="Years of experience" required>
                <input type="number" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}
                  required min={0} max={60}
                  className={inputCls} placeholder="e.g. 5" />
              </Field>
            </>
          )}

          {/* Step 2: Specialties & rate */}
          {step === 1 && (
            <>
              <Field label="Specialties (select all that apply)" required>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                      className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                        form.specialties.includes(s)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400')}>
                      {s}
                    </button>
                  ))}
                </div>
                {form.specialties.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Select at least one specialty</p>
                )}
              </Field>
              <Field label="Languages you speak (comma-separated)" required>
                <input type="text" value={form.languages} onChange={e => set('languages', e.target.value)}
                  required className={inputCls} placeholder="English, Mongolian, Russian…" />
              </Field>
              <Field label="Daily rate in USD (optional)">
                <input type="number" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)}
                  min={0} step={1}
                  className={inputCls} placeholder="e.g. 120" />
              </Field>
            </>
          )}

          {/* Step 3: Contact & ID */}
          {step === 2 && (
            <>
              <Field label="Contact email" required>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                  required className={inputCls} placeholder="you@example.com" />
              </Field>
              <Field label="Contact phone (optional)">
                <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                  className={inputCls} placeholder="+976 ..." />
              </Field>
              <Field label="Government ID photo" required>
                <p className="text-xs text-gray-400 mb-2">Upload a photo of your national ID or passport. Only admin will see this.</p>
                {form.idPhotoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={form.idPhotoUrl} alt="ID" className="w-24 h-16 object-cover rounded-lg border" />
                    <button type="button" onClick={() => set('idPhotoUrl', '')} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                    {uploadingId ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <Upload className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-gray-500">{uploadingId ? 'Uploading…' : 'Choose file'}</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleIdUpload} />
                  </label>
                )}
              </Field>
              <Field label="Profile photo (optional)">
                {form.photoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photoUrl} alt="Profile" className="w-16 h-16 object-cover rounded-full border" />
                    <button type="button" onClick={() => set('photoUrl', '')} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Choose photo</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                  </label>
                )}
              </Field>
            </>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-3 text-sm">
              <ReviewRow label="Name"         value={form.name} />
              <ReviewRow label="Location"     value={form.location} />
              <ReviewRow label="Experience"   value={`${form.yearsExperience} years`} />
              <ReviewRow label="Specialties"  value={form.specialties.join(', ') || 'None selected'} />
              <ReviewRow label="Languages"    value={form.languages || '—'} />
              <ReviewRow label="Daily rate"   value={form.dailyRate ? `$${form.dailyRate}/day` : 'Not specified'} />
              <ReviewRow label="Email"        value={form.contactEmail} />
              <ReviewRow label="ID photo"     value={form.idPhotoUrl ? 'Uploaded ✓' : 'Missing'} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button"
                onClick={() => {
                  if (step === 0 && (!form.name.trim() || !form.location.trim() || !form.bio.trim() || !form.yearsExperience)) return
                  if (step === 1 && (form.specialties.length === 0 || !form.languages.trim())) return
                  if (step === 2 && (!form.contactEmail.trim() || !form.idPhotoUrl)) return
                  setStep(s => s + 1)
                }}
                className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const inputCls    = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none'
const textareaCls = `${inputCls} resize-none`

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium break-all">{value}</span>
    </div>
  )
}

function StatusScreen({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-4">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
