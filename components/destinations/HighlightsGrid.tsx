import type { DestinationHighlight } from '@/lib/mock-data/destinations'

interface HighlightsGridProps {
  highlights: DestinationHighlight[]
}

export function HighlightsGrid({ highlights }: HighlightsGridProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Destination Highlights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map((h, i) => (
          <div key={h.id}
            className="group relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="h-44 overflow-hidden">
              <img
                src={h.image}
                alt={h.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-sm leading-tight mb-1">{h.title}</p>
              <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{h.description}</p>
            </div>
            {/* Number badge */}
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow">
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
