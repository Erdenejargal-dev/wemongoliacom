'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { MapPin, Building2, Loader2, ChevronRight, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { fetchProviderLimits, isAtLimit, isNearLimit, type ProviderLimits } from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useProviderLocale } from '@/lib/i18n/provider/context'

// ── Usage pill ────────────────────────────────────────────────────────────────

function UsagePill({ current, limit }: { current: number; limit: number | null }) {
  if (limit === null) {
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Unlimited</span>
  }
  const atLimit   = current >= limit
  const nearLimit = !atLimit && current >= limit - 1
  const pct       = Math.min(100, Math.round((current / limit) * 100))

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className={`text-xs font-semibold tabular-nums ${atLimit ? 'text-red-600' : nearLimit ? 'text-amber-600' : 'text-gray-500'}`}>
        {current} / {limit}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-400' : 'bg-brand-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit && (
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">At limit</span>
      )}
    </div>
  )
}

// ── Listing type card ─────────────────────────────────────────────────────────

function ListingTypeCard({
  href, Icon, title, description, usage,
}: {
  href: string
  Icon: LucideIcon
  title: string
  description: string
  usage: ProviderLimits['tours'] | null
}) {
  const atLimit = usage ? isAtLimit(usage) : false

  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        atLimit ? 'border-red-200 hover:border-red-300' : 'border-gray-100 hover:border-brand-200'
      }`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        atLimit ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-600'
      }`}>
        {atLimit ? <AlertTriangle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {usage && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
              atLimit
                ? 'bg-red-100 text-red-700'
                : isNearLimit(usage)
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {usage.limit === null ? usage.current : `${usage.current} / ${usage.limit}`}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        {usage && (
          <UsagePill current={usage.current} limit={usage.limit} />
        )}
      </div>

      <ChevronRight className={`h-5 w-5 shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5 ${
        atLimit ? 'text-red-400' : 'text-gray-400 group-hover:text-brand-600'
      }`} />
    </Link>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const router  = useRouter()
  const { data: session } = useSession()
  const token   = session?.user?.accessToken
  const { t }   = useProviderLocale()
  const st      = t.services

  const [limits,  setLimits]  = useState<ProviderLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const ft = token ? await getFreshAccessToken() : null
      if (!ft) { if (alive) setLoading(false); return }
      if (alive) { setLoading(true); setError(null) }
      try {
        const lim = await fetchProviderLimits(ft)
        if (!alive) return
        setLimits(lim)
      } catch (err) {
        if (!alive) return
        if (err instanceof ApiError && err.status === 401) { signOut({ redirect: false }); router.push('/auth/login') }
        else setError(err instanceof Error ? err.message : st.errorLoading)
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token, router, st.errorLoading])

  if (loading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="h-5 w-5 text-brand-500 animate-spin" /></div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={st.title} description={st.description} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ListingTypeCard
          href="/dashboard/business/services/tours"
          Icon={MapPin}
          title={st.tours.title}
          description={st.tours.description}
          usage={limits?.tours ?? null}
        />
        <ListingTypeCard
          href="/dashboard/business/services/accommodations"
          Icon={Building2}
          title={st.accommodations.title}
          description={st.accommodations.description}
          usage={limits?.accommodations ?? null}
        />
      </div>
    </div>
  )
}
