'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'

interface UserAvatarUploadProps {
  current: string
  name: string
  onChange: (url: string) => void
}

export function UserAvatarUpload({ current, name, onChange }: UserAvatarUploadProps) {
  const [preview, setPreview] = useState(current)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(url)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-green-100">
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className={`flex-1 border-2 border-dashed rounded-2xl p-5 text-center transition-colors ${dragging ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'}`}
      >
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-700 mb-0.5">Drag & drop a photo, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-green-600 hover:text-green-700 font-semibold underline transition-colors"
        >
          click to browse
        </button>
        <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {/* URL fallback: backend persists only URLs (no upload endpoint for user avatar yet). */}
      <div className="w-full">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
          Avatar URL
        </label>
        <input
          type="url"
          value={preview}
          onChange={e => { setPreview(e.target.value); onChange(e.target.value) }}
          placeholder="https://example.com/avatar.jpg"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/10"
        />
        <p className="text-[10px] text-gray-400 mt-1.5">
          If you upload a file, saving will require a hosted URL.
        </p>
      </div>
    </div>
  )
}
