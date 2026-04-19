import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as accService from '../services/provider-accommodation.service'
import { ok } from '../utils/response'

// ─── Schemas ──────────────────────────────────────────────────────────────

const accommodationTypes = ['ger_camp', 'hotel', 'lodge', 'guesthouse', 'resort', 'hostel', 'homestay'] as const

export const createAccommodationSchema = z.object({
  name:               z.string().trim().min(2).max(300),
  accommodationType:  z.enum(accommodationTypes),
  destinationId:      z.string().optional(),
  description:        z.string().trim().max(10000).optional(),
  address:            z.string().max(500).optional(),
  city:               z.string().max(200).optional(),
  region:             z.string().max(200).optional(),
  latitude:           z.number().min(-90).max(90).optional(),
  longitude:          z.number().min(-180).max(180).optional(),
  checkInTime:        z.string().max(10).optional(),
  checkOutTime:       z.string().max(10).optional(),
  amenities:          z.array(z.string().max(100)).max(30).optional(),
  cancellationPolicy: z.string().max(5000).optional(),
  starRating:         z.number().int().min(1).max(5).optional(),
  status:             z.enum(['draft', 'active', 'paused']).optional(),
})

export const updateAccommodationSchema = z.object({
  name:               z.string().trim().min(2).max(300).optional(),
  accommodationType:  z.enum(accommodationTypes).optional(),
  destinationId:      z.string().nullable().optional(),
  description:        z.string().trim().max(10000).optional(),
  address:            z.string().max(500).optional(),
  city:               z.string().max(200).optional(),
  region:             z.string().max(200).optional(),
  latitude:           z.number().min(-90).max(90).nullable().optional(),
  longitude:          z.number().min(-180).max(180).nullable().optional(),
  checkInTime:        z.string().max(10).optional(),
  checkOutTime:       z.string().max(10).optional(),
  amenities:          z.array(z.string().max(100)).max(30).optional(),
  cancellationPolicy: z.string().max(5000).optional(),
  starRating:         z.number().int().min(1).max(5).nullable().optional(),
  status:             z.enum(['draft', 'active', 'paused']).optional(),
})

export const addImagesSchema = z.object({
  images: z.array(z.object({
    imageUrl:  z.string().url(),
    publicId:  z.string().optional(),
    altText:   z.string().max(300).optional(),
    width:     z.number().int().optional(),
    height:    z.number().int().optional(),
    format:    z.string().optional(),
    bytes:     z.number().int().optional(),
  })).min(1).max(10),
})

export const createRoomTypeSchema = z.object({
  name:              z.string().trim().min(1).max(200),
  description:       z.string().trim().max(2000).optional(),
  maxGuests:         z.number().int().positive().max(20).optional(),
  bedType:           z.string().max(50).optional(),
  quantity:          z.number().int().positive().max(500).optional(),
  // Phase 2 Option B — preferred pricing inputs.
  baseAmount:        z.number().positive().optional(),
  baseCurrency:      z.enum(['MNT', 'USD']).optional(),
  basePricePerNight: z.number().positive().optional(),
  currency:          z.string().length(3).optional(),
  amenities:         z.array(z.string().max(100)).max(20).optional(),
}).refine(
  (v) => v.baseAmount !== undefined || v.basePricePerNight !== undefined,
  { message: 'Room type requires either baseAmount or basePricePerNight.' },
)

export const updateRoomTypeSchema = z.object({
  name:              z.string().trim().min(1).max(200).optional(),
  description:       z.string().trim().max(2000).optional(),
  maxGuests:         z.number().int().positive().max(20).optional(),
  bedType:           z.string().max(50).optional(),
  quantity:          z.number().int().positive().max(500).optional(),
  baseAmount:        z.number().positive().optional(),
  baseCurrency:      z.enum(['MNT', 'USD']).optional(),
  basePricePerNight: z.number().positive().optional(),
  currency:          z.string().length(3).optional(),
  amenities:         z.array(z.string().max(100)).max(20).optional(),
})

/** Schema for POST /accommodations/:accId/rooms/:roomId/images */
export const addRoomImagesSchema = z.object({
  images: z.array(z.object({
    imageUrl:  z.string().url(),
    publicId:  z.string().optional(),
    altText:   z.string().max(300).optional(),
    width:     z.number().int().optional(),
    height:    z.number().int().optional(),
    format:    z.string().optional(),
    bytes:     z.number().int().optional(),
  })).min(1).max(10),
})

// ─── Handlers ─────────────────────────────────────────────────────────────

export async function listAccommodations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.listProviderAccommodations(req.user!.userId)
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function createAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.createProviderAccommodation(req.user!.userId, req.body)
    return ok(res, result, 'Accommodation created successfully.')
  } catch (err) { next(err) }
}

export async function getAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.getProviderAccommodationDetail(req.user!.userId, String(req.params.accId))
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function updateAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.updateProviderAccommodation(req.user!.userId, String(req.params.accId), req.body)
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function archiveAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.archiveProviderAccommodation(req.user!.userId, String(req.params.accId))
    return ok(res, result, 'Accommodation archived.')
  } catch (err) { next(err) }
}

export async function addImages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.addAccommodationImages(req.user!.userId, String(req.params.accId), req.body.images)
    return ok(res, result, 'Images added.')
  } catch (err) { next(err) }
}

export async function removeImage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.removeAccommodationImage(req.user!.userId, String(req.params.accId), String(req.params.imgId))
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.listRoomTypes(req.user!.userId, String(req.params.accId))
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.createRoomType(req.user!.userId, String(req.params.accId), req.body)
    return ok(res, result, 'Room type created.')
  } catch (err) { next(err) }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.updateRoomType(req.user!.userId, String(req.params.accId), String(req.params.roomId), req.body)
    return ok(res, result)
  } catch (err) { next(err) }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.deleteRoomType(req.user!.userId, String(req.params.accId), String(req.params.roomId))
    return ok(res, result)
  } catch (err) { next(err) }
}

// ─── Room type image handlers ─────────────────────────────────────────────

export async function addRoomImages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.addRoomTypeImages(
      req.user!.userId,
      String(req.params.accId),
      String(req.params.roomId),
      req.body.images,
    )
    return ok(res, result, 'Room images added.')
  } catch (err) { next(err) }
}

export async function removeRoomImage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accService.removeRoomTypeImage(
      req.user!.userId,
      String(req.params.accId),
      String(req.params.roomId),
      String(req.params.imgId),
    )
    return ok(res, result)
  } catch (err) { next(err) }
}
