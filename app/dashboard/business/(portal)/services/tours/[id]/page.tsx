'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, Save, Trash2, X, Plus,
  Calendar, Image as ImageIcon, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'
import {
  fetchProviderTour,
  updateProviderTour,
  archiveProviderTour,
  addTourImages,
  removeTourImage,
  fetchTourDepartures,
  createTourDeparture,
  deleteTourDeparture,
  fetchDestinations,
  type ProviderTourDetail,
  type TourDeparture,
  type Destination,
  type UpdateTourInput,
} from '@/lib/api/provider'
import { deleteMediaAsset } from '@/lib/api/media'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors bg-white'

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const hintClass  = 'text-xs text-gray-400 mt-1'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Tour categories — these match common Mongolia tour types
const TOUR_CATEGORIES = [
  'Adventure',
  'Cultural',
  'Wildlife & Nature',
  'Photography',
  'Trekking & Hiking',
  'Horseback Riding',
  'Luxury',
  'Budget',
  'Family',
  'Festival',
  'Nomadic Life',
  'Other',
]

const CURRENCIES = ['USD', 'EUR', 'MNT', 'CNY', 'GBP']

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">{title}</h2>
      </div>
      <div className="px-5 pt-4 pb-5 space-y-4">{children}</div>
    </div>
  )
}

// ── Readiness banner ──────────────────────────────────────────────────────────

function ReadinessBanner({ readiness }: { readiness: ProviderTourDetail['readiness'] }) {
  if (readiness.ready) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-500" />
        <p className="text-sm font-medium">
          This tour meets all publish requirements. Set status to <strong>Active</strong> to make it visible to travelers.
        </p>
      </div>
    )
  }
  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
        <p className="text-sm font-semibold">Not ready to publish yet</p>
      </div>
      <ul className="ml-8 list-disc text-xs space-y-0.5">
        {readiness.missing.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  )
}

// ── Departure section ─────────────────────────────────────────────────────────

