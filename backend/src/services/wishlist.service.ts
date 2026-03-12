import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
  })
  return items
}

export interface AddWishlistInput {
  userId:      string
  listingType: 'tour' | 'vehicle' | 'accommodation'
  listingId:   string
}

export async function addToWishlist(input: AddWishlistInput) {
  // Prevent duplicates
  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId:      input.userId,
      listingType: input.listingType as any,
      listingId:   input.listingId,
    },
  })
  if (existing) return existing

  return prisma.wishlistItem.create({
    data: {
      userId:      input.userId,
      listingType: input.listingType as any,
      listingId:   input.listingId,
    },
  })
}

export async function removeFromWishlist(id: string, userId: string) {
  const item = await prisma.wishlistItem.findUnique({ where: { id } })
  if (!item)                  throw new AppError('Wishlist item not found.', 404)
  if (item.userId !== userId) throw new AppError('Forbidden.', 403)
  await prisma.wishlistItem.delete({ where: { id } })
}
