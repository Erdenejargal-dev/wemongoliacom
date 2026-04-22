'use client'

/**
 * components/dashboard/TravelerDashboardContent.tsx
 *
 * Client component for the traveler dashboard overview page.
 * Extracted from app/dashboard/page.tsx (which must stay a server component
 * for the provider_owner redirect to work) and uses useTravelerLocale().
 */

import Link from 'next/link'
import { useTravelerLocale } from '@/lib/i18n/traveler/context'
import { useTranslations } from '@/lib/i18n'

interface Props {
  role?: string | null
}

export function TravelerDashboardContent({ role }: Props) {
  const { t, lang, setLang } = useTravelerLocale()
  const { t: appT } = useTranslations()
  const dt = t.dashboard

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{dt.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{dt.subtitle}</p>
        </div>
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
          title={lang === 'mn' ? appT.common.switchToEnglish : appT.common.switchToMongolian}
        >
          {t.langToggleLabel}
        </button>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/account/trips"
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">{dt.cards.trips.label}</p>
          <p className="text-xs text-gray-500 mt-1">{dt.cards.trips.desc}</p>
        </Link>
        <Link href="/account"
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">{dt.cards.account.label}</p>
          <p className="text-xs text-gray-500 mt-1">{dt.cards.account.desc}</p>
        </Link>
        <Link href="/tours"
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">{dt.cards.explore.label}</p>
          <p className="text-xs text-gray-500 mt-1">{dt.cards.explore.desc}</p>
        </Link>
      </div>

      {/* Business portal / become a host */}
      {role === 'admin' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">{dt.cards.businessPortal.label}</p>
          <p className="text-xs text-gray-500 mt-1">{dt.cards.businessPortal.desc}</p>
          <Link href="/dashboard/business"
            className="inline-block mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700 underline">
            {dt.goToPortal}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">{dt.cards.becomeHost.label}</p>
          <p className="text-xs text-gray-500 mt-1">{dt.cards.becomeHost.desc}</p>
          <Link href="/onboarding"
            className="inline-block mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700 underline">
            {dt.startOnboarding}
          </Link>
        </div>
      )}
    </div>
  )
}
