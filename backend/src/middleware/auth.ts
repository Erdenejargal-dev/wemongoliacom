import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from './error'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401)
    }

    const token   = header.slice(7)
    const payload = verifyAccessToken(token)

    req.user = { userId: payload.userId, role: payload.role as any }
    next()
  } catch (err) {
    next(err)
  }
}

/** Optional auth — attaches user if token present, continues either way */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const payload = verifyAccessToken(header.slice(7))
      req.user = { userId: payload.userId, role: payload.role as any }
    }
    next()
  } catch {
    next()
  }
}
