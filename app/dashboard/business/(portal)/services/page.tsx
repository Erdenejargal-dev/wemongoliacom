'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, MapPin, Clock, DollarSign, X } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import {
  fetchProviderTours,
  createProviderTour,
  fetchDestinations,
  type ProviderTour,
  type CreateTourInput,
  type Destination,
} from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

// ── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    draft:  'bg-gray-50 text-gray-600 border-gray-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  )
}

// ── Tour card ───────────────────────────────────────────────────────────────

function TourCard({ tour }: { tour: ProviderTour }) {
  const img = tour.images?.[0]?.imageUrl
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-36 bg-gray-100 relative">
        {img ? (
          <img src={img} alt={tour.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No image
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={tour.status} />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{tour.title}</h3>
        {tour.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2">{tour.shortDescription}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {tour.destination && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {tour.destination.name}
            </span>
          )}
          {tour.durationDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {tour.durationDays}d
            </span>
          )}
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> {tour.basePrice} {tour.currency}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Create tour form (slide-over panel) ─────────────────────────────────────

function CreateTourPanel({
  destinations,
  onCreated,
  onClose,
}: {
  destinations: Destination[]
  onCreated: () => void
  onClose: () => void
}) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [status, setStatus] = useState<'draft' | 'active'>('draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const freshToken = await getFreshAccessToken()
    if (!freshToken) {
      signOut({ redirect: false })
      router.push('/auth/login')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const input: CreateTourInput = {
        title: title.trim(),
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        durationDays: durationDays ? parseInt(durationDays, 10) : undefined,
        basePrice: parseFloat(basePrice),
        destinationId: destinationId || undefined,
        status,
      }
      await createProviderTour(freshToken, input)
      onCreated()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create tour.')
      }
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = title.trim().length >= 2 && parseFloat(basePrice) > 0

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors'

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add Tour</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form id="create-tour-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tour title <span className="text-red-500">*</span>
            </label>
            <input
              required
              minLength={2}
              maxLength={300}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. 3-Day Gobi Desert Adventure"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Short description</label>
            <input
              maxLength={500}
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className={inputClass}
              placeholder="One-line summary for search results"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              rows={4}
              maxLength={10000}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Tell travelers what makes this tour special…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Duration (days)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={e => setDurationDays(e.target.value)}
                className={inputClass}
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min={0.01}
                step={0.01}
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className={inputClass}
                placeholder="e.g. 350"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
            <select
              value={destinationId}
              onChange={e => setDestinationId(e.target.value)}
              className={inputClass}
            >
              <option value="">— None —</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Optional — helps travelers discover your tour by location.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="accent-green-600"
                />
                Draft
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="accent-green-600"
                />
                Active (visible to travelers)
              </label>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-tour-form"
            disabled={saving || !canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating…' : 'Create Tour'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [tours, setTours] = useState<ProviderTour[]>([])
  const [total, setTotal] = useState(0)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) {
        if (alive) setLoading(false)
        return
      }
      if (alive) { setLoading(true); setError(null) }
      try {
        const [toursRes, destsRes] = await Promise.all([
          fetchProviderTours(freshToken),
          fetchDestinations(freshToken),
        ])
        if (!alive) return
        setTours(toursRes.data)
        setTotal(toursRes.total)
        setDestinations(destsRes)
      } catch (err) {
        if (!alive) return
        if (err instanceof ApiError && err.status === 401) {
          signOut({ redirect: false })
          router.push('/auth/login')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load tours.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [token])

  async function handleCreated() {
    setShowCreate(false)
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    try {
      const [toursRes, destsRes] = await Promise.all([
        fetchProviderTours(freshToken),
        fetchDestinations(freshToken),
      ])
      setTours(toursRes.data)
      setTotal(toursRes.total)
      setDestinations(destsRes)
    } catch { /* silent — user can reload */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage your tours and offerings."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Tour
          </button>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {tours.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-50 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No tours yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Add your first tour to get discovered by travelers. You can save it as a draft and publish when you&apos;re ready.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first tour
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500">{total} tour{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <CreateTourPanel
          destinations={destinations}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
