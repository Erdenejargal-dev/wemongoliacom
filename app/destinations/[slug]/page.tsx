import { notFound } from 'next/navigation'
import { getDestinationBySlug, destinations } from '@/lib/mock-data/destinations'
import { DestinationHero } from '@/components/destinations/DestinationHero'
import { HighlightsGrid } from '@/components/destinations/HighlightsGrid'
import { ActivitiesList } from '@/components/destinations/ActivitiesList'
import { TravelTips } from '@/components/destinations/TravelTips'
import { DestinationTours } from '@/components/destinations/DestinationTours'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params
  const destination = getDestinationBySlug(slug)
  if (!destination) notFound()

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* ── Hero ───────────────────────────────── */}
      <DestinationHero destination={destination} />

      {/* ── Body ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* About */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">About</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-4">
              Discover {destination.name}
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">{destination.description}</p>
          </div>

          {/* Gallery strip */}
          {destination.galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              {destination.galleryImages.map((src, i) => (
                <div key={i} className="h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img src={src} alt={`${destination.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Highlights */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <HighlightsGrid highlights={destination.highlights} />
        </section>

        {/* Activities */}
        <ActivitiesList activities={destination.activities} />

        {/* Tours */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <DestinationTours
            destinationSlug={destination.slug}
            destinationName={destination.name}
          />
        </section>

        {/* Travel Tips */}
        <TravelTips tips={destination.tips} />

        {/* CTA Banner */}
        <section className="relative rounded-2xl overflow-hidden">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/40" />
          <div className="relative px-8 py-12 max-w-lg">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Plan Your Trip</p>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to explore {destination.name}?
            </h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Browse our hand-curated tours and find the perfect adventure for your travel style.
            </p>
            <a href={`/tours?destination=${encodeURIComponent(destination.name)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors shadow-lg">
              Browse {destination.name} Tours
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return destinations.map(d => ({ slug: d.slug }))
}
