'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowLeft, Save, Trash2, X, Plus,
  Image as ImageIcon, AlertTriangle, CheckCircle2,
  ListOrdered, Calendar, DollarSign, Info, GripVertical,
} from 'lucide-react'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'
import { ConfirmDialog } from '@/components/dashboard/ui/ConfirmDialog'
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
  type ItineraryDay,
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
  'Adventure', 'Cultural', 'Wildlife & Nature', 'Photography',
  'Trekking & Hiking', 'Horseback Riding', 'Luxury', 'Budget',
  'Family', 'Festival', 'Nomadic Life', 'Other',
]
const CURRENCIES = ['USD', 'EUR', 'MNT', 'CNY', 'GBP']

const LANGUAGE_OPTIONS = [
  'English', 'Mongolian', 'Chinese', 'Russian', 'Japanese',
  'Korean', 'German', 'French', 'Spanish', 'Arabic',
]

type Tab = 'info' | 'itinerary' | 'schedule' | 'pricing' | 'images' | 'publish'
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'info',      label: 'Info',      icon: <Info className="w-3.5 h-3.5" /> },
  { id: 'itinerary', label: 'Itinerary', icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { id: 'schedule',  label: 'Schedule',  icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'pricing',   label: 'Pricing',   icon: <DollarSign className="w-3.5 h-3.5" /> },
  { id: 'images',    label: 'Images',    icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { id: 'publish',   label: 'Publish',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
]

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 pt-5 pb-1">
        <div className="pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-5 pt-4 pb-5 space-y-4">{children}</div>
    </div>
  )
}

// ── Readiness banner ──────────────────────────────────────────────────────────

function ReadinessBanner({ readiness, te }: {
  readiness: ProviderTourDetail['readiness']; te: ProviderTourEditorMessages
}) {
  if (readiness.ready) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-500" />
        <p className="text-sm font-medium">
          {te.readiness.readyLine1} <strong>{te.readiness.readyActive}</strong> {te.readiness.readyLine2}
        </p>
      </div>
    )
  }
  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
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

// ── Language chips ────────────────────────────────────────────────────────────

