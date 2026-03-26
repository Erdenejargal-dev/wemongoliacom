'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { UserProfile } from '@/lib/mock-data/account'
import { UserAvatarUpload } from './UserAvatarUpload'
import { updateMyProfile } from '@/lib/api/account'
import { ApiError } from '@/lib/api/client'
import { getFreshAccessToken } from '@/lib/auth-utils'

const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'South Korea',
  'Australia', 'Canada', 'China', 'Mongolia', 'Russia', 'Other']

interface ProfileFormProps {
  initial: UserProfile
  accessToken: string
  onSaved?: (updated: UserProfile) => void
}

export function ProfileForm({ initial, accessToken, onSaved }: ProfileFormProps) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(p: Partial<UserProfile>) { setForm(prev => ({ ...prev, ...p })) }

  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)

    const token = await getFreshAccessToken()
    if (!token) {
      setError('Session expired. Please log in again.')
      setSaving(false)
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }

    try {
      const avatarUrl = form.avatar?.trim()

      const payload = {
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        country: form.country?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        avatarUrl: avatarUrl?.trim() || undefined,
      }

      const updated = await updateMyProfile(token, payload)

      const merged: UserProfile = {
        ...initial,
        ...form,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone ?? '',
        country: updated.country ?? '',
        avatar: updated.avatarUrl ?? '',
        bio: updated.bio ?? '',
      }

      setSaved(true)
      setForm(merged)
      onSaved?.(merged)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to update profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Profile Photo</h3>
        <UserAvatarUpload
          current={form.avatar}
          name={form.firstName}
          token={accessToken}
          onChange={(url) => patch({ avatar: url })}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input type="text" required value={form.firstName} onChange={e => patch({ firstName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10" placeholder="Jane" />
          </Field>
          <Field label="Last Name" required>
            <input type="text" required value={form.lastName} onChange={e => patch({ lastName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10" placeholder="Smith" />
          </Field>
          <Field label="Email" required className="sm:col-span-2">
            <input
              type="email"
              value={form.email}
              disabled
              readOnly
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 cursor-not-allowed"
            />
          </Field>
          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={e => patch({ phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10" placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Country">
            <select value={form.country} onChange={e => patch({ country: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 appearance-none cursor-pointer">
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <textarea value={form.bio} onChange={e => patch({ bio: e.target.value })} rows={3} placeholder="Tell us a little about yourself…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10 resize-none" />
          </Field>
        </div>

        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-50">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : 'Save Changes'}
          </button>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />Profile updated!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
