/**
 * components/destinations/HighlightsGrid.tsx
 *
 * Renders destination highlights as plain text items.
 * The backend stores highlights as String[] (not structured objects),
 * so we show them as a numbered text grid — no fake images.
 */

interface HighlightsGridProps {
  highlights: string[]
}

export function HighlightsGrid({ highlights }: HighlightsGridProps) {
  if (highlights.length === 0) return null

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Highlights</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {highlights.map((highlight, i) => (
          <li
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-brand-50/40 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
