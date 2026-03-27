'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { changePassword } from '@/lib/api/account'
import { ApiError } from '@/lib/api/client'
import { getFreshAccessToken } from '@/lib/auth-utils'

export function SecuritySettings({ accessToken: _accessToken }: { accessToken: string }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function patch(p: Partial<typeof form>) { setForm(prev => ({ ...prev, ...p })) }
  function toggleShow(k: keyof typeof show) { setShow(prev => ({ ...prev, [k]: !prev[k] })) }

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.next !== form.confirm) { setResult('error'); setErrorMessage('Passwords do not match'); return }
    setSaving(true); setResult(null); setErrorMessage(null)

    const token = await getFreshAccessToken()
    if (!token) {
      setResult('error')
      setErrorMessage('Session expired. Please log in again.')
      setSaving(false)
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }

    try {
      await changePassword(token, { currentPassword: form.current, newPassword: form.next })
      setResult('success')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setResult('error')
        setErrorMessage('Session expired. Please log in again.')
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setResult('error')
        setErrorMessage(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to update password.')
      }
    }
    setForm({ current: '', next: '', confirm: '' })
    setSaving(false)
    setTimeout(() => setResult(null), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Change Password</h3>
      <p className="text-xs text-gray-500 mb-5">Choose a strong password of at least 8 characters.</p>
      <div className="space-y-4 max-w-sm">
        <PasswordField label="Current Password" value={form.current} show={show.current}
          onChange={v => patch({ current: v })} onToggle={() => toggleShow('current')} />
        <PasswordField label="New Password" value={form.next} show={show.next}
          onChange={v => patch({ next: v })} onToggle={() => toggleShow('next')} />
        <PasswordField label="Confirm New Password" value={form.confirm} show={show.confirm}
          onChange={v => patch({ confirm: v })} onToggle={() => toggleShow('confirm')}
          error={result === 'error' ? errorMessage ?? undefined : undefined} />
      </div>
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-50">
        <button type="submit" disabled={saving || !form.current || !form.next}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Updating…</> : 'Update Password'}
        </button>
        {result === 'success' && (
          <span className="flex items-center gap-1.5 text-sm text-brand-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />Password updated!
          </span>
        )}
      </div>
        {result === 'error' && errorMessage && (
          <p className="text-sm text-red-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />{errorMessage}
          </p>
        )}
    </form>
  )
}

function PasswordField({ label, value, show, onChange, onToggle, error }: {
  label: string; value: string; show: boolean
  onChange: (v: string) => void; onToggle: () => void; error?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{label}</label>
      <div className={`flex items-center border rounded-xl px-3 py-2.5 transition-all ${error ? 'border-red-300' : 'border-gray-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10'}`}>
        <input type={show ? 'text' : 'password'} required value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none" />
        <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}
