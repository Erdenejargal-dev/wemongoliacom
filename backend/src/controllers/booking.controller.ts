import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as bookingService from '../services/booking.service'
import { ok, created } from '../utils/response'

// ─── Validation schemas ────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  listingType:     z.enum(['tour', 'vehicle', 'accommodation']),
  listingId:       z.string().cuid(),
  // Tour
  tourDepartureId: z.string().cuid().optional(),
  // Vehicle
  startDate:       z.string().optional(),
  endDate:         z.string().optional(),
  // Accommodation
  roomTypeId:      z.string().cuid().optional(),
  checkIn:         z.string().optional(),
  checkOut:        z.string().optional(),
  // Shared
  guests:          z.coerce.number().int().min(1),
  adults:          z.coerce.number().int().min(1).optional(),
  children:        z.coerce.number().int().min(0).optional(),
  specialRequests: z.string().max(500).optional(),
  travelerFullName: z.string().max(200).optional(),
  travelerEmail:    z.string().email().optional(),
  travelerPhone:    z.string().max(30).optional(),
  travelerCountry:  z.string().max(100).optional(),
})

export const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
})

export const listQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user!.userId,
      ...req.body,
    })
    return created(res, booking)
  } catch (err) {
    next(err)
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.getBookingByCode(
      String(req.params.bookingCode),
      req.user!.userId,
    )
    return ok(res, booking)
  } catch (err) {
    next(err)
  }
}

export async function listMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as { status?: string }
    const bookings = await bookingService.listMyBookings(req.user!.userId, status)
    return ok(res, bookings)
  } catch (err) {
    next(err)
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.cancelBooking(
      String(req.params.bookingCode),
      req.user!.userId,
      req.body?.reason,
    )
    return ok(res, booking)
  } catch (err) {
    next(err)
  }
}
