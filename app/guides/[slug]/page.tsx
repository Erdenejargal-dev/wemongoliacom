import { notFound } from 'next/navigation'
import { GuideHero } from '@/components/guides/GuideHero'
import { GuideStats } from '@/components/guides/GuideStats'
import { GuideSpecialties } from '@/components/guides/GuideSpecialties'
import { GuideReviews } from '@/components/guides/GuideReviews'
import { ContactGuide } from '@/components/guides/ContactGuide'
import { DetailBreadcrumb } from '@/components/navigation/DetailBreadcrumb'
import { getTranslations } from '@/lib/i18n/server'
import { fetchGuides, fetchGuide } from '@/lib/api/guides'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const { t } = await getTranslations()
  const g = t.guideDetail

  let guide
  try {
    guide = await fetchGuide(slug)
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <DetailBreadcrumb
        ariaLabel={t.common.breadcrumb}
        bar
        variant="chevron"
        items={[
          { href: '/', label: t.common.home },
          { href: '/guides', label: g.breadcrumbGuides },
        ]}
        currentTitle={guide.name}
      />

      {/* Hero */}
      <GuideHero guide={guide} />

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-8">
            <GuideStats guide={guide} />

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">{g.aboutTitle(guide.name)}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{guide.about}</p>
            </div>

            <GuideSpecialties guide={guide} />

            {guide.reviews.length > 0 && (
              <GuideReviews
                reviews={guide.reviews}
                rating={guide.ratingAverage}
                reviewsCount={guide.reviewsCount}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <ContactGuide guide={guide} />

              {/* Quick facts */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{g.quickFactsTitle}</h3>
                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{g.factLocation}</dt>
                    <dd className="font-semibold text-gray-900">{guide.location}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{g.languagesLabel}</dt>
                    <dd className="font-semibold text-gray-900">{guide.languages.join(', ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{g.statYears}</dt>
                    <dd className="font-semibold text-gray-900">{g.factExperience(guide.yearsExperience)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{g.statGuests}</dt>
                    <dd className="font-semibold text-gray-900">{g.factGuests(guide.totalGuests)}</dd>
                  </div>
                  {!guide.dailyRate && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">{g.dailyRate}</dt>
                      <dd className="font-semibold text-gray-500">{g.notAvailable}</dd>
                    </div>
                  )}
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
  try {
    const result = await fetchGuides({ limit: 100 })
    return result.guides.map(g => ({ slug: g.slug }))
  } catch {
    return []
  }
}
