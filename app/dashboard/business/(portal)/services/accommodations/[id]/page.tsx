'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Save, Archive, Plus, Pencil, Trash2, X,
  Check, Building2, CalendarDays, ImageIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'
import {
  fetchProviderAccommodation,
  updateProviderAccommodation,
  archiveProviderAccommodation,
  addAccommodationImages,
  removeAccommodationImage,
  fetchRoomTypes,
  createRoomType as apiCreateRoom,
  updateRoomType as apiUpdateRoom,
  deleteRoomType as apiDeleteRoom,
  type AccommodationDetail,
  type RoomTypeItem,
  type UpdateAccommodationInput,
} from '@/lib/api/provider-accommodations'
import { fetchDestinations, type Destination } from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import {
  ACCOMMODATION_TYPES, PROPERTY_AMENITIES, ROOM_AMENITIES, BED_TYPES,
} from '@/lib/constants/amenities'

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors'
const TABS = ['overview', 'rooms', 'calendar', 'images'] as const
type Tab = typeof TABS[number]
const TAB_LABELS: Record<Tab, { label: string; icon: any }> = {
  overview: { label: 'Overview', icon: Building2 },
  rooms:    { label: 'Room Types', icon: Building2 },
  calendar: { label: 'Calendar', icon: CalendarDays },
  images:   { label: 'Images', icon: ImageIcon },
}

