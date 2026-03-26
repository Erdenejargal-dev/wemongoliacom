import { Router } from 'express'
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
  createAccommodationSchema,
  updateAccommodationSchema,
  addImagesSchema,
  createRoomTypeSchema,
  updateRoomTypeSchema,
} from '../controllers/provider-accommodation.controller'

const router = Router()

// Property CRUD
router.get('/',       listAccommodations)
router.post('/',      validate(createAccommodationSchema), createAccommodation)
router.get('/:accId', getAccommodation)
router.put('/:accId', validate(updateAccommodationSchema), updateAccommodation)
router.delete('/:accId', archiveAccommodation)

// Property images
router.post('/:accId/images',          validate(addImagesSchema), addImages)
router.delete('/:accId/images/:imgId', removeImage)

// Room types
router.get('/:accId/rooms',            listRooms)
router.post('/:accId/rooms',           validate(createRoomTypeSchema), createRoom)
router.put('/:accId/rooms/:roomId',    validate(updateRoomTypeSchema), updateRoom)
router.delete('/:accId/rooms/:roomId', deleteRoom)

export default router
