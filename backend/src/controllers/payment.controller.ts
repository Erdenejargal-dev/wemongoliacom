import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as paymentService from '../services/payment.service'
import { ok, created } from '../utils/response'
import {
  listPaymentProcessors,
  describeBookingPaymentCapability,
} from '../utils/payment-capability'
import { assertSupportedCurrency } from '../utils/currency'

export const refundSchema = z.object({
  reason: z.string().min(1).max(500),
  amount: z.number().positive().optional(),
})

export const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export async function initiatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.initiatePayment(
      req.user!.userId,
      String(req.params.bookingId),
    )
    return created(res, result)
  } catch (err) {
    next(err)
  }
}

export async function confirmPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.confirmPayment(
      req.user!.userId,
      String(req.params.paymentId),
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.getPaymentStatus(
      req.user!.userId,
      String(req.params.paymentId),
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function retryPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.retryPayment(
      req.user!.userId,
      String(req.params.paymentId),
    )
    return created(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.getPayment(
      req.user!.userId,
      String(req.params.paymentId),
      req.user!.role,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function listMyPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as { page?: string; limit?: string }
    const result = await paymentService.listMyPayments(
      req.user!.userId,
      page  ? Number(page)  : 1,
      limit ? Number(limit) : 20,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /payments/capability
 *
 * Phase 3 — explicit, public-ish (auth required) pre-flight endpoint that
 * lets the traveler UI decide what to render for display vs payable
 * currency. Two modes:
 *   - ?bookingCode=WM-...  → describes the SPECIFIC booking
 *   - ?currency=USD        → describes capability for that listing currency
 *
 * Always returns 200 with a serializable capability object — the UI should
 * NEVER learn "payment unavailable" only from a 400 on initiate.
 */
export async function getPaymentCapability(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingCode, currency } = req.query as { bookingCode?: string; currency?: string }
    if (bookingCode) {
      const result = await paymentService.getBookingPaymentCapability(
        req.user!.userId,
        String(bookingCode),
      )
      return ok(res, result)
    }
    const cur = assertSupportedCurrency(currency ?? 'MNT', 'currency')
    return ok(res, {
      bookingCode:    null,
      listingType:    null,
      bookingStatus:  null,
      paymentStatus:  null,
      amount:         null,
      currency:       cur,
      capability:     describeBookingPaymentCapability(cur),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /payments/processors
 *
 * Phase 3 — machine-readable list of configured processors and their
 * supported currencies. Used by the admin visibility page and by UIs that
 * want to explain "coming soon" states honestly.
 */
export async function getPaymentProcessors(_req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, { processors: listPaymentProcessors() })
  } catch (err) {
    next(err)
  }
}

export async function requestRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.requestRefund(
      req.user!.userId,
      String(req.params.paymentId),
      req.body.reason,
      req.body.amount,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
