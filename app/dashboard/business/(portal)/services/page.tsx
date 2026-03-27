'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { MapPin, Building2, Loader2, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { fetchProviderTours } from '@/lib/api/provider'
import { fetchProviderAccommodations } from '@/lib/api/provider-accommodations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

function ListingTypeCard({
  href,
  Icon,
  title,
  description,
  count,
}: {
  href: string
  Icon: LucideIcon
  title: string
  description: string
  count: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-gray-600">
            {count}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [tourCount, setTourCount] = useState(0)
  const [accommodationCount, setAccommodationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) {
        if (alive) setLoading(false)
        return
      }
      if (alive) {
        setLoading(true)
        setError(null)
      }
      try {
        const [toursRes, accRes] = await Promise.all([
          fetchProviderTours(freshToken, { limit: 1 }),
          fetchProviderAccommodations(freshToken),
        ])
        if (!alive) return
        setTourCount(toursRes.total)
        setAccommodationCount(accRes.data?.length ?? 0)
      } catch (err) {
        if (!alive) return
        if (err instanceof ApiError && err.status === 401) {
          signOut({ redirect: false })
          router.push('/auth/login')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load listings.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [token, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description="Manage your tours, accommodations, and services."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ListingTypeCard
          href="/dashboard/business/services/tours"
          Icon={MapPin}
          title="Tours"
          description="Manage your tour experiences"
          count={tourCount}
        />
        <ListingTypeCard
          href="/dashboard/business/services/accommodations"
          Icon={Building2}
          title="Accommodations"
          description="Manage your properties and rooms"
          count={accommodationCount}
        />
      </div>
    </div>
  )
}
