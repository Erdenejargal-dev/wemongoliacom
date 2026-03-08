'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Grid2X2 } from 'lucide-react'

interface TourGalleryProps {
  images: string[]
  title: string
}

export function TourGallery({ images, title }: TourGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const main = images[0]
  const thumbs = images.slice(1, 5)

  const prev = () => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : 0)
  const next = () => setLightboxIndex(i => i !== null ? (i + 1) % images.length : 0)

  return (
    <>
      {/* ── Gallery Grid ─────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 h-[420px]">
        {/* Main large image */}
        <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden" onClick={() => setLightboxIndex(0)}>
          <img src={main} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Thumbnails */}
        {thumbs.map((src, i) => (
          <div key={i} className="col-span-1 row-span-1 cursor-pointer overflow-hidden" onClick={() => setLightboxIndex(i + 1)}>
            <img src={src} alt={`${title} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}

        {/* Show all button */}
        <button
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-md transition-colors backdrop-blur-sm"
        >
          <Grid2X2 className="w-4 h-4" />
          Show all photos
        </button>
      </div>

      {/* ── Lightbox Modal ───────────────────── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          {/* Close */}
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightboxIndex(null)}>
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>

          {/* Prev */}
          <button className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); prev() }}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`${title} ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          <button className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); next() }}>
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={e => e.stopPropagation()}>
            {images.map((src, i) => (
              <button key={i} onClick={() => setLightboxIndex(i)}
                className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition-colors ${i === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
