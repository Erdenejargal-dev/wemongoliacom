import { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId:     string
        role:       UserRole
        providerId?: string   // populated by providerMiddleware when applicable
      }
    }
  }
}

export {}
