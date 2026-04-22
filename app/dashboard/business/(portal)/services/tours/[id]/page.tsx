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
import { useProviderLocale } from '@/lib/i18n/provider/context'
import { formatDateForLocaleString } from '@/lib/i18n/format-date'
import type { ProviderTourEditorMessages } from '@/lib/i18n/messages/providerTourEditor'
import { displayTourReadinessMissing } from '@/lib/i18n/tour-readiness-display'

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors bg-white'

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const hintClass  = 'text-xs text-gray-400 mt-1'

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

function Section({
  title,
  description,
  children,
  icon,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 pt-5 pb-1">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          {icon && <span className="text-gray-400">{icon}</span>}
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 pt-4 pb-5 space-y-4">{children}</div>
    </div>
  )
}

// ── Readiness banner ──────────────────────────────────────────────────────────

function ReadinessBanner({
  readiness,
  te,
}: {
  readiness: ProviderTourDetail['readiness']
  te:        ProviderTourEditorMessages
}) {
  if (readiness.ready) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-500" aria-hidden />
        <p className="text-sm font-medium">
          {te.readiness.readyLine1}{' '}
          <strong>{te.readiness.readyActive}</strong>{' '}
          {te.readiness.readyLine2}
        </p>
      </div>
    )
  }
  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" aria-hidden />
        <p className="text-sm font-semibold">{te.readiness.notReadyTitle}</p>
      </div>
      <ul className="ml-8 list-disc text-xs space-y-0.5">
        {readiness.missing.map((m, i) => (
          <li key={i}>{displayTourReadinessMissing(m, te.readinessMissing)}</li>
        ))}
      </ul>
    </div>
  )
}

// ── Departure section ─────────────────────────────────────────────────────────

