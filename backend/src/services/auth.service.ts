import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { AppError } from '../middleware/error'

export interface RegisterInput {
  firstName: string
  lastName:  string
  email:     string
  password:  string
  role?:     'traveler' | 'provider_owner'
}

export interface LoginInput {
  email:    string
  password: string
}

function buildTokens(userId: string, role: string, refreshTokenVersion: number) {
  return {
    accessToken:  signAccessToken({ userId, role }),
    refreshToken: signRefreshToken({ userId, tokenVersion: refreshTokenVersion }),
  }
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new AppError('Email already registered.', 409)

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      firstName:    input.firstName,
      lastName:     input.lastName,
      email:        input.email.toLowerCase().trim(),
      passwordHash,
      role:         input.role ?? 'traveler',
    },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      email:     true,
      role:      true,
      createdAt: true,
    },
  })

  const tokens = buildTokens(user.id, user.role, 0)

  void import('./email.service')
    .then((m) => m.notifyWelcomeAfterRegistration(user.email, user.firstName))
    .catch((err) => console.error('[email] notifyWelcomeAfterRegistration schedule failed:', err))

  return { user, ...tokens }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  })

  if (!user) throw new AppError('Invalid email or password.', 401)

  const valid = await verifyPassword(input.password, user.passwordHash)
  if (!valid) throw new AppError('Invalid email or password.', 401)

  const tokens = buildTokens(user.id, user.role, user.refreshTokenVersion)

  return {
    user: {
      id:        user.id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      avatarUrl: user.avatarUrl,
      /** Exposed to Next.js session for locale + display-currency resolution. */
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
    },
    ...tokens,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh access token using a valid refresh token.
// Returns a new accessToken (and refreshToken for rotation).
// ─────────────────────────────────────────────────────────────────────────────
export async function refresh(input: { refreshToken: string }) {
  let payload: { userId: string; tokenVersion: number }
  try {
    payload = verifyRefreshToken(input.refreshToken) as { userId: string; tokenVersion: number }
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, refreshTokenVersion: true },
  })

  if (!user) throw new AppError('User not found.', 401)
  if (user.refreshTokenVersion !== payload.tokenVersion) {
    throw new AppError('Refresh token has been revoked.', 401)
  }

  const tokens = buildTokens(user.id, user.role, user.refreshTokenVersion)
  return tokens
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      email:     true,
      phone:     true,
      country:   true,
      avatarUrl: true,
      bio:       true,
      role:      true,
      isVerified: true,
      createdAt: true,
      provider: {
        select: {
          id:           true,
          name:         true,
          slug:         true,
          providerTypes: true,
          status:       true,
        },
      },
    },
  })

  if (!user) throw new AppError('User not found.', 404)
  return user
}
