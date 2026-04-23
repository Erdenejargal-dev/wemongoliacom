import { createHash, randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { AppError } from '../middleware/error'
import { hashPassword } from '../utils/password'
import * as emailService from './email.service'

function hashResetToken(plain: string): string {
  return createHash('sha256').update(plain, 'utf8').digest('hex')
}

/**
 * Request a password reset. Always completes without revealing whether the email exists.
 * Sends email only when a user is found; email failures are logged, not thrown.
 */
export async function requestPasswordReset(rawEmail: string): Promise<void> {
  const email = rawEmail.toLowerCase().trim()
  if (!email) return

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  })

  if (!user) return

  const plain = randomBytes(48).toString('base64url')
  const tokenHash = hashResetToken(plain)
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000)

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({ where: { userId: user.id } })
    await tx.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })
  })

  const base = env.PUBLIC_APP_URL.replace(/\/$/, '')
  const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(plain)}`

  await emailService.sendPasswordResetEmail(user.email, {
    firstName: user.firstName,
    resetUrl,
    expiresMinutes: env.PASSWORD_RESET_EXPIRES_MINUTES,
  })
}

/**
 * Validates token, sets new password, invalidates all reset tokens for the user.
 */
export async function resetPasswordWithToken(plainToken: string, newPassword: string): Promise<void> {
  const trimmed = plainToken?.trim()
  if (!trimmed || newPassword.length < 8) {
    throw new AppError('Invalid or expired reset link.', 400)
  }

  const tokenHash = hashResetToken(trimmed)
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset link.', 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data:  {
        passwordHash,
        refreshTokenVersion: { increment: 1 },
      },
    })
    await tx.passwordResetToken.deleteMany({ where: { userId: record.userId } })
  })
}
