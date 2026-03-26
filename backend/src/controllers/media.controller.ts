import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  uploadImage,
  uploadImages,
  uploadImageFromUrl,
  deleteImage,
  resolveFolder,
} from '../services/media.service'
import { signUploadParams, FOLDERS, type CloudinaryFolder } from '../lib/cloudinary'
import { ok, created } from '../utils/response'
import { AppError } from '../middleware/error'

// ── Validation schemas ──────────────────────────────────────────────────────

const entitySchema = z.enum([
  'provider', 'tour', 'destination', 'user',
  'accommodation', 'vehicle', 'gallery',
])

export const uploadUrlSchema = z.object({
  url:    z.string().url('Invalid URL'),
  entity: entitySchema,
  tags:   z.array(z.string()).optional(),
})

export const signedUploadSchema = z.object({
  entity: entitySchema,
  tags:   z.array(z.string()).optional(),
})

export const deleteSchema = z.object({
  publicId: z.string().min(1, 'publicId is required'),
})

// ── Upload single file ──────────────────────────────────────────────────────

export async function uploadSingleImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError('No file provided.', 400)

    const entity = req.body.entity ?? req.query.entity
    if (!entity) throw new AppError('Entity type is required (e.g. tour, provider, user).', 400)

    const folder = resolveFolder(entity)
    const tags = req.body.tags ? String(req.body.tags).split(',').map(t => t.trim()) : undefined

    const asset = await uploadImage(req.file.buffer, folder, { tags })
    created(res, asset, 'Image uploaded successfully.')
  } catch (err) {
    next(err)
  }
}

// ── Upload multiple files ───────────────────────────────────────────────────

export async function uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[] | undefined
    if (!files || files.length === 0) throw new AppError('No files provided.', 400)

    const entity = req.body.entity ?? req.query.entity
    if (!entity) throw new AppError('Entity type is required.', 400)

    const folder = resolveFolder(entity)
    const tags = req.body.tags ? String(req.body.tags).split(',').map(t => t.trim()) : undefined

    const assets = await uploadImages(files, folder, tags)
    created(res, assets, `${assets.length} image(s) uploaded successfully.`)
  } catch (err) {
    next(err)
  }
}

// ── Upload from URL ─────────────────────────────────────────────────────────

export async function uploadFromUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, entity, tags } = req.body
    const folder = resolveFolder(entity)
    const asset = await uploadImageFromUrl(url, folder, { tags })
    created(res, asset, 'Image uploaded from URL successfully.')
  } catch (err) {
    next(err)
  }
}

// ── Delete image ────────────────────────────────────────────────────────────

export async function deleteImageById(req: Request, res: Response, next: NextFunction) {
  try {
    const { publicId } = req.body
    const success = await deleteImage(publicId)
    if (!success) throw new AppError('Failed to delete image.', 500)
    ok(res, { deleted: publicId }, 'Image deleted successfully.')
  } catch (err) {
    next(err)
  }
}

// ── Get signed upload params (for direct frontend-to-Cloudinary upload) ─────

export async function getSignedUploadParams(req: Request, res: Response, next: NextFunction) {
  try {
    const { entity, tags } = req.body
    const folder = resolveFolder(entity)
    const params = signUploadParams(folder, tags)
    ok(res, params)
  } catch (err) {
    next(err)
  }
}
