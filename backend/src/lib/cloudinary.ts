import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { Readable } from 'stream'

// Auto-configures from CLOUDINARY_URL env var (cloudinary://key:secret@cloud)
// Falls back to individual vars if URL is not set
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  })
}

export { cloudinary }

// ── Folder constants ────────────────────────────────────────────────────────

export const FOLDERS = {
  PROVIDERS:      'wemongolia/providers',
  TOURS:          'wemongolia/tours',
  DESTINATIONS:   'wemongolia/destinations',
  USERS:          'wemongolia/users',
  ACCOMMODATIONS: 'wemongolia/accommodations',
  VEHICLES:       'wemongolia/vehicles',
  GALLERY:        'wemongolia/gallery',
} as const

export type CloudinaryFolder = (typeof FOLDERS)[keyof typeof FOLDERS]

// ── Normalized response ─────────────────────────────────────────────────────

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

function normalize(res: UploadApiResponse): MediaAsset {
  return {
    publicId:     res.public_id,
    secureUrl:    res.secure_url,
    url:          res.url,
    resourceType: res.resource_type,
    format:       res.format,
    width:        res.width,
    height:       res.height,
    bytes:        res.bytes,
    folder:       res.folder ?? '',
    createdAt:    res.created_at,
  }
}

// ── Upload from buffer ──────────────────────────────────────────────────────

export async function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: CloudinaryFolder
    publicId?: string
    tags?: string[]
    transformation?: Record<string, unknown>
  },
): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        options.folder,
        public_id:     options.publicId,
        resource_type: 'image',
        tags:          options.tags,
        transformation: options.transformation,
        overwrite:     true,
        invalidate:    true,
      },
      (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'))
        resolve(normalize(result))
      },
    )
    Readable.from(buffer).pipe(stream)
  })
}

// ── Upload from URL ─────────────────────────────────────────────────────────

export async function uploadFromUrl(
  url: string,
  options: {
    folder: CloudinaryFolder
    publicId?: string
    tags?: string[]
  },
): Promise<MediaAsset> {
  const result = await cloudinary.uploader.upload(url, {
    folder:        options.folder,
    public_id:     options.publicId,
    resource_type: 'image',
    tags:          options.tags,
    overwrite:     true,
    invalidate:    true,
  })
  return normalize(result)
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteAsset(publicId: string): Promise<boolean> {
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
  })
  return result.result === 'ok'
}

// ── Delete multiple ─────────────────────────────────────────────────────────

export async function deleteAssets(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return
  await cloudinary.api.delete_resources(publicIds)
}

// ── Replace (delete old + upload new) ───────────────────────────────────────

export async function replaceAsset(
  oldPublicId: string | null | undefined,
  buffer: Buffer,
  options: { folder: CloudinaryFolder; publicId?: string; tags?: string[] },
): Promise<MediaAsset> {
  const asset = await uploadBuffer(buffer, options)
  if (oldPublicId && oldPublicId !== asset.publicId) {
    deleteAsset(oldPublicId).catch(() => {})
  }
  return asset
}

// ── Optimized URL builder ───────────────────────────────────────────────────

export function optimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {},
): string {
  return cloudinary.url(publicId, {
    secure:         true,
    fetch_format:   options.format ?? 'auto',
    quality:        options.quality ?? 'auto',
    width:          options.width,
    height:         options.height,
    crop:           options.crop ?? 'fill',
    gravity:        'auto',
  })
}

// ── Generate signed upload params (for direct frontend upload) ──────────────

export function signUploadParams(
  folder: CloudinaryFolder,
  tags?: string[],
): { timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string } {
  const timestamp = Math.round(Date.now() / 1000)
  const params: Record<string, unknown> = {
    timestamp,
    folder,
    ...(tags?.length ? { tags: tags.join(',') } : {}),
  }
  const signature = cloudinary.utils.api_sign_request(
    params,
    cloudinary.config().api_secret!,
  )
  return {
    timestamp,
    signature,
    apiKey:    cloudinary.config().api_key!,
    cloudName: cloudinary.config().cloud_name!,
    folder,
  }
}
