'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchMyGuideProfile,
  updateMyGuideProfile,
  setGuideStatus,
  type Guide,
  type GuideSpecialty,
} from '@/lib/api/guides'

const SPECIALTIES: GuideSpecialty[] = [
  'Wildlife', 'Trekking', 'Cultural', 'Photography',
  'BirdWatching', 'Winter', 'Fishing', 'History', 'Adventure',
]

export function GuideProfileEditor() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [profile,  setProfile]  = useState<Guide | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const [bio,           setBio]           = useState('')
  const [about,         setAbout]         = useState('')
  const [location,      setLocation]      = useState('')
  const [dailyRate,     setDailyRate]     = useState('')
  const [contactEmail,  setContactEmail]  = useState('')
  const [contactPhone,  setContactPhone]  = useState('')
  const [website,       setWebsite]       = useState('')
  const [specialties,   setSpecialties]   = useState<GuideSpecialty[]>([])
  const [languages,     setLanguages]     = useState('')
  const [status,        setStatus]        = useState<'active' | 'paused'>('active')

  useEffect(() => {
    let alive = true
    if (!token) { setLoading(false); return }
    fetchMyGuideProfile(token)
      .then(p => {
        if (!alive) return
        setProfile(p)
        setBio(p.bio ?? '')
        setAbout(p.about ?? '')
        setLocation(p.location ?? '')
        setDailyRate(p.dailyRate != null ? String(p.dailyRate) : '')
        setContactEmail(p.contactEmail ?? '')
        setContactPhone(p.contactPhone ?? '')
        setWebsite(p.website ?? '')
        setSpecialties(p.specialties ?? [])
        setLanguages((p.languages ?? []).join(', '))
        setStatus((p.status as 'active' | 'paused') ?? 'active')
        setLoading(false)
      })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token])

  function toggleSpecialty(s: GuideSpecialty) {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true); setError(null); setSuccess(false)
    try {
      const langs = languages.split(',').map(l => l.trim()).filter(Boolean)
      const updated = await updateMyGuideProfile(token, {
        bio:          bio.trim()          || undefined,
        about:        about.trim()        || undefined,
        location:     location.trim()     || undefined,
        dailyRate:    dailyRate ? Number(dailyRate) : null,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || null,
        website:      website.trim()      || null,
        specialties,
        languages:    langs,
      })
      setProfile(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally { setSaving(false) }
  }

  async function toggleStatus() {
    if (!token) return
    const next = status === 'active' ? 'paused' : 'active'
    try {
      await setGuideStatus(token, next)
      setStatus(next)
    } catch { /* non-fatal */ }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>

        {/* Status toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Availability</span>
          <button
            type="button"
            onClick={toggleStatus}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              status === 'active'
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100',
            )}
          >
            {status === 'active' ? 'Active' : 'Paused'}
          </button>
        </div>
      </div>

      {error   && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">Profile saved.</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Short bio (max 500 chars)" required>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            rows={2} maxLength={500} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            placeholder="One or two sentences about yourself…" />
        </Field>

        <Field label="About me (full description)">
          <textarea value={about} onChange={e => setAbout(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            placeholder="Tell travelers about your background, tours, and what makes you unique…" />
        </Field>

        <Field label="Location" required>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="e.g. Ulaanbaatar" />
        </Field>

        <Field label="Specialties">
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  specialties.includes(s)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Languages (comma-separated)">
          <input type="text" value={languages} onChange={e => setLanguages(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="English, Mongolian, Russian…" />
        </Field>

        <Field label="Daily rate (USD)">
          <input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)}
            min={0} step={1}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="e.g. 120" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact email" required>
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="you@example.com" />
          </Field>
          <Field label="Contact phone">
            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="+976 ..." />
          </Field>
        </div>

        <Field label="Website">
          <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="https://yourwebsite.com" />
        </Field>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

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
