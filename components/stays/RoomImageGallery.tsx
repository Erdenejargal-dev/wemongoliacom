'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RoomImage {
  imageUrl: string
  sortOrder: number
}

interface RoomImageGalleryProps {
  images: RoomImage[]
  roomName: string
}

export function RoomImageGallery({ images, roomName }: RoomImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  const prev = () =>
    setLightboxIndex(i => (i !== null ? (i - 1 + images.length) % images.length : 0))
  const next = () =>
    setLightboxIndex(i => (i !== null ? (i + 1) % images.length : 0))

  function openAt(idx: number) {
    setLightboxIndex(idx)
  }

  // ── Grid layout ────────────────────────────────────────────────────────────
  let grid: React.ReactNode

  if (images.length === 1) {
    grid = (
      <div className="h-44 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => openAt(0)}>
        <img
          src={images[0].imageUrl}
          alt={roomName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
    )
  } else if (images.length === 2) {
    grid = (
      <div className="h-44 flex gap-0.5 bg-gray-100">
        {images.slice(0, 2).map((img, i) => (
          <div
            key={i}
            className="flex-1 overflow-hidden cursor-pointer"
            onClick={() => openAt(i)}
          >
            <img
              src={img.imageUrl}
              alt={`${roomName} ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    )
  } else {
    // 3+ images: large left (2/3) + two stacked right (1/3)
    const extra = images.length - 3
    grid = (
      <div className="h-44 flex gap-0.5 bg-gray-100">
        {/* Main image */}
        <div
          className="flex-[2] overflow-hidden cursor-pointer"
          onClick={() => openAt(0)}
        >
          <img
            src={images[0].imageUrl}
            alt={roomName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        {/* Stacked right */}
        <div className="flex-1 flex flex-col gap-0.5">
          <div
            className="flex-1 overflow-hidden cursor-pointer"
            onClick={() => openAt(1)}
          >
            <img
              src={images[1].imageUrl}
              alt={`${roomName} 2`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div
            className="flex-1 overflow-hidden cursor-pointer relative"
            onClick={() => openAt(2)}
          >
            <img
              src={images[2].imageUrl}
              alt={`${roomName} 3`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {extra > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <span className="text-white text-sm font-bold">+{extra}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {grid}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none">
            {lightboxIndex + 1} / {images.length}
          </p>

          {/* Room name label */}
          <p className="absolute top-12 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium select-none">
            {roomName}
          </p>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={e => { e.stopPropagation(); prev() }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex].imageUrl}
            alt={`${roomName} ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={e => { e.stopPropagation(); next() }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center max-w-[80vw]"
              onClick={e => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === lightboxIndex
                      ? 'border-white'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
