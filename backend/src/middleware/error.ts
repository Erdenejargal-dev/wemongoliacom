import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error:   'Validation error',
      details: err.flatten().fieldErrors,
    })
    return
  }

  // Known app error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'A record with that value already exists.' })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found.' })
      return
    }
  }

  // JWT errors
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Invalid token.' })
    return
  }
  if (err instanceof Error && err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expired.' })
    return
  }

  // Unexpected error
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err instanceof Error ? err.message : String(err))

  console.error('[Unhandled error]', err)
  res.status(500).json({ success: false, error: message })
}