function LanguageChips({ value, onChange }: {
  value: string[]; onChange: (v: string[]) => void
}) {
  const [custom, setCustom] = useState('')

  function toggle(lang: string) {
    onChange(value.includes(lang) ? value.filter(l => l !== lang) : [...value, lang])
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setCustom('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGE_OPTIONS.map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              value.includes(lang)
                ? 'bg-brand-500 border-brand-500 text-white font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      {/* Custom language input */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder="Other language…"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-3 py-2 text-xs font-semibold text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
      {/* Selected custom languages (not in preset) */}
      {value.filter(l => !LANGUAGE_OPTIONS.includes(l)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.filter(l => !LANGUAGE_OPTIONS.includes(l)).map(lang => (
            <span key={lang} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-brand-500 border border-brand-500 text-white font-semibold">
              {lang}
              <button type="button" onClick={() => toggle(lang)} className="ml-0.5 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Itinerary editor ──────────────────────────────────────────────────────────

function ItineraryEditor({ days, onChange }: {
  days: ItineraryDay[]; onChange: (days: ItineraryDay[]) => void
}) {
  function addDay() {
    const nextDay = days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) + 1 : 1
    onChange([...days, { dayNumber: nextDay, title: '', description: '', overnightLocation: '' }])
  }

  function removeDay(index: number) {
    const updated = days.filter((_, i) => i !== index)
    // Re-number
    onChange(updated.map((d, i) => ({ ...d, dayNumber: i + 1 })))
  }

  function updateDay(index: number, field: keyof ItineraryDay, value: string | number) {
    onChange(days.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  function moveDay(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= days.length) return
    const updated = [...days]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated.map((d, i) => ({ ...d, dayNumber: i + 1 })))
  }

  return (
    <div className="space-y-3">
      {days.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
          <ListOrdered className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-500 mb-1">No itinerary days yet</p>
          <p className="text-xs text-gray-400">Add a day-by-day breakdown of your tour.</p>
        </div>
      ) : (
        days.map((day, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            {/* Day header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveDay(index, -1)}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-25 transition-colors"
                  aria-label="Move day up"
                >
                  <GripVertical className="w-3 h-3 text-gray-400 rotate-90 scale-x-[-1]" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDay(index, 1)}
                  disabled={index === days.length - 1}
                  className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-25 transition-colors"
                  aria-label="Move day down"
                >
                  <GripVertical className="w-3 h-3 text-gray-400 rotate-90" />
                </button>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full shrink-0">
                Day {day.dayNumber}
              </span>
              <input
                value={day.title}
                onChange={e => updateDay(index, 'title', e.target.value)}
                placeholder="Day title (e.g. Arrival in Ulaanbaatar)"
                className="flex-1 text-sm font-semibold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 min-w-0"
              />
              <button
                type="button"
                onClick={() => removeDay(index)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Remove day"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Day body */}
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={day.description ?? ''}
                  onChange={e => updateDay(index, 'description', e.target.value)}
                  placeholder="What happens on this day? Activities, meals, highlights…"
                  className={`${inputClass} resize-none text-xs`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Overnight location</label>
                <input
                  value={day.overnightLocation ?? ''}
                  onChange={e => updateDay(index, 'overnightLocation', e.target.value)}
                  placeholder="e.g. Ger camp in Gobi Desert"
                  className={`${inputClass} text-xs`}
                />
              </div>
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={addDay}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-brand-600 border-2 border-dashed border-brand-200 rounded-2xl hover:bg-brand-50 hover:border-brand-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Day {days.length + 1}
      </button>
    </div>
  )
}

// ── Departure section ─────────────────────────────────────────────────────────

function DepartureSection({ tourId, departures, tourCurrency, onRefresh, te }: {
  tourId: string; departures: TourDeparture[]; tourCurrency: string
  onRefresh: () => void; te: ProviderTourEditorMessages
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
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null)
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
          <Plus className="w-3.5 h-3.5" />{dep.addDeparture}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.startDate} *</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.endDate} *</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.availableSeats} *</label>
              <input type="number" min={1} max={500} required value={seats} onChange={e => setSeats(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">{dep.priceOverride}</label>
              <input type="number" min={0} step={0.01} value={priceOverride} onChange={e => setPriceOverride(e.target.value)} className={inputClass} placeholder={dep.basePricePlaceholder} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-lg transition-colors">
              {saving ? 'Saving…' : dep.addSubmit}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
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
                onClick={() => setDeleteTarget(row.id)}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this departure?"
        description="Travelers with existing bookings on this departure will be affected."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => { if (deleteTarget) { handleDelete(deleteTarget); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

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
  const [activeTab,    setActiveTab]    = useState<Tab>('info')
  const [archiveOpen,  setArchiveOpen]  = useState(false)

  // Form state
  const [title,              setTitle]              = useState('')
  const [shortDesc,          setShortDesc]          = useState('')
  const [description,        setDescription]        = useState('')
  const [category,           setCategory]           = useState('')
  const [difficulty,         setDifficulty]         = useState('')
  const [durationDays,       setDurationDays]       = useState('')
  const [maxGuests,          setMaxGuests]          = useState('')
  const [minGuests,          setMinGuests]          = useState('')
  const [languages,          setLanguages]          = useState<string[]>([])
  const [destinationId,      setDestinationId]      = useState('')
  const [meetingPoint,       setMeetingPoint]       = useState('')
  const [basePrice,          setBasePrice]          = useState('')
  const [currency,           setCurrency]           = useState('USD')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [status,             setStatus]             = useState<'draft' | 'active' | 'paused'>('draft')
  const [itinerary,          setItinerary]          = useState<ItineraryDay[]>([])

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
      setTitle(t.title)
      setShortDesc(t.shortDescription ?? '')
      setDescription(t.description ?? '')
      setCategory(t.category ?? '')
      setDifficulty(t.difficulty ?? '')
      setDurationDays(t.durationDays ? String(t.durationDays) : '')
      setMaxGuests(t.maxGuests ? String(t.maxGuests) : '')
      setMinGuests(t.minGuests ? String(t.minGuests) : '')
      setLanguages(t.languages ?? [])
      setDestinationId(t.destination?.id ?? '')
      setMeetingPoint(t.meetingPoint ?? '')
      setBasePrice(String(t.basePrice))
      setCurrency(t.currency ?? 'USD')
      setCancellationPolicy(t.cancellationPolicy ?? '')
      setStatus(t.status as 'draft' | 'active' | 'paused')
      setItinerary(t.itinerary ?? [])
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
        languages,
        destinationId:     destinationId || null,
        meetingPoint:      meetingPoint.trim() || null,
        basePrice:         parseFloat(basePrice),
        currency,
        cancellationPolicy: cancellationPolicy.trim() || null,
        status,
        itinerary: itinerary.map(d => ({
          dayNumber:         d.dayNumber,
          title:             d.title,
          description:       d.description || undefined,
          overnightLocation: d.overnightLocation || null,
        })),
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

  async function handleArchive() {
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

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
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
    <div className="space-y-4 max-w-2xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/business/services/tours" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{tour.title}</h1>
          <p className="text-xs text-gray-400">{te.actions.lastUpdated(fmtDate(tour.updatedAt))}</p>
        </div>
        {/* Sticky Save + Archive */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setArchiveOpen(true)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title={te.actions.archiveTooltip}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? te.actions.saving : te.actions.save}
          </button>
        </div>
      </div>

      {/* Readiness banner */}
      <ReadinessBanner readiness={tour.readiness} te={te} />

      {/* Feedback messages */}
      {error   && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">{success}</div>}

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-gray-100 rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Info tab ── */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <Section title={te.sections.basicInfo} description={te.sections.basicInfoDesc}>
            <div>
              <label className={labelClass}>{te.labels.title} <span className="text-red-500">*</span></label>
              <input required minLength={2} maxLength={300} value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{te.labels.shortDesc}</label>
              <input maxLength={500} value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass} placeholder={te.placeholders.shortDesc} />
              <p className={hintClass}>{te.hints.shortDesc}</p>
            </div>
            <div>
              <label className={labelClass}>
                {te.labels.fullDesc}
                <span className="text-xs text-gray-400 font-normal ml-1">{te.labels.fullDescMin}</span>
              </label>
              <textarea rows={6} maxLength={10000} value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} placeholder={te.placeholders.fullDesc} />
              <p className={hintClass}>
                {te.hints.charCount(description.length)}{' '}
                {description.length < 50 ? te.hints.needMore(50 - description.length) : te.hints.longEnough}
              </p>
            </div>
          </Section>

          <Section title={te.sections.tripDetails} description={te.sections.tripDetailsDesc}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{te.labels.category}</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                  <option value="">{te.select.placeholder}</option>
                  {TOUR_CATEGORIES.map(c => <option key={c} value={c}>{te.categories[c] ?? c}</option>)}
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{te.labels.durationDays}</label>
                <input type="number" min={1} max={365} value={durationDays} onChange={e => setDurationDays(e.target.value)} className={inputClass} placeholder={te.placeholders.duration} />
              </div>
              <div>
                <label className={labelClass}>{te.labels.maxGuests}</label>
                <input type="number" min={1} max={500} value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className={inputClass} placeholder={te.placeholders.maxGuests} />
                <p className={hintClass}>{te.hints.maxGroup}</p>
              </div>
            </div>
            <div>
              <label className={labelClass}>{te.labels.minGuests}</label>
              <input type="number" min={1} max={500} value={minGuests} onChange={e => setMinGuests(e.target.value)} className={inputClass} placeholder={te.placeholders.minGuests} />
            </div>
            <div>
              <label className={labelClass}>{te.labels.languages}</label>
              <LanguageChips value={languages} onChange={setLanguages} />
              <p className={hintClass}>Select the languages your guide speaks.</p>
            </div>
          </Section>

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
              <input maxLength={500} value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)} className={inputClass} placeholder={te.placeholders.meetingPoint} />
              <p className={hintClass}>{te.hints.meetDay1}</p>
            </div>
          </Section>
        </div>
      )}

      {/* ── Itinerary tab ── */}
      {activeTab === 'itinerary' && (
        <Section
          title="Day-by-Day Itinerary"
          description="Give travelers a detailed breakdown of each day. A complete itinerary builds confidence and reduces pre-booking questions."
        >
          <ItineraryEditor days={itinerary} onChange={setItinerary} />
          {itinerary.length > 0 && (
            <p className="text-xs text-gray-400">
              Changes are saved when you click <strong>Save</strong> in the header.
            </p>
          )}
        </Section>
      )}

      {/* ── Schedule tab ── */}
      {activeTab === 'schedule' && (
        <Section title={te.sections.schedule} description={te.sections.scheduleDesc}>
          <DepartureSection
            tourId={tourId}
            departures={departures}
            tourCurrency={currency}
            onRefresh={loadTour}
            te={te}
          />
        </Section>
      )}

      {/* ── Pricing tab ── */}
      {activeTab === 'pricing' && (
        <Section title={te.sections.pricing} description={te.sections.pricingDesc}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{te.labels.basePrice} <span className="text-red-500">*</span></label>
              <input required type="number" min={0.01} step={0.01} value={basePrice} onChange={e => setBasePrice(e.target.value)} className={inputClass} />
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
            <textarea rows={3} maxLength={5000} value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} className={`${inputClass} resize-none`} placeholder={te.placeholders.cancellation} />
            <p className={hintClass}>{te.hints.cancelClear}</p>
          </div>
        </Section>
      )}

      {/* ── Images tab ── */}
      {activeTab === 'images' && (
        <Section title={te.sections.photos} description={te.sections.photosDesc(tour.images.length)} >
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
      )}

      {/* ── Publish tab ── */}
      {activeTab === 'publish' && (
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
            <p className="text-xs text-amber-600">⚠ {te.status.notLiveWarning}</p>
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
          </div>
        </Section>
      )}

      {/* Archive confirm dialog */}
      <ConfirmDialog
        open={archiveOpen}
        title={te.confirmArchive}
        description="This tour will be hidden from travelers. You can restore it later."
        confirmLabel={te.actions.archive}
        variant="danger"
        onConfirm={() => { setArchiveOpen(false); handleArchive() }}
        onCancel={() => setArchiveOpen(false)}
      />
    </div>
  )
}
