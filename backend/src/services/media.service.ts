import {
  uploadBuffer,
  uploadFromUrl,
  deleteAsset,
  replaceAsset,
  FOLDERS,
  type CloudinaryFolder,
  type MediaAsset,
} from '../lib/cloudinary'
import { AppError } from '../middleware/error'

// ── Upload single image ─────────────────────────────────────────────────────

export async function uploadImage(
  buffer: Buffer,
  folder: CloudinaryFolder,
  options?: { tags?: string[]; publicId?: string },
): Promise<MediaAsset> {
  try {
    return await uploadBuffer(buffer, { folder, ...options })
  } catch (err) {
    console.error('[media] Upload failed:', err)
    throw new AppError('Image upload failed. Please try again.', 500)
  }
}

// ── Upload multiple images ──────────────────────────────────────────────────

export async function uploadImages(
  files: { buffer: Buffer; originalname: string }[],
  folder: CloudinaryFolder,
  tags?: string[],
): Promise<MediaAsset[]> {
  const results = await Promise.allSettled(
    files.map(f => uploadBuffer(f.buffer, { folder, tags })),
  )

  const assets: MediaAsset[] = []
  const errors: string[] = []

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'fulfilled') {
      assets.push(r.value)
    } else {
      errors.push(`${files[i].originalname}: upload failed`)
    }
  }

  if (assets.length === 0) {
    throw new AppError('All image uploads failed.', 500)
  }

  return assets
}

// ── Upload from URL ─────────────────────────────────────────────────────────

export async function uploadImageFromUrl(
  url: string,
  folder: CloudinaryFolder,
  options?: { tags?: string[]; publicId?: string },
): Promise<MediaAsset> {
  try {
    return await uploadFromUrl(url, { folder, ...options })
  } catch (err) {
    console.error('[media] URL upload failed:', err)
    throw new AppError('Image upload from URL failed.', 500)
  }
}

// ── Replace image ───────────────────────────────────────────────────────────

export async function replaceImage(
  oldPublicId: string | null | undefined,
  buffer: Buffer,
  folder: CloudinaryFolder,
): Promise<MediaAsset> {
  try {
    return await replaceAsset(oldPublicId, buffer, { folder })
  } catch (err) {
    console.error('[media] Replace failed:', err)
    throw new AppError('Image replacement failed.', 500)
  }
}

// ── Delete image ────────────────────────────────────────────────────────────

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    return await deleteAsset(publicId)
  } catch (err) {
    console.error('[media] Delete failed:', err)
    return false
  }
}

// ── Resolve folder from entity type ─────────────────────────────────────────

export function resolveFolder(entity: string): CloudinaryFolder {
  const map: Record<string, CloudinaryFolder> = {
    provider:      FOLDERS.PROVIDERS,
    tour:          FOLDERS.TOURS,
    destination:   FOLDERS.DESTINATIONS,
    user:          FOLDERS.USERS,
    accommodation: FOLDERS.ACCOMMODATIONS,
    vehicle:       FOLDERS.VEHICLES,
    gallery:       FOLDERS.GALLERY,
  }
  const folder = map[entity.toLowerCase()]
  if (!folder) throw new AppError(`Unknown entity type: ${entity}`, 400)
  return folder
}
