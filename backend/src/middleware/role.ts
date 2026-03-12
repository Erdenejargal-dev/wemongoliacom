import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { AppError } from './error'
import { prisma } from '../lib/prisma'

/** Require specific roles to access a route */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions.', 403))
    }
    next()
  }
}

/**
 * Provider middleware — must run after authenticate().
 * Looks up the provider owned by the current user and attaches providerId to req.user.
 */
export function attachProvider(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.user?.userId
  if (!userId) return next(new AppError('Authentication required.', 401))

  prisma.provider
    .findUnique({ where: { ownerUserId: userId }, select: { id: true } })
    .then(provider => {
      if (!provider) return next(new AppError('Provider profile not found. Complete onboarding first.', 403))
      req.user!.providerId = provider.id
      next()
    })
    .catch(next)
}
