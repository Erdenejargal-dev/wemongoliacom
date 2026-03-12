import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { hashPassword, verifyPassword } from '../utils/password'

// ─────────────────────────────────────────────────────────────────────────────
// Get own profile
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:          true,
      firstName:   true,
      lastName:    true,
      email:       true,
      phone:       true,
      avatarUrl:   true,
      country:   true,
      role:      true,
      createdAt:   true,
      _count: {
        select: {
          bookings:      true,
          reviews:       true,
          wishlistItems: true,
        },
      },
    },
  })
  if (!user) throw new AppError('User not found.', 404)
  return user
}

// ─────────────────────────────────────────────────────────────────────────────
// Update own profile
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  firstName?: string
  lastName?:  string
  phone?:     string
  avatarUrl?: string
  country?:   string
}

export async function updateMyProfile(userId: string, data: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      phone:     true,
      avatarUrl: true,
      country:   true,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Change password
// ─────────────────────────────────────────────────────────────────────────────

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

  const valid = await verifyPassword(currentPassword, user.passwordHash)
  if (!valid) throw new AppError('Current password is incorrect.', 400)

  if (newPassword.length < 8)
    throw new AppError('New password must be at least 8 characters.', 400)

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

// ─────────────────────────────────────────────────────────────────────────────
// Change email
// ─────────────────────────────────────────────────────────────────────────────

export async function changeEmail(userId: string, password: string, newEmail: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) throw new AppError('Password is incorrect.', 400)

  // Check if new email is already taken
  const existing = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existing && existing.id !== userId) throw new AppError('Email is already in use.', 409)

  return prisma.user.update({
    where: { id: userId },
    data:  { email: newEmail },
    select: { id: true, email: true },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete own account (soft: deactivate)
// ─────────────────────────────────────────────────────────────────────────────

export async function deactivateAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) throw new AppError('Password is incorrect.', 400)

  // Soft-delete: anonymise the account (no isActive flag in schema)
  await prisma.user.update({
    where: { id: userId },
    data:  {
      email:        `deleted_${userId}@deleted.invalid`,
      passwordHash: '',
      firstName:    'Deleted',
      lastName:     'User',
    },
  })
}
