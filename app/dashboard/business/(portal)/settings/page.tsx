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

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const p = await fetchProviderProfile(freshToken)
        if (!alive) return
        setProfile(p)
        if (p) {
          setName(p.name ?? '')
          setDescription(p.description ?? '')
          setPhone(p.phone ?? '')
          setEmail(p.email ?? '')
          setWebsite(p.website ?? '')
          setAddress(p.address ?? '')
          setCity(p.city ?? '')
          setCountry(p.country ?? '')
          setLogoUrl(p.logoUrl ?? '')
          setCoverImageUrl(p.coverImageUrl ?? '')
        }
      } catch (e: unknown) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) {
          await signOut({ redirect: false })
          router.push('/auth/login')
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load profile.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) {
      signOut({ redirect: false })
      router.push('/auth/login')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const data: UpdateProviderProfileInput = {
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        websiteUrl: website.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        coverUrl: coverImageUrl.trim() || undefined,
      }
      const updated = await updateProviderProfile(freshToken, data)
      if (updated) {
        setProfile(updated)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to save profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleLogoUploaded(asset: MediaAsset) {
    setLogoUrl(asset.secureUrl)
  }

  function handleCoverUploaded(asset: MediaAsset) {
    setCoverImageUrl(asset.secureUrl)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!token || !profile) {
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" description="Manage your business profile" />
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Sign in or complete onboarding to edit your profile.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Profile"
        description="Update your business details — travelers will see this information when browsing your offerings."
      />

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">
          Profile saved successfully.
        </div>
      )}

      {/* Image uploads */}
      <div className="max-w-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ImageUpload
            entity="provider"
            token={token}
            value={logoUrl || null}
            onUploaded={handleLogoUploaded}
            onRemoved={() => setLogoUrl('')}
            label="Business Logo"
            hint="Square image, 400×400 recommended"
            previewClassName="h-32"
          />
          <ImageUpload
            entity="provider"
            token={token}
            value={coverImageUrl || null}
            onUploaded={handleCoverUploaded}
            onRemoved={() => setCoverImageUrl('')}
            label="Cover Image"
            hint="16:9 landscape, 1200×675 recommended"
            previewClassName="h-32"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Business name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            minLength={2}
            maxLength={200}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder="e.g. Gobi Adventure Tours"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            placeholder="Tell travelers about your business..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={30}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="+976..."
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="contact@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder="https://yoursite.com"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            maxLength={300}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder="Street, building..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Ulaanbaatar"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Mongolia"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save changes
        </button>
      </form>
    </div>
  )
}
