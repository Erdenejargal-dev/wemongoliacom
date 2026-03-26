'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, X, Pencil, Trash2, Building2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { MultiImageUpload } from '@/components/ui/MultiImageUpload'
import {
  createProviderAccommodation,
  updateProviderAccommodation,
  addAccommodationImages,
  createRoomType as apiCreateRoomType,
} from '@/lib/api/provider-accommodations'
import { fetchDestinations, type Destination } from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import {
  ACCOMMODATION_TYPES, PROPERTY_AMENITIES, ROOM_AMENITIES, BED_TYPES,
} from '@/lib/constants/amenities'
import { useEffect } from 'react'

const STEPS = ['Basics', 'Details', 'Room Types', 'Images', 'Review']
const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors'

interface LocalRoomType {
  _key: string
  name: string
  description: string
  maxGuests: number
  bedType: string
  quantity: number
  basePricePerNight: string
  currency: string
  amenities: string[]
}

function newRoom(): LocalRoomType {
  return {
    _key: Math.random().toString(36).slice(2),
    name: '', description: '', maxGuests: 2, bedType: '', quantity: 1,
    basePricePerNight: '', currency: 'USD', amenities: [],
  }
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
                ? 'bg-green-50 border-green-300 text-green-700 font-semibold'
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

export default function NewAccommodationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])

  // Step 1: Basics
  const [name, setName] = useState('')
  const [accommodationType, setAccommodationType] = useState('ger_camp')
  const [destinationId, setDestinationId] = useState('')
  const [shortDesc, setShortDesc] = useState('')

  // Step 2: Details
  const [description, setDescription] = useState('')
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutTime, setCheckOutTime] = useState('12:00')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [starRating, setStarRating] = useState('')
  const [propertyAmenities, setPropertyAmenities] = useState<string[]>([])

  // Step 3: Room types
  const [roomTypes, setRoomTypes] = useState<LocalRoomType[]>([])
  const [editingRoom, setEditingRoom] = useState<LocalRoomType | null>(null)
  const [showRoomSlide, setShowRoomSlide] = useState(false)

  // Step 4: Images — matches MultiImageUpload value type
  const [images, setImages] = useState<{ id: string; url: string; publicId?: string }[]>([])

  useEffect(() => {
    async function loadDests() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (freshToken) setDestinations(await fetchDestinations(freshToken))
    }
    loadDests()
  }, [token])

  const canGoNext = (() => {
    if (step === 0) return name.trim().length >= 2
    return true
  })()

  function handleRoomSave(room: LocalRoomType) {
    const price = parseFloat(room.basePricePerNight)
    if (!room.name.trim() || isNaN(price) || price <= 0) return
    setRoomTypes(prev => {
      const idx = prev.findIndex(r => r._key === room._key)
      if (idx >= 0) return prev.map((r, i) => i === idx ? room : r)
      return [...prev, room]
    })
    setShowRoomSlide(false)
    setEditingRoom(null)
  }

  function handleRoomRemove(key: string) {
    if (!confirm('Remove this room type?')) return
    setRoomTypes(prev => prev.filter(r => r._key !== key))
  }

  async function handleSubmit(publishNow: boolean) {
    const freshToken = await getFreshAccessToken()
    if (!freshToken) { signOut({ redirect: false }); router.push('/auth/login'); return }

    setSaving(true)
    setError(null)

    try {
      const acc = await createProviderAccommodation(freshToken, {
        name: name.trim(),
        accommodationType,
        destinationId: destinationId || undefined,
        description: (description.trim() || shortDesc.trim()) || undefined,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        cancellationPolicy: cancellationPolicy.trim() || undefined,
        starRating: starRating ? parseInt(starRating) : undefined,
        amenities: propertyAmenities.length ? propertyAmenities : undefined,
        status: 'draft',
      })

      const accId = acc.id

      for (const rt of roomTypes) {
        await apiCreateRoomType(freshToken, accId, {
          name: rt.name.trim(),
          description: rt.description.trim() || undefined,
          maxGuests: rt.maxGuests,
          bedType: rt.bedType || undefined,
          quantity: rt.quantity,
          basePricePerNight: parseFloat(rt.basePricePerNight),
          currency: rt.currency,
          amenities: rt.amenities.length ? rt.amenities : undefined,
        })
      }

      if (images.length > 0) {
        await addAccommodationImages(freshToken, accId, images.map(img => ({
          imageUrl: img.url,
          publicId: img.publicId,
        })))
      }

      if (publishNow) {
        await updateProviderAccommodation(freshToken, accId, { status: 'active' })
      }

      router.push(`/dashboard/business/services/accommodations/${accId}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ redirect: false }); router.push('/auth/login')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create accommodation.')
      }
    } finally {
      setSaving(false)
    }
  }

  const readiness = {
    name: name.trim().length >= 2,
    description: description.trim().length >= 50,
    type: !!accommodationType,
    checkIn: !!checkInTime,
    checkOut: !!checkOutTime,
    roomType: roomTypes.some(rt => parseFloat(rt.basePricePerNight) > 0 && rt.maxGuests >= 1),
    image: images.length >= 1,
  }
  const isReady = Object.values(readiness).every(Boolean)

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/business/services/accommodations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Accommodations
      </Link>

      <PageHeader title="Add Property" description="Create a new accommodation listing." />

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= step && setStep(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              i === step ? 'bg-green-50 text-green-700 border border-green-200' :
              i < step ? 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100' :
              'text-gray-400 border border-transparent'
            }`}
          >
            {i < step && <Check className="w-3 h-3" />}
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* ── Step 1: Basics ── */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Property name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Three Camel Lodge" required minLength={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Accommodation type <span className="text-red-500">*</span></label>
            <select value={accommodationType} onChange={e => setAccommodationType(e.target.value)} className={inputClass}>
              {ACCOMMODATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
            <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Short description</label>
            <input value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass} maxLength={500} placeholder="Brief summary for search results" />
          </div>
        </div>
      )}

      {/* ── Step 2: Details ── */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full description</label>
            <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} maxLength={10000} placeholder="Describe your property in detail (min 50 chars to publish)…" />
            <p className="text-xs text-gray-400 mt-1">{description.length} / 50+ characters</p>
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
            <textarea rows={3} value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} className={`${inputClass} resize-none`} maxLength={5000} placeholder="e.g. Free cancellation up to 48 hours before check-in." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Star rating (optional)</label>
            <select value={starRating} onChange={e => setStarRating(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <AmenitySelect options={PROPERTY_AMENITIES} selected={propertyAmenities} onChange={setPropertyAmenities} label="Property amenities" />
        </div>
      )}

      {/* ── Step 3: Room types ── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {roomTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Add your first room type</p>
              <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                Define the types of rooms or gers available at your property.
              </p>
              <button
                onClick={() => { setEditingRoom(newRoom()); setShowRoomSlide(true) }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add room type
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Room types ({roomTypes.length})</h3>
                <button
                  onClick={() => { setEditingRoom(newRoom()); setShowRoomSlide(true) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add another
                </button>
              </div>
              <div className="space-y-3">
                {roomTypes.map(rt => (
                  <div key={rt._key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{rt.name}</p>
                      <p className="text-xs text-gray-500">
                        {rt.maxGuests} guest{rt.maxGuests !== 1 ? 's' : ''}
                        {rt.bedType && ` · ${BED_TYPES.find(b => b.value === rt.bedType)?.label ?? rt.bedType}`}
                        {' · '}{rt.quantity} unit{rt.quantity !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">${rt.basePricePerNight} / night</p>
                    </div>
                    <button onClick={() => { setEditingRoom({ ...rt }); setShowRoomSlide(true) }} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleRoomRemove(rt._key)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 4: Images ── */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Property images</h3>
          <p className="text-xs text-gray-500">Upload at least 1 image to publish. These are property-level images shown on the listing.</p>
          <MultiImageUpload
            entity="accommodation"
            token={token ?? ''}
            value={images}
            onChange={setImages}
            maxImages={20}
            hint="JPG, PNG, WebP · max 10 MB each"
          />
        </div>
      )}

      {/* ── Step 5: Review ── */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-gray-900">Review your listing</h3>

          <div className="space-y-2">
            {[
              { label: 'Name (≥ 2 chars)', ok: readiness.name },
              { label: 'Description (≥ 50 chars)', ok: readiness.description },
              { label: 'Accommodation type set', ok: readiness.type },
              { label: 'Check-in time set', ok: readiness.checkIn },
              { label: 'Check-out time set', ok: readiness.checkOut },
              { label: 'At least 1 room type with price', ok: readiness.roomType },
              { label: 'At least 1 image', ok: readiness.image },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${r.ok ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                  {r.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={r.ok ? 'text-gray-700' : 'text-red-600 font-medium'}>{r.label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div><span className="font-semibold text-gray-900">Name:</span> {name || '—'}</div>
              <div><span className="font-semibold text-gray-900">Type:</span> {ACCOMMODATION_TYPES.find(t => t.value === accommodationType)?.label}</div>
              <div><span className="font-semibold text-gray-900">Room types:</span> {roomTypes.length}</div>
              <div><span className="font-semibold text-gray-900">Images:</span> {images.length}</div>
              <div><span className="font-semibold text-gray-900">Check-in:</span> {checkInTime || '—'}</div>
              <div><span className="font-semibold text-gray-900">Check-out:</span> {checkOutTime || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1.5" />Back
          </button>
        )}
        <div className="flex-1" />
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canGoNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving || !isReady}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
              Publish
            </button>
          </div>
        )}
      </div>

      {/* ── Room type slide-over ── */}
      {showRoomSlide && editingRoom && (
        <RoomTypeSlideOver
          room={editingRoom}
          onSave={handleRoomSave}
          onClose={() => { setShowRoomSlide(false); setEditingRoom(null) }}
        />
      )}
    </div>
  )
}