function DepartureSection({
  tourId, departures, onRefresh,
}: {
  tourId: string
  departures: TourDeparture[]
  onRefresh: () => void
}) {
  const [showAdd,       setShowAdd]       = useState(false)
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [seats,         setSeats]         = useState('12')
  const [priceOverride, setPriceOverride] = useState('')
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setSaving(true)
    try {
      await createTourDeparture(freshToken, tourId, {
        startDate, endDate,
        availableSeats: parseInt(seats, 10),
        priceOverride: priceOverride ? parseFloat(priceOverride) : undefined,
      })
      setShowAdd(false); setStartDate(''); setEndDate(''); setSeats('12'); setPriceOverride('')
      onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create departure.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(depId: string) {
    if (!confirm('Delete this departure?')) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setDeleting(depId)
    try { await deleteTourDeparture(freshToken, tourId, depId); onRefresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete departure.') }
    finally { setDeleting(null) }
  }

  const upcoming = departures.filter(d => new Date(d.startDate) >= new Date() && d.status === 'scheduled')
  const past     = departures.filter(d => new Date(d.startDate) < new Date() || d.status !== 'scheduled')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" /> Departures
        </h3>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Plus className="w-3.5 h-3.5" /> Add Departure
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Start date *</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">End date *</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Available seats *</label>
              <input type="number" min={1} max={500} required value={seats} onChange={e => setSeats(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Price override (optional)</label>
              <input type="number" min={0} step={0.01} value={priceOverride} onChange={e => setPriceOverride(e.target.value)} className={inputClass} placeholder="Leave blank for base price" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-lg transition-colors">
              {saving ? 'Saving…' : 'Add Departure'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {upcoming.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
          {upcoming.map(d => (
            <div key={d.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{fmtDate(d.startDate)} — {fmtDate(d.endDate)}</p>
                <p className="text-xs text-gray-500">
                  {d.bookedSeats}/{d.availableSeats} seats booked
                  {d.priceOverride != null && <> · ${d.priceOverride}</>}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">{d.status}</span>
              <button
                onClick={() => handleDelete(d.id)}
                disabled={deleting === d.id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                {deleting === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {upcoming.length === 0 && !showAdd && (
        <p className="text-xs text-gray-400 py-2">No upcoming departures. Add one to make this tour bookable.</p>
      )}

      {past.length > 0 && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-500">{past.length} past/cancelled departure{past.length !== 1 ? 's' : ''}</summary>
          <div className="mt-2 space-y-1">
            {past.map(d => (
              <div key={d.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500">{fmtDate(d.startDate)} — {fmtDate(d.endDate)}</span>
                <span className="text-gray-400">{d.bookedSeats}/{d.availableSeats} seats</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${d.status === 'cancelled' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function TourDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const tourId  = params.id as string
  const { data: session } = useSession()
  const token   = session?.user?.accessToken

  const [tour,         setTour]         = useState<ProviderTourDetail | null>(null)
  const [departures,   setDepartures]   = useState<TourDeparture[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [archiving,    setArchiving]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<string | null>(null)

  // ── Form state ──────────────────────────────────────────────────────────────
  // Section 1: Basic info
  const [title,       setTitle]       = useState('')
  const [shortDesc,   setShortDesc]   = useState('')
  const [description, setDescription] = useState('')
  // Section 2: Trip details
  const [category,   setCategory]   = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [maxGuests,  setMaxGuests]  = useState('')
  const [languages,  setLanguages]  = useState('')  // comma-separated
  // Section 3: Location
  const [destinationId, setDestinationId] = useState('')
  const [meetingPoint,  setMeetingPoint]  = useState('')
  // Section 4: Pricing & policy
  const [basePrice,          setBasePrice]          = useState('')
  const [currency,           setCurrency]           = useState('USD')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  // Section 5: Status
  const [status, setStatus] = useState<'draft' | 'active' | 'paused'>('draft')

  // ── Load tour ───────────────────────────────────────────────────────────────

  const loadTour = useCallback(async () => {
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) { setLoading(false); return }
    try {
      const [t, deps, dests] = await Promise.all([
        fetchProviderTour(freshToken, tourId),
        fetchTourDepartures(freshToken, tourId),
        fetchDestinations(freshToken),
      ])
      setTour(t)
      setDepartures(deps)
      setDestinations(dests)
      // Populate form
      setTitle(t.title)
      setShortDesc(t.shortDescription ?? '')
      setDescription(t.description ?? '')
      setCategory(t.category ?? '')
      setDifficulty(t.difficulty ?? '')
      setDurationDays(t.durationDays ? String(t.durationDays) : '')
      setMaxGuests(String(t.maxGuests ?? 12))
      setLanguages(t.languages?.join(', ') ?? '')
      setDestinationId(t.destination?.id ?? '')
      setMeetingPoint(t.meetingPoint ?? '')
      setBasePrice(String(t.basePrice))
      setCurrency(t.currency ?? 'USD')
      setCancellationPolicy(t.cancellationPolicy ?? '')
      setStatus(t.status as 'draft' | 'active' | 'paused')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ redirect: false }); router.push('/auth/login')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load tour.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, tourId, router])

  useEffect(() => { loadTour() }, [loadTour])

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setError(null); setSuccess(null)
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setSaving(true)
    try {
      const input: UpdateTourInput = {
        // Core info
        title:             title.trim(),
        shortDescription:  shortDesc.trim() || undefined,
        description:       description.trim() || undefined,
        // Trip details
        category:          category.trim() || undefined,
        difficulty:        (difficulty as 'Easy' | 'Moderate' | 'Challenging') || null,
        durationDays:      durationDays ? parseInt(durationDays, 10) : undefined,
        maxGuests:         maxGuests ? parseInt(maxGuests, 10) : undefined,
        languages:         languages.trim()
          ? languages.split(',').map(l => l.trim()).filter(Boolean)
          : [],
        // Location
        destinationId:     destinationId || null,
        meetingPoint:      meetingPoint.trim() || null,
        // Pricing & policy
        basePrice:         parseFloat(basePrice),
        currency,
        cancellationPolicy: cancellationPolicy.trim() || null,
        // Status
        status,
      }
      await updateProviderTour(freshToken, tourId, input)
      setSuccess('Changes saved.')
      setTimeout(() => setSuccess(null), 3000)
      loadTour()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tour.')
    } finally {
      setSaving(false)
    }
  }

  // ── Archive ─────────────────────────────────────────────────────────────────

  async function handleArchive() {
    if (!confirm('Archive this tour? It will be hidden from travelers.')) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setArchiving(true)
    try {
      await archiveProviderTour(freshToken, tourId)
      router.push('/dashboard/business/services/tours')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive tour.')
    } finally {
      setArchiving(false)
    }
  }

  // ── Image callbacks ─────────────────────────────────────────────────────────

  async function handleImagesUploaded(items: { id: string; url: string; publicId?: string }[]) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    const payload = items.filter(i => i.publicId).map(i => ({ imageUrl: i.url, publicId: i.publicId! }))
    if (payload.length === 0) return
    try { await addTourImages(freshToken, tourId, payload); loadTour() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to save images.') }
  }

  async function handleImageRemove(imageId: string) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    try {
      const result = await removeTourImage(freshToken, tourId, imageId)
      if (result.publicId) deleteMediaAsset(result.publicId, freshToken).catch(() => {})
      loadTour()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image.')
    }
  }

  // ── Loading / not found ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-gray-500 mb-4">{error ?? 'Tour not found.'}</p>
        <Link href="/dashboard/business/services/tours" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back to tours
        </Link>
      </div>
    )
  }

  const canSave = title.trim().length >= 2 && parseFloat(basePrice) > 0

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/business/services/tours" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h1>
          <p className="text-xs text-gray-400">Last updated {fmtDate(tour.updatedAt)}</p>
        </div>
        <button
          onClick={handleArchive}
          disabled={archiving}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Archive tour"
        >
          {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Readiness banner */}
      <ReadinessBanner readiness={tour.readiness} />

      {/* Messages */}
      {error   && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">{success}</div>}

      {/* ── Section 1: Basic Info ── */}
      <Section title="Basic Info">
        <div>
          <label className={labelClass}>Title <span className="text-red-500">*</span></label>
          <input required minLength={2} maxLength={300} value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Short description</label>
          <input maxLength={500} value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass} placeholder="One-line summary shown on listing cards…" />
          <p className={hintClass}>Keep this under 100 characters for best display on search results.</p>
        </div>
        <div>
          <label className={labelClass}>Full description <span className="text-xs text-gray-400 font-normal">(min 50 chars to publish)</span></label>
          <textarea
            rows={5} maxLength={10000}
            value={description} onChange={e => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Describe what makes this tour special — the experience, landscapes, culture, what's included…"
          />
          <p className={hintClass}>{description.length}/10000 · {description.length < 50 ? `${50 - description.length} more chars needed to publish` : '✓ Long enough to publish'}</p>
        </div>
      </Section>

      {/* ── Section 2: Trip Details ── */}
      <Section title="Trip Details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              <option value="">— Select —</option>
              {TOUR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
              <option value="">— Select —</option>
              <option value="Easy">Easy — suitable for all fitness levels</option>
              <option value="Moderate">Moderate — some physical activity required</option>
              <option value="Challenging">Challenging — good fitness needed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Duration (days)</label>
            <input type="number" min={1} max={365} value={durationDays} onChange={e => setDurationDays(e.target.value)} className={inputClass} placeholder="e.g. 3" />
          </div>
          <div>
            <label className={labelClass}>Max group size</label>
            <input type="number" min={1} max={500} value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className={inputClass} placeholder="e.g. 12" />
            <p className={hintClass}>Maximum number of travelers per departure.</p>
          </div>
        </div>
        <div>
          <label className={labelClass}>Languages spoken by guides</label>
          <input
            value={languages}
            onChange={e => setLanguages(e.target.value)}
            className={inputClass}
            placeholder="e.g. English, Mongolian, Chinese"
          />
          <p className={hintClass}>Separate languages with commas.</p>
        </div>
      </Section>

      {/* ── Section 3: Location ── */}
      <Section title="Location">
        <div>
          <label className={labelClass}>Destination</label>
          <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <p className={hintClass}>Links your tour to a destination discovery page. Optional but recommended.</p>
        </div>
        <div>
          <label className={labelClass}>Meeting point</label>
          <input
            maxLength={500}
            value={meetingPoint}
            onChange={e => setMeetingPoint(e.target.value)}
            className={inputClass}
            placeholder="e.g. Chinggis Khaan International Airport, or your hotel lobby in UB"
          />
          <p className={hintClass}>Where should travelers meet you on day 1?</p>
        </div>
      </Section>

      {/* ── Section 4: Pricing & Policy ── */}
      <Section title="Pricing & Policy">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Base price <span className="text-red-500">*</span></label>
            <input required type="number" min={0.01} step={0.01} value={basePrice} onChange={e => setBasePrice(e.target.value)} className={inputClass} />
            <p className={hintClass}>Price per person per departure.</p>
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Cancellation policy</label>
          <textarea
            rows={3} maxLength={5000}
            value={cancellationPolicy}
            onChange={e => setCancellationPolicy(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="e.g. Full refund if cancelled more than 14 days before departure. 50% refund within 14 days. No refund within 48 hours."
          />
          <p className={hintClass}>Describe your refund and cancellation terms clearly.</p>
        </div>
      </Section>

      {/* ── Section 5: Publish Status ── */}
      <Section title="Publish Status">
        <div className="space-y-2">
          {(['draft', 'active', 'paused'] as const).map(s => (
            <label key={s} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
              <input
                type="radio" name="status" value={s}
                checked={status === s} onChange={() => setStatus(s)}
                className="mt-0.5 accent-brand-600 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {s === 'active' ? 'Active' : s === 'paused' ? 'Paused' : 'Draft'}
                </p>
                <p className="text-xs text-gray-500">
                  {s === 'draft'  && 'Hidden from travelers. Use this while setting up.'}
                  {s === 'active' && 'Visible on WeMongolia. Travelers can discover and book.'}
                  {s === 'paused' && 'Temporarily hidden. Existing bookings are not affected.'}
                </p>
              </div>
            </label>
          ))}
        </div>
        {status === 'active' && !tour.readiness.ready && (
          <p className="text-xs text-amber-600 mt-1">⚠ This tour won&apos;t go active until all readiness requirements above are met.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* ── Section 6: Photos ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-1">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            Photos
            <span className="text-xs font-normal text-gray-400">({tour.images.length} uploaded — 1 required to publish)</span>
          </h2>
        </div>
        <div className="px-5 pt-4 pb-5 space-y-3">
          {/* Existing images */}
          {tour.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tour.images.map((img, idx) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={img.imageUrl} alt={img.altText ?? `Tour image ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(img.id)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Upload */}
          {token && (
            <MultiImageUpload
              entity="tour"
              token={token}
              value={[]}
              onChange={handleImagesUploaded}
              maxImages={10 - tour.images.length}
              hint={`Up to ${10 - tour.images.length} more images. JPEG, PNG, WebP — max 10MB each. First image becomes the cover.`}
            />
          )}
        </div>
      </div>

      {/* ── Section 7: Schedule ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {token && (
          <DepartureSection
            tourId={tourId}
            departures={departures}
            onRefresh={loadTour}
          />
        )}
      </div>

    </div>
  )
}
