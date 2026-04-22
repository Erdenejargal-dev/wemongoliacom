'use client'

/**
 * app/admin/destinations/page.tsx
 *
 * Admin CRUD for curated Destination records.
 * Admins can create, edit, delete, and toggle featured status.
 *
 * Architecture note:
 * - Destinations are admin-owned; providers do NOT create them.
 * - Region taxonomy is separate (lib/constants/geography.ts).
 * - Tours link to destinations via destinationId; destinations are discovery pages.
 */

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Plus, Pencil, Trash2, Star, StarOff, Loader2, Globe, MapPin, AlertCircle,
} from 'lucide-react'
import {
  fetchAdminDestinations,
  fetchAdminDestination,
  createAdminDestination,
  updateAdminDestination,
  deleteAdminDestination,
  toggleAdminDestinationFeatured,
  type AdminDestination,
  type AdminDestinationDetail,
  type AdminDestinationInput,
} from '@/lib/api/admin'
import { MONGOLIA_REGIONS } from '@/lib/constants/geography'
import { useTranslations, formatDateMonthYear } from '@/lib/i18n'

// ── Empty form ────────────────────────────────────────────────────────────────

const EMPTY_FORM: AdminDestinationInput = {
  name:             '',
  slug:             '',
  country:          'Mongolia',
  region:           '',
  shortDescription: '',
  description:      '',
  heroImageUrl:     '',
  gallery:          [],
  highlights:       [],
  activities:       [],
  tips:             [],
  bestTimeToVisit:  '',
  weatherInfo:      '',
  featured:         false,
}

// ── String-array field editor ─────────────────────────────────────────────────

function StringArrayEditor({
  label, value, onChange, placeholder,
}: {
  label:       string
  value:       string[]
  onChange:    (v: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState('')
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault()
              onChange([...value, draft.trim()])
              setDraft('')
            }
          }}
          placeholder={placeholder}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft('') } }}
          className="px-3 py-2 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Destination form panel ────────────────────────────────────────────────────

