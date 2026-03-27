'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon, AlertCircle, GripVertical } from 'lucide-react'
import { uploadImages as uploadMultiple, type MediaAsset, type EntityType } from '@/lib/api/media'

interface ImageItem {
  id: string
  url: string
  publicId?: string
}

interface MultiImageUploadProps {
  entity: EntityType
  token: string
  value: ImageItem[]
  onChange: (items: ImageItem[]) => void
  label?: string
  hint?: string
  maxImages?: number
  maxSizeMB?: number
  className?: string
}

export function MultiImageUpload({
  entity,
  token,
  value,
  onChange,
  label,
  hint,
  maxImages = 10,
  maxSizeMB = 10,
  className = '',
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)

    const fileArr = Array.from(files)
    const remaining = maxImages - value.length
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed.`)
      return
    }

    const selected = fileArr.slice(0, remaining)
    const maxBytes = maxSizeMB * 1024 * 1024

    for (const f of selected) {
      if (!f.type.startsWith('image/')) {
        setError('Only image files are allowed.')
        return
      }
      if (f.size > maxBytes) {
        setError(`${f.name} is too large. Maximum ${maxSizeMB}MB per file.`)
        return
      }
    }

    setUploading(true)
    try {
      const assets: MediaAsset[] = await uploadMultiple(selected, entity, token)
      const newItems: ImageItem[] = assets.map(a => ({
        id: a.publicId,
        url: a.secureUrl,
        publicId: a.publicId,
      }))
      onChange([...value, ...newItems])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }, [entity, token, value, maxImages, maxSizeMB, onChange])

  function handleRemove(id: string) {
    onChange(value.filter(item => item.id !== id))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
          {value.map((item, idx) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={item.url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {value.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          disabled={uploading}
          className={`
            w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-2 py-6 px-4
            border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50
            ${uploading ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <p className="text-xs font-medium text-gray-600">
            {uploading ? 'Uploading…' : 'Click or drag images to upload'}
          </p>
          {hint && !uploading && (
            <p className="text-[10px] text-gray-400">{hint}</p>
          )}
          <p className="text-[10px] text-gray-400">
            {value.length}/{maxImages} images
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