function RoomTypeSlideOver({ room, onSave, onClose }: {
  room: LocalRoomType
  onSave: (r: LocalRoomType) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<LocalRoomType>({ ...room })
  const set = (k: keyof LocalRoomType, v: any) => setLocal(prev => ({ ...prev, [k]: v }))
  const canSave = local.name.trim().length >= 1 && parseFloat(local.basePricePerNight) > 0

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {room.name ? 'Edit room type' : 'Add room type'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Room type name <span className="text-red-500">*</span></label>
            <input value={local.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="e.g. Standard Ger" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea rows={3} value={local.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} placeholder="Brief description of this room type…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Max guests</label>
              <input type="number" min={1} max={20} value={local.maxGuests} onChange={e => set('maxGuests', parseInt(e.target.value) || 1)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bed type</label>
              <select value={local.bedType} onChange={e => set('bedType', e.target.value)} className={inputClass}>
                <option value="">— None —</option>
                {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Quantity (units)</label>
              <input type="number" min={1} max={500} value={local.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 1)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price per night <span className="text-red-500">*</span></label>
              <input type="number" min={0.01} step={0.01} value={local.basePricePerNight} onChange={e => set('basePricePerNight', e.target.value)} className={inputClass} placeholder="e.g. 80" />
            </div>
          </div>
          <AmenitySelect options={ROOM_AMENITIES} selected={local.amenities} onChange={v => set('amenities', v)} label="Room amenities" />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={() => canSave && onSave(local)}
            disabled={!canSave}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            Save room type
          </button>
        </div>
      </div>
    </>
  )
}
