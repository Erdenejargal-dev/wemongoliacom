import multer from 'multer'
import { AppError } from './error'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const storage = multer.memoryStorage()

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF, GIF.`, 400))
  }
}

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file')

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('files', 10)