function DestinationFormPanel({
  editId,
  token,
  onSaved,
  onClose,
}: {
  editId:   string | null
  token:    string
  onSaved:  () => void
  onClose:  () => void
}) {
  const [form,    setForm]    = useState<AdminDestinationInput>(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Load existing destination for edit
  useEffect(() => {
    if (!editId) { setForm(EMPTY_FORM); return }
    setLoading(true)
    fetchAdminDestination(editId, token)
      .then((d: AdminDestinationDetail) => {
        setForm({
          name:             d.name,
          slug:             d.slug,
          country:          d.country,
          region:           d.region ?? '',
          shortDescription: d.shortDescription ?? '',
          description:      d.description ?? '',
          heroImageUrl:     d.heroImageUrl ?? '',
          gallery:          d.gallery,
          highlights:       d.highlights,
          activities:       d.activities,
          tips:             d.tips,
          bestTimeToVisit:  d.bestTimeToVisit ?? '',
          weatherInfo:      d.weatherInfo ?? '',
          featured:         d.featured,
        })
      })
      .catch(e => setError(e?.message ?? 'Failed to load destination'))
      .finally(() => setLoading(false))
  }, [editId, token])

  const field = (key: keyof AdminDestinationInput) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  )

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const payload: AdminDestinationInput = {
        ...form,
        slug:             form.slug?.trim() || undefined,
        region:           form.region?.trim() || null,
        shortDescription: form.shortDescription?.trim() || null,
        description:      form.description?.trim() || null,
        heroImageUrl:     form.heroImageUrl?.trim() || null,
        bestTimeToVisit:  form.bestTimeToVisit?.trim() || null,
        weatherInfo:      form.weatherInfo?.trim() || null,
      }
      if (editId) {
        await updateAdminDestination(editId, payload, token)
      } else {
        await createAdminDestination(payload, token)
      }
      onSaved()
    } catch (e: any) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-bold text-gray-900">
          {editId ? 'Edit Destination' : 'New Destination'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg font-light transition-colors">
          ×
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={field('name')}
            placeholder="e.g. Gobi Desert"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Slug <span className="text-gray-400 font-normal">(auto-generated from name if empty)</span>
          </label>
          <input
            value={form.slug ?? ''}
            onChange={field('slug')}
            placeholder="e.g. gobi-desert"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Region</label>
          <select
            value={form.region ?? ''}
            onChange={field('region')}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400 bg-white"
          >
            <option value="">— None —</option>
            {MONGOLIA_REGIONS.map(r => (
              <option key={r.slug} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Short description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Short Description <span className="text-gray-400 font-normal">(shown on cards, max 500 chars)</span>
          </label>
          <textarea
            value={form.shortDescription ?? ''}
            onChange={field('shortDescription')}
            rows={2}
            maxLength={500}
            placeholder="One sentence tagline…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Full description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Full Description <span className="text-gray-400 font-normal">(shown on detail page)</span>
          </label>
          <textarea
            value={form.description ?? ''}
            onChange={field('description')}
            rows={5}
            maxLength={5000}
            placeholder="Detailed editorial description…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Hero image URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Hero Image URL</label>
          <input
            value={form.heroImageUrl ?? ''}
            onChange={field('heroImageUrl')}
            placeholder="https://…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Best time to visit */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Best Time to Visit</label>
          <input
            value={form.bestTimeToVisit ?? ''}
            onChange={field('bestTimeToVisit')}
            placeholder="e.g. May–September"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Weather info */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Weather Info</label>
          <input
            value={form.weatherInfo ?? ''}
            onChange={field('weatherInfo')}
            placeholder="e.g. Extreme continental climate, −30°C to +40°C"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Highlights */}
        <StringArrayEditor
          label="Highlights"
          value={form.highlights ?? []}
          onChange={v => setForm(p => ({ ...p, highlights: v }))}
          placeholder="e.g. Khongoryn Els Sand Dunes — press Enter"
        />

        {/* Activities */}
        <StringArrayEditor
          label="Activities (Things to Do)"
          value={form.activities ?? []}
          onChange={v => setForm(p => ({ ...p, activities: v }))}
          placeholder="e.g. Camel trekking at sunrise — press Enter"
        />

        {/* Tips */}
        <StringArrayEditor
          label="Travel Tips"
          value={form.tips ?? []}
          onChange={v => setForm(p => ({ ...p, tips: v }))}
          placeholder="e.g. Pack layers for extreme temperature swings — press Enter"
        />

        {/* Featured */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Featured — show in homepage carousel and featured grid
          </span>
        </label>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {editId ? 'Save Changes' : 'Create Destination'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function DestinationsContent() {
  const { data: session }  = useSession()
  const token              = session?.user?.accessToken ?? ''
  const { lang } = useTranslations()

  const [destinations, setDestinations] = useState<AdminDestination[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [panel,        setPanel]        = useState<'create' | string | null>(null) // null = closed, 'create' = new, string = edit id
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [toggling,     setToggling]     = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminDestinations(token)
      setDestinations(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteAdminDestination(id, token)
      setDestinations(prev => prev.filter(d => d.id !== id))
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleFeatured(id: string) {
    setToggling(id)
    try {
      await toggleAdminDestinationFeatured(id, token)
      await load()
    } catch (e: any) {
      alert(e?.message ?? 'Toggle failed')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="flex h-full">
      {/* ── Main table ──────────────────────────────────── */}
      <div className={`flex-1 min-w-0 transition-all ${panel ? 'mr-[440px]' : ''}`}>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Destinations</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Curated destination pages shown on /destinations and the homepage carousel.
                Admins only — providers cannot create destinations.
              </p>
            </div>
            <button
              onClick={() => setPanel('create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Destination
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {destinations.length === 0 ? (
                <div className="text-center py-16">
                  <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No destinations yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-5">
                    Create your first destination or run the seed script.
                  </p>
                  <button
                    onClick={() => setPanel('create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Destination
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Destination</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">Region</th>
                      <th className="px-5 py-3 text-center hidden sm:table-cell">Tours</th>
                      <th className="px-5 py-3 text-center">Featured</th>
                      <th className="px-5 py-3 text-left hidden lg:table-cell">Created</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {destinations.map(dest => (
                      <tr key={dest.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Name + slug */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {dest.heroImageUrl ? (
                              <img
                                src={dest.heroImageUrl}
                                alt={dest.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{dest.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono truncate">{dest.slug}</p>
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-gray-600 text-xs">{dest.region ?? '—'}</span>
                        </td>

                        {/* Tour count */}
                        <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                          <span className="text-xs font-medium text-gray-700">
                            {dest._count.tours}
                          </span>
                        </td>

                        {/* Featured toggle */}
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleFeatured(dest.id)}
                            disabled={toggling === dest.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                            title={dest.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {toggling === dest.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : dest.featured ? (
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ) : (
                              <StarOff className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-gray-400">{formatDateMonthYear(dest.createdAt, lang)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setPanel(dest.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(dest.id, dest.name)}
                              disabled={deleting === dest.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {deleting === dest.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Architecture note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">Architecture reminder</p>
            <p>• <strong>Destinations</strong> (this page) = admin-curated editorial pages for discovery.</p>
            <p>• <strong>Regions</strong> (Gobi, Altai, etc.) = controlled taxonomy for search/filter — managed in <code>lib/constants/geography.ts</code>.</p>
            <p>• <strong>Specific places</strong> (Khongor Dunes, Tsagaan Suvarga…) = providers mention in listing text — no CMS needed.</p>
          </div>
        </div>
      </div>

      {/* ── Slide-in form panel ─────────────────────────── */}
      {panel && (
        <div className="fixed top-0 right-0 h-full w-[440px] bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col">
          <DestinationFormPanel
            editId={panel === 'create' ? null : panel}
            token={token}
            onSaved={() => { setPanel(null); load() }}
            onClose={() => setPanel(null)}
          />
        </div>
      )}
    </div>
  )
}

export default function AdminDestinationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  )
}
