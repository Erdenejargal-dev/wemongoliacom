'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { uploadImage, type MediaAsset, type EntityType } from '@/lib/api/media'

interface ImageUploadProps {
  entity: EntityType
  token: string
  value?: string | null
  onUploaded: (asset: MediaAsset) => void
  onRemoved?: () => void
  label?: string
  hint?: string
  accept?: string
  maxSizeMB?: number
  className?: string
  previewClassName?: string
}

export function ImageUpload({
  entity,
  token,
  value,
  onUploaded,
  onRemoved,
  label,
  hint,
  accept = 'image/jpeg,image/png,image/webp,image/avif',
  maxSizeMB = 10,
  className = '',
  previewClassName = 'h-40',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File is too large. Maximum ${maxSizeMB}MB.`)
      return
    }

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const asset = await uploadImage(file, entity, token)
      setPreview(asset.secureUrl)
      onUploaded(asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [entity, token, maxSizeMB, onUploaded])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    setPreview(null)
    setError(null)
    onRemoved?.()
  }

  const displayUrl = preview ?? value ?? null

  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>
      )}

      {displayUrl ? (
        <div className={`relative rounded-xl overflow-hidden border border-gray-200 ${previewClassName}`}>
          <img
            src={displayUrl}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
                title="Replace image"
              >
                <Upload className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={`
            w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-2 py-8 px-4
            ${dragOver
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              {uploading ? 'Uploading…' : 'Click or drag to upload'}
            </p>
            {hint && !uploading && (
              <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
            )}
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
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
