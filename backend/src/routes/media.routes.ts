import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { uploadSingle, uploadMultiple } from '../middleware/upload'
import { validate } from '../middleware/validate'
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadFromUrl,
  deleteImageById,
  getSignedUploadParams,
  uploadUrlSchema,
  signedUploadSchema,
  deleteSchema,
} from '../controllers/media.controller'

const router = Router()

// All media routes require authentication
router.use(authenticate)

// Server-side uploads (file goes through our backend → Cloudinary)
router.post('/upload',       uploadSingle,   uploadSingleImage)
router.post('/upload/batch', uploadMultiple,  uploadMultipleImages)

// Upload from external URL
router.post('/upload/url', validate(uploadUrlSchema), uploadFromUrl)

// Delete
router.post('/delete', validate(deleteSchema), deleteImageById)

// Get signed params for direct frontend → Cloudinary upload
router.post('/sign', validate(signedUploadSchema), getSignedUploadParams)

export default router
