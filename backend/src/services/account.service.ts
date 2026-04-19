import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { hashPassword, verifyPassword } from '../utils/password'
import { uniqueSlug } from '../utils/slug'
import { ProviderType } from '@prisma/client'

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
      country:     true,
      role:        true,
      bio:         true,
      preferredLanguage: true,
      preferredCurrency: true,
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
  bio?:       string
  // Phase 6 — preference fields. Accept both canonical and short names.
  preferredLanguage?: 'mn' | 'en'
  preferredCurrency?: 'MNT' | 'USD'
  language?: 'mn' | 'en'
  currency?: 'MNT' | 'USD'
}

export async function updateMyProfile(userId: string, data: UpdateProfileInput) {
  // Normalize short aliases → canonical columns on the User model.
  const { language, currency, ...rest } = data
  const patch: Record<string, unknown> = { ...rest }
  if (language && !patch.preferredLanguage) patch.preferredLanguage = language
  if (currency && !patch.preferredCurrency) patch.preferredCurrency = currency

  return prisma.user.update({
    where: { id: userId },
    data:  patch,
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      phone:     true,
      avatarUrl: true,
      country:   true,
      bio:       true,
      preferredLanguage: true,
      preferredCurrency: true,
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

// ─────────────────────────────────────────────────────────────────────────────
// Register a provider profile (business)
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterProviderInput {
  businessName:  string
  businessTypes: ProviderType[]
  description?:  string
  contactEmail?: string
  contactPhone?: string
  address?:      string
  city?:         string
  country?:      string
  websiteUrl?:   string
}

export async function registerProvider(userId: string, input: RegisterProviderInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

  const existing = await prisma.provider.findUnique({ where: { ownerUserId: userId } })
  if (existing) throw new AppError('Provider profile already exists for this user.', 409)

  const slug = await uniqueSlug(input.businessName, async (s) => {
    const exists = await prisma.provider.findUnique({ where: { slug: s } })
    return !!exists
  })

  const provider = await prisma.$transaction(async (tx) => {
    // Ensure role is provider_owner (or admin) once a business is created
    if (user.role === 'traveler') {
      await tx.user.update({ where: { id: userId }, data: { role: 'provider_owner' } })
    }

    return tx.provider.create({
      data: {
        ownerUserId:   userId,
        name:          input.businessName,
        slug,
        description:   input.description,
        email:         input.contactEmail,
        phone:         input.contactPhone,
        website:       input.websiteUrl,
        address:       input.address,
        city:          input.city,
        country:       input.country ?? 'Mongolia',
        languages:     [],
        providerTypes: input.businessTypes,
        status:        'draft',
      },
    })
  })

  return provider
}
