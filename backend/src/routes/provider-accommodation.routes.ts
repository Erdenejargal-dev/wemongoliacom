.0import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listAccommodations,
  createAccommodation,
  getAccommodation,
  updateAccommodation,
  archiveAccommodation,
  addImages,
  removeImage,
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomImages,
  removeRoomImage,
  createAccommodationSchema,
  updateAccommodationSchema,
  addImagesSchema,
  createRoomTypeSchema,
  updateRoomTypeSchema,
  addRoomImagesSchema,
} from '../controllers/provider-accommodation.controller'

const router = Router()

// Property CRUD
router.get('/',       listAccommodations)
router.post('/',      validate(createAccommodationSchema), createAccommodation)
router.get('/:accId', getAccommodation)
router.put('/:accId', validate(updateAccommodationSchema), updateAccommodation)
router.delete('/:accId', archiveAccommodation)

// Property images (accommodation-level gallery)
router.post('/:accId/images',          validate(addImagesSchema), addImages)
router.delete('/:accId/images/:imgId', removeImage)

// Room types
router.get('/:accId/rooms',            listRooms)
router.post('/:accId/rooms',           validate(createRoomTypeSchema), createRoom)
router.put('/:accId/rooms/:roomId',    validate(updateRoomTypeSchema), updateRoom)
router.delete('/:accId/rooms/:roomId', deleteRoom)

// Room type images (room-level, distinct from property gallery)
router.post('/:accId/rooms/:roomId/images',           validate(addRoomImagesSchema), addRoomImages)
router.delete('/:accId/rooms/:roomId/images/:imgId',  removeRoomImage)

export default router