function AmenitySelect({ options, selected, onChange, label }: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  label: string
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              selected.includes(o.value)
                ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AccommodationManagePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const accId = params.id as string
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [acc, setAcc] = useState<AccommodationDetail | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview')

  const loadData = useCallback(async () => {
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) { setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const [accData, destsData] = await Promise.all([
        fetchProviderAccommodation(freshToken, accId),
        fetchDestinations(freshToken),
      ])
      setAcc(accData)
      setDestinations(destsData)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ redirect: false }); router.push('/auth/login')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load accommodation.')
      }
    } finally { setLoading(false) }
  }, [token, accId])

  useEffect(() => { loadData() }, [loadData])

  function switchTab(t: Tab) {
    setActiveTab(t)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', t)
    window.history.replaceState(null, '', url.toString())
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
  }
  if (!acc) {
    return <div className="p-6 text-sm text-gray-500">{error || 'Accommodation not found.'}</div>
  }

  const typeName = ACCOMMODATION_TYPES.find(t => t.value === acc.accommodationType)?.label ?? acc.accommodationType

  return (
    <div className="space-y-6">
      <Link href="/dashboard/business/services/accommodations" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Accommodations
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{acc.name}</h1>
          <p className="text-sm text-gray-500">{typeName}{acc.destination ? ` · ${acc.destination.name}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${
            acc.status === 'active' ? 'bg-brand-50 text-brand-700 border-brand-200' :
            acc.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }`}>{acc.status}</span>
        </div>
      </div>

      {/* Readiness banner */}
      {!acc.readiness.ready && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm font-semibold text-amber-800 mb-1">Not ready to publish</p>
          <ul className="space-y-0.5">
            {acc.readiness.missing.map(m => (
              <li key={m} className="text-xs text-amber-700 flex items-center gap-1.5">
                <X className="w-3 h-3 shrink-0" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 pb-px">
        {TABS.map(t => {
          const { label, icon: Icon } = TAB_LABELS[t]
          return (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === t
                  ? 'border-brand-500 text-brand-700 bg-brand-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab acc={acc} destinations={destinations} onUpdated={loadData} />}
      {activeTab === 'rooms' && <RoomTypesTab accId={accId} roomTypes={acc.roomTypes} onUpdated={loadData} />}
      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'images' && <ImagesTab accId={accId} images={acc.images} token={token ?? ''} onUpdated={loadData} />}
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ acc, destinations, onUpdated }: {
  acc: AccommodationDetail; destinations: Destination[]; onUpdated: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(acc.name)
  const [accommodationType, setAccommodationType] = useState(acc.accommodationType)
  const [destinationId, setDestinationId] = useState(acc.destination?.id ?? '')
  const [description, setDescription] = useState(acc.description ?? '')
  const [checkInTime, setCheckInTime] = useState(acc.checkInTime ?? '')
  const [checkOutTime, setCheckOutTime] = useState(acc.checkOutTime ?? '')
  const [cancellationPolicy, setCancellationPolicy] = useState(acc.cancellationPolicy ?? '')
  const [starRating, setStarRating] = useState(acc.starRating?.toString() ?? '')
  const [amenities, setAmenities] = useState<string[]>(acc.amenities)
  const [status, setStatus] = useState(acc.status)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setName(acc.name)
    setAccommodationType(acc.accommodationType)
    setDestinationId(acc.destination?.id ?? '')
    setDescription(acc.description ?? '')
    setCheckInTime(acc.checkInTime ?? '')
    setCheckOutTime(acc.checkOutTime ?? '')
    setCancellationPolicy(acc.cancellationPolicy ?? '')
    setStarRating(acc.starRating?.toString() ?? '')
    setAmenities(acc.amenities)
    setStatus(acc.status)
  }, [acc])

  async function handleSave() {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) { signOut({ redirect: false }); router.push('/auth/login'); return }
    setSaving(true); setMsg(null); setErr(null)
    try {
      const input: UpdateAccommodationInput = {
        name: name.trim(),
        accommodationType,
        destinationId: destinationId || null,
        description: description.trim(),
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        cancellationPolicy: cancellationPolicy.trim() || undefined,
        starRating: starRating ? parseInt(starRating) : null,
        amenities,
        status: status as any,
      }
      await updateProviderAccommodation(freshToken, acc.id, input)
      setMsg('Saved.')
      onUpdated()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save.')
    } finally { setSaving(false) }
  }

  async function handleArchive() {
    if (!confirm('Archive this property? It will be hidden from travelers.')) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    try {
      await archiveProviderAccommodation(freshToken, acc.id)
      router.push('/dashboard/business/services/accommodations')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to archive.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Property name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
            <select value={accommodationType} onChange={e => setAccommodationType(e.target.value)} className={inputClass}>
              {ACCOMMODATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
          <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-xs text-gray-400 mt-1">{description.length} characters (min 50 to publish)</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Check-in time</label>
            <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Check-out time</label>
            <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Cancellation policy</label>
          <textarea rows={3} value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Star rating</label>
          <select value={starRating} onChange={e => setStarRating(e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <AmenitySelect options={PROPERTY_AMENITIES} selected={amenities} onChange={setAmenities} label="Property amenities" />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="active">Active (visible to travelers)</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {msg && <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">{msg}</div>}
      {err && <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
        </button>
        <button onClick={handleArchive} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors">
          <Archive className="w-4 h-4" /> Archive
        </button>
      </div>
    </div>
  )
}

// ── Room Types tab ───────────────────────────────────────────────────────────

function RoomTypesTab({ accId, roomTypes, onUpdated }: {
  accId: string; roomTypes: RoomTypeItem[]; onUpdated: () => void
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<RoomTypeItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSave(rt: RoomTypeItem, isNew: boolean) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) { signOut({ redirect: false }); router.push('/auth/login'); return }
    setErr(null)
    try {
      if (isNew) {
        await apiCreateRoom(freshToken, accId, {
          name: rt.name, description: rt.description || undefined,
          maxGuests: rt.maxGuests, bedType: rt.bedType || undefined,
          quantity: rt.quantity, basePricePerNight: rt.basePricePerNight,
          currency: rt.currency, amenities: rt.amenities.length ? rt.amenities : undefined,
        })
      } else {
        await apiUpdateRoom(freshToken, accId, rt.id, {
          name: rt.name, description: rt.description || undefined,
          maxGuests: rt.maxGuests, bedType: rt.bedType || undefined,
          quantity: rt.quantity, basePricePerNight: rt.basePricePerNight,
          currency: rt.currency, amenities: rt.amenities,
        })
      }
      setEditing(null); setIsNew(false)
      onUpdated()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save room type.')
    }
  }

  async function handleDelete(roomId: string) {
    if (!confirm('Delete this room type? This cannot be undone.')) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) return
    try {
      await apiDeleteRoom(freshToken, accId, roomId)
      onUpdated()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to delete. It may have active bookings.')
    }
  }

  const blank: RoomTypeItem = {
    id: '', accommodationId: accId, name: '', description: null, maxGuests: 2,
    bedType: null, quantity: 1, basePricePerNight: 0, currency: 'USD', amenities: [],
    createdAt: '', updatedAt: '',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Room types ({roomTypes.length})</h3>
        <button
          onClick={() => { setEditing(blank); setIsNew(true) }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Add room type
        </button>
      </div>

      {err && <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{err}</div>}

      {roomTypes.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 mb-1">No room types yet</p>
          <p className="text-xs text-gray-500 mb-4">Add at least one room type to publish this property.</p>
          <button
            onClick={() => { setEditing(blank); setIsNew(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add room type
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {roomTypes.map(rt => (
            <div key={rt.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{rt.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rt.maxGuests} guest{rt.maxGuests !== 1 ? 's' : ''}
                  {rt.bedType && ` · ${BED_TYPES.find(b => b.value === rt.bedType)?.label ?? rt.bedType}`}
                  {' · '}{rt.quantity} unit{rt.quantity !== 1 ? 's' : ''}
                  {rt.amenities.length > 0 && ` · ${rt.amenities.length} amenities`}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">${rt.basePricePerNight} / night</p>
              </div>
              <button onClick={() => { setEditing(rt); setIsNew(false) }} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(rt.id)} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <RoomSlideOver room={editing} isNew={isNew} onSave={handleSave} onClose={() => { setEditing(null); setIsNew(false) }} />
      )}
    </div>
  )
}

function RoomSlideOver({ room, isNew, onSave, onClose }: {
  room: RoomTypeItem; isNew: boolean; onSave: (r: RoomTypeItem, isNew: boolean) => void; onClose: () => void
}) {
  const [local, setLocal] = useState<RoomTypeItem>({ ...room })
  const set = (k: string, v: any) => setLocal(prev => ({ ...prev, [k]: v }))

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{isNew ? 'Add room type' : 'Edit room type'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name <span className="text-red-500">*</span></label>
            <input value={local.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="e.g. Standard Ger" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea rows={3} value={local.description ?? ''} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Max guests</label>
              <input type="number" min={1} max={20} value={local.maxGuests} onChange={e => set('maxGuests', parseInt(e.target.value) || 1)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bed type</label>
              <select value={local.bedType ?? ''} onChange={e => set('bedType', e.target.value)} className={inputClass}>
                <option value="">— None —</option>
                {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Quantity</label>
              <input type="number" min={1} max={500} value={local.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 1)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price / night <span className="text-red-500">*</span></label>
              <input type="number" min={0.01} step={0.01} value={local.basePricePerNight} onChange={e => set('basePricePerNight', parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
          <AmenitySelect options={ROOM_AMENITIES} selected={local.amenities} onChange={v => set('amenities', v)} label="Room amenities" />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => local.name.trim() && local.basePricePerNight > 0 && onSave(local, isNew)}
            disabled={!local.name.trim() || local.basePricePerNight <= 0}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {isNew ? 'Add room type' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Calendar tab (stub for Phase 2) ──────────────────────────────────────────

function CalendarTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
        <CalendarDays className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Calendar coming soon</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Manage room availability, pricing overrides, and blocked dates from a visual calendar. This feature is being built in Phase 2.
      </p>
    </div>
  )
}

// ── Images tab ───────────────────────────────────────────────────────────────

function ImagesTab({ accId, images, token, onUpdated }: {
  accId: string
  images: { id: string; imageUrl: string; publicId: string | null; altText: string | null; sortOrder: number }[]
  token: string
  onUpdated: () => void
}) {
  const router = useRouter()
  const [err, setErr] = useState<string | null>(null)
  const mappedImages = images.map(i => ({ id: i.id, url: i.imageUrl, publicId: i.publicId ?? undefined }))

  async function handleChange(newImages: { id: string; url: string; publicId?: string }[]) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) { signOut({ redirect: false }); router.push('/auth/login'); return }
    setErr(null)

    const currentIds = new Set(images.map(i => i.id))
    const newIds = new Set(newImages.map(i => i.id))

    const removed = images.filter(i => !newIds.has(i.id))
    const added = newImages.filter(i => !currentIds.has(i.id))

    try {
      for (const img of removed) {
        await removeAccommodationImage(freshToken, accId, img.id)
      }
      if (added.length > 0) {
        await addAccommodationImages(freshToken, accId, added.map(a => ({
          imageUrl: a.url,
          publicId: a.publicId,
        })))
      }
      onUpdated()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update images.')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Property images</h3>
      <p className="text-xs text-gray-500">Upload property-level images. At least 1 is required to publish.</p>
      {err && <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{err}</div>}
      <MultiImageUpload
        entity="accommodation"
        token={token}
        value={mappedImages}
        onChange={handleChange}
        maxImages={20}
        hint="JPG, PNG, WebP · max 10 MB each"
      />
    </div>
  )
}
