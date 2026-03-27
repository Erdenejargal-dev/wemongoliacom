'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, Building2, ArrowLeft, Star, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import {
  fetchProviderAccommodations,
  type AccommodationListItem,
} from '@/lib/api/provider-accommodations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { ACCOMMODATION_TYPES } from '@/lib/constants/amenities'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-brand-50 text-brand-700 border-brand-200',
    draft:  'bg-gray-50 text-gray-600 border-gray-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  )
}

function AccommodationCard({ acc }: { acc: AccommodationListItem }) {
  const img = acc.images?.[0]?.imageUrl
  const typeName = ACCOMMODATION_TYPES.find(t => t.value === acc.accommodationType)?.label ?? acc.accommodationType
  return (
    <Link
      href={`/dashboard/business/services/accommodations/${acc.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-brand-200 transition-all group"
    >
      <div className="h-36 bg-gray-100 relative">
        {img ? (
          <img src={img} alt={acc.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={acc.status} />
        </div>
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-white bg-black/60 rounded-lg">
            <Pencil className="w-3 h-3" /> Manage
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{acc.name}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-50 rounded text-[10px] font-medium text-gray-600">
            {typeName}
          </span>
          {acc.destination && <span>{acc.destination.name}</span>}
          {acc.starRating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {acc.starRating}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span>{acc._count.roomTypes} room type{acc._count.roomTypes !== 1 ? 's' : ''}</span>
          <span>{acc._count.images} image{acc._count.images !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  )
}

export default function AccommodationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [accommodations, setAccommodations] = useState<AccommodationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) { if (alive) setLoading(false); return }
      if (alive) { setLoading(true); setError(null) }
      try {
        const res = await fetchProviderAccommodations(freshToken)
        if (!alive) return
        setAccommodations(res.data ?? [])
      } catch (err) {
        if (!alive) return
        if (err instanceof ApiError && err.status === 401) {
          signOut({ redirect: false }); router.push('/auth/login')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load accommodations.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/business/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors -mb-2"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back to Listings
      </Link>

      <PageHeader
        title="Accommodations"
        description="Manage your properties, room types, and availability."
        actions={
          <Link
            href="/dashboard/business/services/accommodations/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {accommodations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-brand-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No properties yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Add your first accommodation property — ger camp, hotel, lodge, or guesthouse — so travelers can find and book your rooms.
          </p>
          <Link
            href="/dashboard/business/services/accommodations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first property
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500">{accommodations.length} propert{accommodations.length !== 1 ? 'ies' : 'y'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accommodations.map(acc => (
              <AccommodationCard key={acc.id} acc={acc} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
