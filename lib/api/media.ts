/**
 * Frontend API helpers for media uploads.
 * All uploads go through our backend which handles Cloudinary.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

// ── Types ───────────────────────────────────────────────────────────────────

export interface MediaAsset {
  publicId:     string
  secureUrl:    string
  url:          string
  resourceType: string
  format:       string
  width:        number
  height:       number
  bytes:        number
  folder:       string
  createdAt:    string
}

export type EntityType =
  | 'provider'
  | 'tour'
  | 'destination'
  | 'user'
  | 'accommodation'
  | 'vehicle'
  | 'gallery'

// ── Upload single image ─────────────────────────────────────────────────────

export async function uploadImage(
  file: File,
  entity: EntityType,
  token: string,
  tags?: string[],
): Promise<MediaAsset> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('entity', entity)
  if (tags?.length) formData.append('tags', tags.join(','))

  const res = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Upload failed')
  return json.data as MediaAsset
}

// ── Upload multiple images ──────────────────────────────────────────────────

export async function uploadImages(
  files: File[],
  entity: EntityType,
  token: string,
  tags?: string[],
): Promise<MediaAsset[]> {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))
  formData.append('entity', entity)
  if (tags?.length) formData.append('tags', tags.join(','))

  const res = await fetch(`${API_BASE}/media/upload/batch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Upload failed')
  return json.data as MediaAsset[]
}

// ── Upload from URL ─────────────────────────────────────────────────────────

export async function uploadImageFromUrl(
  url: string,
  entity: EntityType,
  token: string,
  tags?: string[],
): Promise<MediaAsset> {
  const res = await fetch(`${API_BASE}/media/upload/url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, entity, tags }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Upload failed')
  return json.data as MediaAsset
}

// ── Delete image ────────────────────────────────────────────────────────────

export async function deleteMediaAsset(
  publicId: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/media/delete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Delete failed')
}
