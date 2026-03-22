import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from './error'
import { prisma } from '../lib/prisma'

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401)
    }

    const token   = header.slice(7)
    const payload = verifyAccessToken(token)

    // Always attach the *current* role from the DB.
    // This prevents stale JWT role payloads after role changes (e.g. traveler -> provider_owner).
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    })
    if (!user) throw new AppError('User not found.', 401)

    req.user = { userId: user.id, role: user.role }
    next()
  } catch (err) {
    next(err)
  }
}

/** Optional auth — attaches user if token present, continues either way */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const payload = verifyAccessToken(header.slice(7))

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true },
      })
      if (user) req.user = { userId: user.id, role: user.role }
    }
    next()
  } catch {
    next()
  }
}
