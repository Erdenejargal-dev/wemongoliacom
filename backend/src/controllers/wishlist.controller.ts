import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as wishlistService from '../services/wishlist.service'
import { ok, created, noContent } from '../utils/response'

export const addSchema = z.object({
  listingType: z.enum(['tour', 'vehicle', 'accommodation']),
  listingId:   z.string().cuid(),
})

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await wishlistService.getWishlist(req.user!.userId)
    return ok(res, items)
  } catch (err) {
    next(err)
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await wishlistService.addToWishlist({
      userId: req.user!.userId,
      ...req.body,
    })
    return created(res, item)
  } catch (err) {
    next(err)
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    await wishlistService.removeFromWishlist(String(req.params.id), req.user!.userId)
    return noContent(res)
  } catch (err) {
    next(err)
  }
}
