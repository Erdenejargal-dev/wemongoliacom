import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, Clock, Users } from 'lucide-react'
import { getHostBySlug, hosts } from '@/lib/mock-data/hosts'
import { mockTours } from '@/lib/mock-data/tours'
import { HostHero } from '@/components/hosts/HostHero'
import { HostStats } from '@/components/hosts/HostStats'
import { HostReviews } from '@/components/hosts/HostReviews'
import { ContactHost } from '@/components/hosts/ContactHost'
import { formatPricing, readPricing } from '@/lib/pricing'
import { readPreferredCurrencyServer } from '@/lib/preferences-storage.server'
import { getTranslations } from '@/lib/i18n/server'
import { DetailBreadcrumb } from '@/components/navigation/DetailBreadcrumb'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function HostPage({ params }: Props) {
  const { slug } = await params
  const { t } = await getTranslations()
  const h = t.hostDetail
  const host = getHostBySlug(slug)
  if (!host) notFound()

  const hostTours = mockTours.filter(tour => tour.hostSlug === slug && tour.available)
  // Phase 6.3 — honour the user's display-currency preference on this public
  // listing surface (host profile tour grid). Mock-data tours don't have a
  // real `pricing` DTO yet, so conversion is not possible and `formatPricing`
  // will render an explicit "(base)" fallback when displayCurrency differs.
  const displayCurrency = await readPreferredCurrencyServer()

  const hostTypeLabel =
    host.type === 'company'   ? h.typeCompany
      : host.type === 'guide' ? h.typeGuide
        : host.type === 'driver' ? h.typeDriver
          : h.typeProvider

  const styleColors: Record<string, string> = {
    adventure:   'bg-orange-50 text-orange-600',
    cultural:    'bg-purple-50 text-purple-600',
    luxury:      'bg-yellow-50 text-yellow-600',
    budget:      'bg-blue-50 text-blue-600',
    photography: 'bg-pink-50 text-pink-600',
    trekking:    'bg-brand-50 text-brand-600',
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <DetailBreadcrumb
        ariaLabel={t.common.breadcrumb}
        bar
        variant="chevron"
        items={[
          { href: '/', label: t.common.home },
          { href: '/hosts', label: h.breadcrumbHosts },
        ]}
        currentTitle={host.name}
      />

      {/* Hero (cover + profile card) */}
      <HostHero host={host} />

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left main column ───────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Stats */}
            <HostStats host={host} />

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">{h.aboutTitle(host.name)}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{host.about}</p>
            </div>

            {/* Tours */}
            {hostTours.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-900">{h.toursBy(host.name)}</h2>
                  <Link href="/tours" className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                    {h.browseAllTours}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostTours.map(tour => (
                    <Link key={tour.id} href={`/tours/${tour.slug}`}
                      className="group block rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="relative h-36 overflow-hidden bg-gray-200">
                        <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${styleColors[tour.style] ?? 'bg-gray-100 text-gray-600'}`}>
                            {tour.style}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">{tour.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{tour.duration}</span>
                          <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{h.tourMaxGuests(tour.maxGuests)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-gray-900">{tour.rating}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{formatPricing(readPricing({ basePrice: tour.price, currency: tour.currency ?? 'USD' }), displayCurrency ?? undefined)}<span className="text-xs font-normal text-gray-400">{h.perPersonSuffix}</span></span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <HostReviews
              reviews={host.reviews}
              rating={host.rating}
              reviewsCount={host.reviewsCount}
            />
          </div>

          {/* ── Right sidebar ──────────────────── */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <ContactHost host={host} />

              {/* Quick facts */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{h.quickFacts}</h3>
                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{h.factType}</dt>
                    <dd className="font-semibold text-gray-900 capitalize">{hostTypeLabel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{h.factBasedIn}</dt>
                    <dd className="font-semibold text-gray-900">{host.location}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{h.factLanguages}</dt>
                    <dd className="font-semibold text-gray-900">{host.languages.join(', ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{h.factExperienceLabel}</dt>
                    <dd className="font-semibold text-gray-900">{h.factExperience(host.yearsExperience)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{h.factGuestsServed}</dt>
                    <dd className="font-semibold text-gray-900">{host.totalGuests.toLocaleString()}+</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return hosts.map(h => ({ slug: h.slug }))
}
