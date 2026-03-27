'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { uploadImage, type MediaAsset } from '@/lib/api/media'

interface UserAvatarUploadProps {
  current: string
  name: string
  token: string
  onChange: (url: string, publicId?: string) => void
}

export function UserAvatarUpload({ current, name, token, onChange }: UserAvatarUploadProps) {
  const [preview, setPreview] = useState(current)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum 5MB.')
      return
    }

    setError(null)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const asset: MediaAsset = await uploadImage(file, 'user', token)
      setPreview(asset.secureUrl)
      onChange(asset.secureUrl, asset.publicId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
      setPreview(current)
    } finally {
      setUploading(false)
    }
  }, [token, current, onChange])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-brand-100">
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
            </div>
          ) : (
            <img src={preview} alt={name} className="w-full h-full object-cover" />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className={`flex-1 border-2 border-dashed rounded-2xl p-5 text-center transition-colors ${dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/30'} ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-700 mb-0.5">Drag & drop a photo, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold underline transition-colors"
        >
          click to browse
        </button>
        <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); if (inputRef.current) inputRef.current.value = '' }}
      />

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
