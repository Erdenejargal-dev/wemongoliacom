'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Loader2, Save } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { ImageUpload } from '@/components/ui/ImageUpload'
import {
  fetchProviderProfile,
  updateProviderProfile,
  type ProviderProfile,
  type UpdateProviderProfileInput,
} from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import type { MediaAsset } from '@/lib/api/media'
import { useProviderLocale } from '@/lib/i18n/provider/context'

export default function SettingsPage() {
  const router        = useRouter()
  const { data: session } = useSession()
  const token         = session?.user?.accessToken
  const { t }         = useProviderLocale()
  const st            = t.settings
  const sl            = st.labels
  const sp            = st.placeholders

  const [profile,  setProfile]  = useState<ProviderProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  const [name,           setName]           = useState('')
  const [description,    setDescription]    = useState('')
  const [phone,          setPhone]          = useState('')
  const [email,          setEmail]          = useState('')
  const [website,        setWebsite]        = useState('')
  const [address,        setAddress]        = useState('')
  const [city,           setCity]           = useState('')
  const [country,        setCountry]        = useState('')
  const [logoUrl,        setLogoUrl]        = useState('')
  const [coverImageUrl,  setCoverImageUrl]  = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      const ft = token ? await getFreshAccessToken() : null
      if (!ft) { setLoading(false); return }
      setLoading(true); setError(null)
      try {
        const p = await fetchProviderProfile(ft)
        if (!alive) return
        setProfile(p)
        if (p) {
          setName(p.name ?? ''); setDescription(p.description ?? ''); setPhone(p.phone ?? '')
          setEmail(p.email ?? ''); setWebsite(p.website ?? ''); setAddress(p.address ?? '')
          setCity(p.city ?? ''); setCountry(p.country ?? ''); setLogoUrl(p.logoUrl ?? '')
          setCoverImageUrl(p.coverImageUrl ?? '')
        }
      } catch (e: unknown) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
        else setError(e instanceof Error ? e.message : st.errorLoading)
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ft = token ? await getFreshAccessToken() : null
    if (!ft) { signOut({ redirect: false }); router.push('/auth/login'); return }
    setSaving(true); setError(null); setSuccess(false)
    try {
      const data: UpdateProviderProfileInput = {
        name: name.trim() || undefined, description: description.trim() || undefined,
        phone: phone.trim() || undefined, email: email.trim() || undefined,
        websiteUrl: website.trim() || undefined, address: address.trim() || undefined,
        city: city.trim() || undefined, country: country.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined, coverUrl: coverImageUrl.trim() || undefined,
      }
      const updated = await updateProviderProfile(ft, data)
      if (updated) { setProfile(updated); setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else setError(e instanceof Error ? e.message : st.errorLoading)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>

  if (!token || !profile) return (
    <div className="space-y-4">
      <PageHeader title={st.title} description={st.description} />
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">{st.signInNotice}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={st.title} description={st.description} />
      {error   && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">{st.successMsg}</div>}

      <div className="max-w-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ImageUpload entity="provider" token={token} value={logoUrl || null}
            onUploaded={(a: MediaAsset) => setLogoUrl(a.secureUrl)} onRemoved={() => setLogoUrl('')}
            label={sl.logo} hint={sl.logoHint} previewClassName="h-32" />
          <ImageUpload entity="provider" token={token} value={coverImageUrl || null}
            onUploaded={(a: MediaAsset) => setCoverImageUrl(a.secureUrl)} onRemoved={() => setCoverImageUrl('')}
            label={sl.cover} hint={sl.coverHint} previewClassName="h-32" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        {[
          { id: 'name',        label: sl.businessName, value: name,        set: setName,        type: 'text',  ph: sp.businessName, req: true,  min: 2,   max: 200  },
          { id: 'phone',       label: sl.phone,        value: phone,       set: setPhone,       type: 'tel',   ph: sp.phone,        req: false, min: 0,   max: 30   },
          { id: 'email',       label: sl.email,        value: email,       set: setEmail,       type: 'email', ph: sp.email,        req: false, min: 0,   max: 200  },
          { id: 'website',     label: sl.website,      value: website,     set: setWebsite,     type: 'url',   ph: sp.website,      req: false, min: 0,   max: 300  },
          { id: 'address',     label: sl.address,      value: address,     set: setAddress,     type: 'text',  ph: sp.address,      req: false, min: 0,   max: 300  },
          { id: 'city',        label: sl.city,         value: city,        set: setCity,        type: 'text',  ph: sp.city,         req: false, min: 0,   max: 100  },
          { id: 'country',     label: sl.country,      value: country,     set: setCountry,     type: 'text',  ph: sp.country,      req: false, min: 0,   max: 100  },
        ].map(f => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input id={f.id} type={f.type as any} value={f.value} onChange={e => f.set(e.target.value)}
              required={f.req} minLength={f.min || undefined} maxLength={f.max}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder={f.ph} />
          </div>
        ))}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">{sl.description}</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
            rows={4} maxLength={5000}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            placeholder={sp.description} />
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? st.savingBtn : st.saveBtn}
        </button>
      </form>
    </div>
  )
}