function DepartureSection({
  tourId,
  departures,
  tourCurrency,
  onRefresh,
  te,
}: {
  tourId: string
  departures: TourDeparture[]
  tourCurrency: string
  onRefresh: () => void
  te:        ProviderTourEditorMessages
}) {
  const { t: prov } = useProviderLocale()
  const dep = te.departures
  const fmtDate = (iso: string) =>
    formatDateForLocaleString(iso, prov.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
  const [showAdd,       setShowAdd]       = useState(false)
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [seats,         setSeats]         = useState('12')
  const [priceOverride, setPriceOverride] = useState('')
  const [currency,      setCurrency]      = useState(tourCurrency)
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
        priceOverride:  priceOverride ? parseFloat(priceOverride) : undefined,
        currency:       currency || tourCurrency,
      })
      setShowAdd(false)
      setStartDate(''); setEndDate(''); setSeats('12'); setPriceOverride('')
      onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : dep.errCreate)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(depId: string) {
    if (!confirm(dep.deleteConfirm)) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setDeleting(depId)
    try { await deleteTourDeparture(freshToken, tourId, depId); onRefresh() }
    catch (err) { alert(err instanceof Error ? err.message : dep.errDeleteGeneric) }
    finally { setDeleting(null) }
  }

  const upcoming = departures.filter(d => new Date(d.startDate) >= new Date() && d.status === 'scheduled')
  const past     = departures.filter(d => new Date(d.startDate) < new Date() || d.status !== 'scheduled')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{dep.hintPublish}</p>
        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden />{dep.addDeparture}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.startDate} <span className="text-red-500">*</span></label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.endDate} <span className="text-red-500">*</span></label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.availableSeats} <span className="text-red-500">*</span></label>
              <input type="number" min={1} max={500} required value={seats} onChange={e => setSeats(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.priceOverride}</label>
              <input type="number" min={0} step={0.01} value={priceOverride} onChange={e => setPriceOverride(e.target.value)} className={inputClass} placeholder={dep.basePricePlaceholder} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{te.labels.currency}</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-lg transition-colors">
              {saving ? te.actions.saving : dep.addSubmit}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              {prov.bookings.cancelBtn}
            </button>
          </div>
        </form>
      )}

      {upcoming.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
          {upcoming.map(row => (
            <div key={row.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{fmtDate(row.startDate)} — {fmtDate(row.endDate)}</p>
                <p className="text-xs text-gray-500">
                  {dep.seatsBooked(row.bookedSeats, row.availableSeats)}
                  {row.priceOverride != null && <> · {row.currency} {row.priceOverride}</>}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">{row.status}</span>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                disabled={deleting === row.id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={dep.removeDepartureAria}
              >
                {deleting === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {upcoming.length === 0 && !showAdd && (
        <p className="text-xs text-gray-400 py-2">{dep.emptyUpcoming}</p>
      )}

      {past.length > 0 && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-500">{dep.pastSummary(past.length)}</summary>
          <div className="mt-2 space-y-1">
            {past.map(row => (
              <div key={row.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500">{fmtDate(row.startDate)} — {fmtDate(row.endDate)}</span>
                <span className="text-gray-400">{dep.pastSeats(row.bookedSeats, row.availableSeats)}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${row.status === 'cancelled' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>{row.status}</span>
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
  const { t: prov } = useProviderLocale()
  const te = prov.tourEditor
  const fmtDate = (iso: string) =>
    formatDateForLocaleString(iso, prov.dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })

  const [tour,         setTour]         = useState<ProviderTourDetail | null>(null)
  const [departures,   setDepartures]   = useState<TourDeparture[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [archiving,    setArchiving]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<string | null>(null)

  // ── Form state ──────────────────────────────────────────────────────────────
  // § 1: Basic info
  const [title,       setTitle]       = useState('')
  const [shortDesc,   setShortDesc]   = useState('')
  const [description, setDescription] = useState('')
  // § 2: Trip details
  const [category,    setCategory]    = useState('')
  const [difficulty,  setDifficulty]  = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [maxGuests,   setMaxGuests]   = useState('')
  const [minGuests,   setMinGuests]   = useState('')
  const [languages,   setLanguages]   = useState('')   // comma-separated
  // § 3: Location
  const [destinationId, setDestinationId] = useState('')
  const [meetingPoint,  setMeetingPoint]  = useState('')
  // § 4: Pricing & policy
  const [basePrice,          setBasePrice]          = useState('')
  const [currency,           setCurrency]           = useState('USD')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  // § 5: Status
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
      // Populate form fields
      setTitle(t.title)
      setShortDesc(t.shortDescription ?? '')
      setDescription(t.description ?? '')
      setCategory(t.category ?? '')
      setDifficulty(t.difficulty ?? '')
      setDurationDays(t.durationDays ? String(t.durationDays) : '')
      setMaxGuests(t.maxGuests ? String(t.maxGuests) : '')
      setMinGuests(t.minGuests ? String(t.minGuests) : '')
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
        setError(err instanceof Error ? err.message : te.toasts.errLoad)
      }
    } finally {
      setLoading(false)
    }
  }, [token, tourId, router, te])

  useEffect(() => { loadTour() }, [loadTour])

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setError(null); setSuccess(null)
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setSaving(true)
    try {
      const input: UpdateTourInput = {
        title:             title.trim(),
        shortDescription:  shortDesc.trim() || undefined,
        description:       description.trim() || undefined,
        category:          category.trim() || undefined,
        difficulty:        (difficulty as 'Easy' | 'Moderate' | 'Challenging') || null,
        durationDays:      durationDays ? parseInt(durationDays, 10) : undefined,
        maxGuests:         maxGuests ? parseInt(maxGuests, 10) : undefined,
        minGuests:         minGuests ? parseInt(minGuests, 10) : undefined,
        languages:         languages.trim()
          ? languages.split(',').map(l => l.trim()).filter(Boolean)
          : [],
        destinationId:     destinationId || null,
        meetingPoint:      meetingPoint.trim() || null,
        basePrice:         parseFloat(basePrice),
        currency,
        cancellationPolicy: cancellationPolicy.trim() || null,
        status,
      }
      await updateProviderTour(freshToken, tourId, input)
      setSuccess(te.toasts.saved)
      setTimeout(() => setSuccess(null), 3000)
      loadTour()
    } catch (err) {
      setError(err instanceof Error ? err.message : te.toasts.errSave)
    } finally {
      setSaving(false)
    }
  }

  // ── Archive ─────────────────────────────────────────────────────────────────

  async function handleArchive() {
    if (!confirm(te.confirmArchive)) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    setArchiving(true)
    try {
      await archiveProviderTour(freshToken, tourId)
      router.push('/dashboard/business/services/tours')
    } catch (err) {
      setError(err instanceof Error ? err.message : te.toasts.errArchive)
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
    catch (err) { setError(err instanceof Error ? err.message : te.toasts.errImages) }
  }

  async function handleImageRemove(imageId: string) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    try {
      const result = await removeTourImage(freshToken, tourId, imageId)
      if (result.publicId) deleteMediaAsset(result.publicId, freshToken).catch(() => {})
      loadTour()
    } catch (err) {
      setError(err instanceof Error ? err.message : te.toasts.errRemoveImage)
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
        <p className="text-sm text-gray-500 mb-4">{error ?? te.tourNotFound}</p>
        <Link href="/dashboard/business/services/tours" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          {te.actions.backToTours}
        </Link>
      </div>
    )
  }

  const canSave = title.trim().length >= 2 && parseFloat(basePrice) > 0

  return (
    <div className="space-y-5 max-w-2xl">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/business/services/tours" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h1>
          <p className="text-xs text-gray-400">{te.actions.lastUpdated(fmtDate(tour.updatedAt))}</p>
        </div>
        <button
          type="button"
          onClick={handleArchive}
          disabled={archiving}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title={te.actions.archiveTooltip}
        >
          {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Readiness banner ── */}
      <ReadinessBanner readiness={tour.readiness} te={te} />

      {/* ── Messages ── */}
      {error   && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">{success}</div>}

      {/* ── § 1: Photos ── shown first — required to publish ── */}
      <Section
        title={te.sections.photos}
        description={te.sections.photosDesc(tour.images.length)}
        icon={<ImageIcon className="w-4 h-4" />}
      >
        {tour.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {tour.images.map((img, idx) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                <img src={img.imageUrl} alt={img.altText ?? te.tourImage(idx + 1)} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleImageRemove(img.id)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{te.cover}</span>
                )}
              </div>
            ))}
          </div>
        )}
        {token ? (
          <MultiImageUpload
            entity="tour"
            token={token}
            value={[]}
            onChange={handleImagesUploaded}
            maxImages={10 - tour.images.length}
            hint={te.photosUploadHint(String(10 - tour.images.length))}
          />
        ) : (
          <p className="text-xs text-gray-400">{te.signInUpload}</p>
        )}
      </Section>

      {/* ── § 2: Basic Info ── */}
      <Section title={te.sections.basicInfo} description={te.sections.basicInfoDesc}>
        <div>
          <label className={labelClass}>{te.labels.title} <span className="text-red-500">*</span></label>
          <input
            required minLength={2} maxLength={300}
            value={title} onChange={e => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{te.labels.shortDesc}</label>
          <input
            maxLength={500}
            value={shortDesc} onChange={e => setShortDesc(e.target.value)}
            className={inputClass}
            placeholder={te.placeholders.shortDesc}
          />
          <p className={hintClass}>{te.hints.shortDesc}</p>
        </div>
        <div>
          <label className={labelClass}>
            {te.labels.fullDesc}
            <span className="text-xs text-gray-400 font-normal ml-1">{te.labels.fullDescMin}</span>
          </label>
          <textarea
            rows={6} maxLength={10000}
            value={description} onChange={e => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder={te.placeholders.fullDesc}
          />
          <p className={hintClass}>
            {te.hints.charCount(description.length)}{' '}
            {description.length < 50
              ? te.hints.needMore(50 - description.length)
              : te.hints.longEnough}
          </p>
        </div>
      </Section>

      {/* ── § 3: Trip Details ── */}
      <Section title={te.sections.tripDetails} description={te.sections.tripDetailsDesc}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{te.labels.category}</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              <option value="">{te.select.placeholder}</option>
              {TOUR_CATEGORIES.map(c => (
                <option key={c} value={c}>{te.categories[c] ?? c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{te.labels.difficulty}</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
              <option value="">{te.select.placeholder}</option>
              <option value="Easy">{te.difficulties.Easy}</option>
              <option value="Moderate">{te.difficulties.Moderate}</option>
              <option value="Challenging">{te.difficulties.Challenging}</option>
            </select>
            <p className={hintClass}>
              {difficulty === 'Easy'        && te.hints.diffEasy}
              {difficulty === 'Moderate'    && te.hints.diffModerate}
              {difficulty === 'Challenging' && te.hints.diffChallenging}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{te.labels.durationDays}</label>
            <input
              type="number" min={1} max={365}
              value={durationDays} onChange={e => setDurationDays(e.target.value)}
              className={inputClass} placeholder={te.placeholders.duration}
            />
          </div>
          <div>
            <label className={labelClass}>{te.labels.maxGuests}</label>
            <input
              type="number" min={1} max={500}
              value={maxGuests} onChange={e => setMaxGuests(e.target.value)}
              className={inputClass} placeholder={te.placeholders.maxGuests}
            />
            <p className={hintClass}>{te.hints.maxGroup}</p>
          </div>
        </div>
        <div>
          <label className={labelClass}>{te.labels.minGuests}</label>
          <input
            type="number" min={1} max={500}
            value={minGuests} onChange={e => setMinGuests(e.target.value)}
            className={inputClass} placeholder={te.placeholders.minGuests}
          />
          <p className={hintClass}>{te.hints.minGroup}</p>
        </div>
        <div>
          <label className={labelClass}>{te.labels.languages}</label>
          <input
            value={languages} onChange={e => setLanguages(e.target.value)}
            className={inputClass}
            placeholder={te.placeholders.languages}
          />
          <p className={hintClass}>{te.hints.langsComma}</p>
        </div>
      </Section>

      {/* ── § 4: Location ── */}
      <Section title={te.sections.location} description={te.sections.locationDesc}>
        <div>
          <label className={labelClass}>{te.labels.destination}</label>
          <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className={inputClass}>
            <option value="">{te.select.none}</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <p className={hintClass}>{te.hints.destLink}</p>
        </div>
        <div>
          <label className={labelClass}>{te.labels.meetingPoint}</label>
          <input
            maxLength={500}
            value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)}
            className={inputClass}
            placeholder={te.placeholders.meetingPoint}
          />
          <p className={hintClass}>{te.hints.meetDay1}</p>
        </div>
      </Section>

      {/* ── § 5: Pricing & Policy ── */}
      <Section title={te.sections.pricing} description={te.sections.pricingDesc}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{te.labels.basePrice} <span className="text-red-500">*</span></label>
            <input
              required type="number" min={0.01} step={0.01}
              value={basePrice} onChange={e => setBasePrice(e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>{te.hints.pricePerPerson}</p>
          </div>
          <div>
            <label className={labelClass}>{te.labels.currency}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>{te.labels.cancellation}</label>
          <textarea
            rows={3} maxLength={5000}
            value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder={te.placeholders.cancellation}
          />
          <p className={hintClass}>{te.hints.cancelClear}</p>
        </div>
      </Section>

      {/* ── § 6: Schedule / Departures ── */}
      <Section
        title={te.sections.schedule}
        description={te.sections.scheduleDesc}
        icon={<Calendar className="w-4 h-4" />}
      >
        <DepartureSection
          tourId={tourId}
          departures={departures}
          tourCurrency={currency}
          onRefresh={loadTour}
          te={te}
        />
      </Section>

      {/* ── § 7: Publish Status + Save ── always last ── */}
      <Section title={te.sections.publish} description={te.sections.publishDesc}>
        <div className="space-y-2">
          {(['draft', 'active', 'paused'] as const).map(s => (
            <label
              key={s}
              className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio" name="status" value={s}
                checked={status === s} onChange={() => setStatus(s)}
                className="mt-0.5 accent-brand-600 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {s === 'active' ? te.status.active : s === 'paused' ? te.status.paused : te.status.draft}
                </p>
                <p className="text-xs text-gray-500">
                  {s === 'draft'  && te.status.draftDesc}
                  {s === 'active' && te.status.activeDesc}
                  {s === 'paused' && te.status.pausedDesc}
                </p>
              </div>
            </label>
          ))}
        </div>

        {status === 'active' && !tour.readiness.ready && (
          <p className="text-xs text-amber-600">
            ⚠ {te.status.notLiveWarning}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? te.actions.saving : te.actions.save}
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-xl transition-colors"
          >
            {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {te.actions.archive}
          </button>
        </div>
      </Section>

    </div>
  )
}
