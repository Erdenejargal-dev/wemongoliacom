/**
 * Frontend Cloudinary helpers.
 *
 * Uses NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME for URL generation (safe to expose).
 * Upload operations go through our backend API, not directly to Cloudinary.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

// ── Optimized URL builder ───────────────────────────────────────────────────

type ImageTransform = {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale'
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  gravity?: 'auto' | 'face' | 'center'
  aspectRatio?: string
}

/**
 * Build an optimized Cloudinary delivery URL from a public_id.
 * Falls back to the raw URL if no cloud name is configured.
 */
export function cloudinaryUrl(
  publicIdOrUrl: string,
  transform: ImageTransform = {},
): string {
  if (!CLOUD_NAME || !publicIdOrUrl) return publicIdOrUrl

  // Full Cloudinary URL — inject transforms after /upload/
  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    const parts: string[] = []
    if (transform.width) parts.push(`w_${transform.width}`)
    if (transform.height) parts.push(`h_${transform.height}`)
    if (transform.crop) parts.push(`c_${transform.crop}`)
    if (transform.quality) parts.push(`q_${transform.quality}`)
    if (transform.format) parts.push(`f_${transform.format}`)
    if (transform.gravity) parts.push(`g_${transform.gravity}`)
    if (transform.aspectRatio) parts.push(`ar_${transform.aspectRatio}`)
    if (!transform.quality) parts.push('q_auto')
    if (!transform.format) parts.push('f_auto')
    const transformStr = parts.join(',')
    return publicIdOrUrl.replace('/upload/', `/upload/${transformStr}/`)
  }

  // Non-Cloudinary full URL — return as-is
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl
  }

  const parts: string[] = []

  if (transform.width) parts.push(`w_${transform.width}`)
  if (transform.height) parts.push(`h_${transform.height}`)
  if (transform.crop) parts.push(`c_${transform.crop}`)
  if (transform.quality) parts.push(`q_${transform.quality}`)
  if (transform.format) parts.push(`f_${transform.format}`)
  if (transform.gravity) parts.push(`g_${transform.gravity}`)
  if (transform.aspectRatio) parts.push(`ar_${transform.aspectRatio}`)

  // Default optimizations
  if (!transform.quality) parts.push('q_auto')
  if (!transform.format) parts.push('f_auto')

  const transformStr = parts.length > 0 ? parts.join(',') + '/' : ''

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}${publicIdOrUrl}`
}

// ── Preset URL builders ─────────────────────────────────────────────────────

export function thumbnailUrl(publicId: string, size = 400): string {
  return cloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
  })
}

export function coverUrl(publicId: string, width = 1200): string {
  return cloudinaryUrl(publicId, {
    width,
    crop: 'fill',
    gravity: 'auto',
    aspectRatio: '16:9',
  })
}

export function avatarUrl(publicId: string, size = 200): string {
  return cloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
  })
}

export function galleryUrl(publicId: string, width = 800): string {
  return cloudinaryUrl(publicId, {
    width,
    crop: 'limit',
  })
}

/**
 * Resolve an image URL: if a publicId is available, build an optimized URL.
 * Otherwise fall back to the raw imageUrl (for backward compat with seed data).
 */
export function resolveImageUrl(
  imageUrl: string | null | undefined,
  publicId: string | null | undefined,
  transform?: ImageTransform,
): string {
  if (publicId) return cloudinaryUrl(publicId, transform)
  return imageUrl ?? ''
}
