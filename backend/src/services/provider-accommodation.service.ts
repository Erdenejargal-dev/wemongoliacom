import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { uniqueSlug } from '../utils/slug'
import { getListingLimit, type PlanType } from '../config/limits'
import { resolveBasePricing } from '../utils/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// Input types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAccommodationInput {
  name:               string
  accommodationType:  string
  destinationId?:     string
  description?:       string
  address?:           string
  city?:              string
  region?:            string
  latitude?:          number
  longitude?:         number
  checkInTime?:       string
  checkOutTime?:      string
  amenities?:         string[]
  cancellationPolicy?: string
  starRating?:        number
  status?:            'draft' | 'active' | 'paused'
}

export interface UpdateAccommodationInput {
  name?:               string
  accommodationType?:  string
  destinationId?:      string | null
  description?:        string
  address?:            string
  city?:               string
  region?:             string
  latitude?:           number | null
  longitude?:          number | null
  checkInTime?:        string
  checkOutTime?:       string
  amenities?:          string[]
  cancellationPolicy?: string
  starRating?:         number | null
  status?:             'draft' | 'active' | 'paused'
}

export interface CreateRoomTypeInput {
  name:               string
  description?:       string
  maxGuests?:         number
  bedType?:           string
  quantity?:          number
  // Phase 2 Option B — prefer baseAmount + baseCurrency; legacy
  // basePricePerNight + currency still accepted during transition.
  baseAmount?:        number
  baseCurrency?:      string
  basePricePerNight?: number
  currency?:          string
  amenities?:         string[]
}

export interface UpdateRoomTypeInput {
  name?:              string
  description?:       string
  maxGuests?:         number
  bedType?:           string
  quantity?:          number
  baseAmount?:        number
  baseCurrency?:      string
  basePricePerNight?: number
  currency?:          string
  amenities?:         string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Select shapes
// ─────────────────────────────────────────────────────────────────────────────

const accommodationListSelect = {
  id:                true,
  slug:              true,
  name:              true,
  description:       true,
  accommodationType: true,
  starRating:        true,
  ratingAverage:     true,
  reviewsCount:      true,
  status:            true,
  createdAt:         true,
  updatedAt:         true,
  // Location — needed by the provider list page to build exact-coordinate
  // Google Maps links, and later by the "nearby accommodations" query
  address:           true,
  city:              true,
  region:            true,
  latitude:          true,
  longitude:         true,
  images:            { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { imageUrl: true } },
  destination:       { select: { id: true, name: true, slug: true } },
  _count:            { select: { roomTypes: true, images: true } },
} as const

const accommodationDetailSelect = {
  id:                 true,
  providerId:         true,
  slug:               true,
  name:               true,
  description:        true,
  accommodationType:  true,
  address:            true,
  city:               true,
  region:             true,
  latitude:           true,
  longitude:          true,
  checkInTime:        true,
  checkOutTime:       true,
  amenities:          true,
  cancellationPolicy: true,
  starRating:         true,
  ratingAverage:      true,
  reviewsCount:       true,
  status:             true,
  createdAt:          true,
  updatedAt:          true,
  destination:        { select: { id: true, name: true, slug: true } },
  images:             { orderBy: { sortOrder: 'asc' as const }, select: { id: true, imageUrl: true, publicId: true, altText: true, sortOrder: true } },
  roomTypes: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true, name: true, description: true, maxGuests: true,
      bedType: true, quantity: true, basePricePerNight: true,
      currency: true,
      baseAmount: true, baseCurrency: true,
      normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
      amenities: true, createdAt: true, updatedAt: true,
      // Room-level images — distinct from property gallery (AccommodationImage)
      images: {
        orderBy: { sortOrder: 'asc' as const },
        select: { id: true, imageUrl: true, publicId: true, sortOrder: true },
      },
    },
  },
  _count: { select: { roomTypes: true, images: true } },
} as const

const roomTypeSelect = {
  id: true, accommodationId: true, name: true, description: true,
  maxGuests: true, bedType: true, quantity: true,
  basePricePerNight: true, currency: true,
  baseAmount: true, baseCurrency: true,
  normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
  amenities: true,
  createdAt: true, updatedAt: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { id: true, imageUrl: true, publicId: true, sortOrder: true },
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getProvider(ownerUserId: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true, plan: true } })
  if (!provider) throw new AppError('Provider not found.', 404)
  return provider
}

async function getOwnedAccommodation(accId: string, ownerUserId: string) {
  const provider = await getProvider(ownerUserId)
  const acc = await prisma.accommodation.findUnique({
    where: { id: accId },
    select: { id: true, providerId: true, slug: true, name: true, description: true, accommodationType: true, checkInTime: true, checkOutTime: true, status: true },
  })
  if (!acc) throw new AppError('Accommodation not found.', 404)
  if (acc.providerId !== provider.id) throw new AppError('Forbidden.', 403)
  return acc
}

// ─────────────────────────────────────────────────────────────────────────────
// Accommodation CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function listProviderAccommodations(ownerUserId: string) {
  const provider = await getProvider(ownerUserId)

  const accommodations = await prisma.accommodation.findMany({
    where: { providerId: provider.id },
    select: accommodationListSelect,
    orderBy: { createdAt: 'desc' },
  })

  return { data: accommodations }
}

export async function createProviderAccommodation(ownerUserId: string, input: CreateAccommodationInput) {
  const provider = await getProvider(ownerUserId)

  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } })
    if (!dest) throw new AppError('Destination not found.', 400)
  }

  const slug = await uniqueSlug(input.name, async (s) => {
    const exists = await prisma.accommodation.findUnique({ where: { slug: s } })
    return !!exists
  })
  if (!slug) throw new AppError('Name must contain at least one letter or number.', 400)

  const status = input.status ?? 'draft'
  if (status === 'active') {
    validateReadiness({
      name: input.name,
      description: input.description || null,
      accommodationType: input.accommodationType,
      checkInTime: input.checkInTime || null,
      checkOutTime: input.checkOutTime || null,
      roomTypeCount: 0,
      hasRoomWithPrice: false,
      imageCount: 0,
    })
  }

  // ── Plan limit check + create in one transaction (prevents race conditions) ─
  const plan  = (provider.plan as PlanType) ?? 'FREE'
  const limit = getListingLimit(plan, 'accommodations')

  const acc = await prisma.$transaction(async (tx) => {
    if (limit !== Infinity) {
      const currentCount = await tx.accommodation.count({
        where: { providerId: provider.id, status: { not: 'archived' } },
      })
      if (currentCount >= limit) {
        throw new AppError(
          `You have reached the maximum of ${limit} accommodations on the ${plan} plan. ` +
          `Archive an existing property or upgrade your plan to add more.`,
          403,
        )
      }
    }

    return tx.accommodation.create({
      data: {
        providerId:         provider.id,
        slug,
        name:               input.name,
        description:        input.description || null,
        accommodationType:  input.accommodationType as any,
        destinationId:      input.destinationId || null,
        address:            input.address || null,
        city:               input.city || null,
        region:             input.region || null,
        latitude:           input.latitude ?? null,
        longitude:          input.longitude ?? null,
        checkInTime:        input.checkInTime || null,
        checkOutTime:       input.checkOutTime || null,
        amenities:          input.amenities ?? [],
        cancellationPolicy: input.cancellationPolicy || null,
        starRating:         input.starRating ?? null,
        status,
      },
      select: accommodationListSelect,
    })
  })

  return acc
}

export async function getProviderAccommodationDetail(ownerUserId: string, accId: string) {
  const provider = await getProvider(ownerUserId)

  const acc = await prisma.accommodation.findUnique({
    where: { id: accId },
    select: accommodationDetailSelect,
  })
  if (!acc) throw new AppError('Accommodation not found.', 404)
  if (acc.providerId !== provider.id) throw new AppError('Forbidden.', 403)

  const hasRoomWithPrice = acc.roomTypes.some(rt => rt.basePricePerNight > 0 && rt.maxGuests >= 1)

  const readiness = checkReadiness({
    name: acc.name,
    description: acc.description,
    accommodationType: acc.accommodationType,
    checkInTime: acc.checkInTime,
    checkOutTime: acc.checkOutTime,
    roomTypeCount: acc._count.roomTypes,
    hasRoomWithPrice,
    imageCount: acc._count.images,
  })

  return { ...acc, readiness }
}

export async function updateProviderAccommodation(ownerUserId: string, accId: string, input: UpdateAccommodationInput) {
  const acc = await getOwnedAccommodation(accId, ownerUserId)

  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } })
    if (!dest) throw new AppError('Destination not found.', 400)
  }

  let slug = acc.slug
  if (input.name && input.name !== acc.name) {
    slug = await uniqueSlug(input.name, async (s) => {
      const existing = await prisma.accommodation.findUnique({ where: { slug: s } })
      return !!existing && existing.id !== accId
    })
    if (!slug) throw new AppError('Name must contain at least one letter or number.', 400)
  }

  const targetStatus = input.status ?? acc.status
  if (targetStatus === 'active') {
    const [roomTypes, imageCount] = await Promise.all([
      prisma.roomType.findMany({ where: { accommodationId: accId }, select: { basePricePerNight: true, maxGuests: true } }),
      prisma.accommodationImage.count({ where: { accommodationId: accId } }),
    ])
    validateReadiness({
      name: input.name ?? acc.name,
      description: input.description !== undefined ? (input.description || null) : acc.description,
      accommodationType: input.accommodationType ?? acc.accommodationType,
      checkInTime: input.checkInTime !== undefined ? (input.checkInTime || null) : acc.checkInTime,
      checkOutTime: input.checkOutTime !== undefined ? (input.checkOutTime || null) : acc.checkOutTime,
      roomTypeCount: roomTypes.length,
      hasRoomWithPrice: roomTypes.some(rt => rt.basePricePerNight > 0 && rt.maxGuests >= 1),
      imageCount,
    })
  }

  return prisma.accommodation.update({
    where: { id: accId },
    data: {
      slug,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.accommodationType !== undefined && { accommodationType: input.accommodationType as any }),
      ...(input.destinationId !== undefined && { destinationId: input.destinationId || null }),
      ...(input.address !== undefined && { address: input.address || null }),
      ...(input.city !== undefined && { city: input.city || null }),
      ...(input.region !== undefined && { region: input.region || null }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
      ...(input.checkInTime !== undefined && { checkInTime: input.checkInTime || null }),
      ...(input.checkOutTime !== undefined && { checkOutTime: input.checkOutTime || null }),
      ...(input.amenities !== undefined && { amenities: input.amenities }),
      ...(input.cancellationPolicy !== undefined && { cancellationPolicy: input.cancellationPolicy || null }),
      ...(input.starRating !== undefined && { starRating: input.starRating }),
      ...(input.status !== undefined && { status: input.status }),
    },
    select: accommodationDetailSelect,
  })
}

export async function archiveProviderAccommodation(ownerUserId: string, accId: string) {
  await getOwnedAccommodation(accId, ownerUserId)
  return prisma.accommodation.update({
    where: { id: accId },
    data: { status: 'archived' },
    select: accommodationListSelect,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Accommodation images
// ─────────────────────────────────────────────────────────────────────────────

export async function addAccommodationImages(
  ownerUserId: string,
  accId: string,
  images: { imageUrl: string; publicId?: string; altText?: string; width?: number; height?: number; format?: string; bytes?: number }[],
) {
  await getOwnedAccommodation(accId, ownerUserId)

  const maxSort = await prisma.accommodationImage.findFirst({
    where: { accommodationId: accId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  let nextSort = (maxSort?.sortOrder ?? -1) + 1

  const created = await prisma.$transaction(
    images.map(img =>
      prisma.accommodationImage.create({
        data: {
          accommodationId: accId,
          imageUrl:  img.imageUrl,
          publicId:  img.publicId ?? null,
          altText:   img.altText ?? null,
          width:     img.width ?? null,
          height:    img.height ?? null,
          format:    img.format ?? null,
          bytes:     img.bytes ?? null,
          sortOrder: nextSort++,
        },
      }),
    ),
  )

  return created
}

export async function removeAccommodationImage(ownerUserId: string, accId: string, imageId: string) {
  await getOwnedAccommodation(accId, ownerUserId)

  const image = await prisma.accommodationImage.findUnique({ where: { id: imageId } })
  if (!image || image.accommodationId !== accId) throw new AppError('Image not found.', 404)

  await prisma.accommodationImage.delete({ where: { id: imageId } })
  return { deleted: true, publicId: image.publicId }
}

// ─────────────────────────────────────────────────────────────────────────────
// Room type CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function listRoomTypes(ownerUserId: string, accId: string) {
  await getOwnedAccommodation(accId, ownerUserId)

  const roomTypes = await prisma.roomType.findMany({
    where: { accommodationId: accId },
    select: {
      ...roomTypeSelect,
      _count: { select: { bookings: { where: { bookingStatus: { in: ['pending', 'confirmed'] } } } } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return roomTypes.map(({ _count, ...rt }) => ({
    ...rt,
    activeBookings: _count.bookings,
  }))
}

export async function createRoomType(ownerUserId: string, accId: string, input: CreateRoomTypeInput) {
  await getOwnedAccommodation(accId, ownerUserId)

  // Phase 2 Option B — normalize pricing inputs (dual-write legacy + new + MNT).
  const pricing = await resolveBasePricing({
    baseAmount:     input.baseAmount,
    baseCurrency:   input.baseCurrency,
    legacyAmount:   input.basePricePerNight,
    legacyCurrency: input.currency,
  })

  return prisma.roomType.create({
    data: {
      accommodationId:     accId,
      name:                input.name,
      description:         input.description || null,
      maxGuests:           input.maxGuests ?? 2,
      bedType:             input.bedType || null,
      quantity:            input.quantity ?? 1,
      basePricePerNight:   pricing.legacyAmount,
      currency:            pricing.legacyCurrency,
      baseAmount:          pricing.baseAmount,
      baseCurrency:        pricing.baseCurrency,
      normalizedAmountMnt: pricing.normalizedAmountMnt,
      normalizedFxRate:    pricing.normalizedFxRate,
      normalizedFxRateAt:  pricing.normalizedFxRateAt,
      amenities:           input.amenities ?? [],
    },
    select: roomTypeSelect,
  })
}

export async function updateRoomType(ownerUserId: string, accId: string, roomId: string, input: UpdateRoomTypeInput) {
  await getOwnedAccommodation(accId, ownerUserId)

  const rt = await prisma.roomType.findUnique({ where: { id: roomId } })
  if (!rt || rt.accommodationId !== accId) throw new AppError('Room type not found.', 404)

  // Phase 2 Option B — re-resolve pricing only when any price field touched.
  const pricingTouched =
    input.baseAmount        !== undefined ||
    input.baseCurrency      !== undefined ||
    input.basePricePerNight !== undefined ||
    input.currency          !== undefined

  const resolvedPricing = pricingTouched
    ? await resolveBasePricing({
        baseAmount:     input.baseAmount        ?? rt.baseAmount        ?? rt.basePricePerNight,
        baseCurrency:   input.baseCurrency      ?? rt.baseCurrency      ?? rt.currency,
        legacyAmount:   input.basePricePerNight,
        legacyCurrency: input.currency,
      })
    : null

  return prisma.roomType.update({
    where: { id: roomId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.maxGuests !== undefined && { maxGuests: input.maxGuests }),
      ...(input.bedType !== undefined && { bedType: input.bedType || null }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(resolvedPricing && {
        basePricePerNight:   resolvedPricing.legacyAmount,
        currency:            resolvedPricing.legacyCurrency,
        baseAmount:          resolvedPricing.baseAmount,
        baseCurrency:        resolvedPricing.baseCurrency,
        normalizedAmountMnt: resolvedPricing.normalizedAmountMnt,
        normalizedFxRate:    resolvedPricing.normalizedFxRate,
        normalizedFxRateAt:  resolvedPricing.normalizedFxRateAt,
      }),
      ...(input.amenities !== undefined && { amenities: input.amenities }),
    },
    select: roomTypeSelect,
  })
}

export async function deleteRoomType(ownerUserId: string, accId: string, roomId: string) {
  await getOwnedAccommodation(accId, ownerUserId)

  const rt = await prisma.roomType.findUnique({
    where: { id: roomId },
    include: { bookings: { where: { bookingStatus: { in: ['pending', 'confirmed'] } }, select: { id: true }, take: 1 } },
  })
  if (!rt || rt.accommodationId !== accId) throw new AppError('Room type not found.', 404)
  if (rt.bookings.length > 0) throw new AppError('Cannot delete a room type with active bookings.', 400)

  await prisma.roomType.delete({ where: { id: roomId } })
  return { deleted: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Room type images
// Separate from accommodation-level images (AccommodationImage).
// These are room-specific photos — ger interior, suite layout, etc.
// ─────────────────────────────────────────────────────────────────────────────

export async function addRoomTypeImages(
  ownerUserId: string,
  accId: string,
  roomId: string,
  images: { imageUrl: string; publicId?: string; altText?: string; width?: number; height?: number; format?: string; bytes?: number }[],
) {
  // Verify provider owns accommodation
  await getOwnedAccommodation(accId, ownerUserId)

  // Verify room belongs to accommodation
  const room = await prisma.roomType.findUnique({ where: { id: roomId } })
  if (!room || room.accommodationId !== accId) throw new AppError('Room type not found.', 404)

  const maxSort = await prisma.roomTypeImage.findFirst({
    where: { roomTypeId: roomId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  let nextSort = (maxSort?.sortOrder ?? -1) + 1

  const created = await prisma.$transaction(
    images.map(img =>
      prisma.roomTypeImage.create({
        data: {
          roomTypeId: roomId,
          imageUrl:   img.imageUrl,
          publicId:   img.publicId ?? null,
          altText:    img.altText ?? null,
          width:      img.width ?? null,
          height:     img.height ?? null,
          format:     img.format ?? null,
          bytes:      img.bytes ?? null,
          sortOrder:  nextSort++,
        },
      }),
    ),
  )

  return created
}

export async function removeRoomTypeImage(
  ownerUserId: string,
  accId: string,
  roomId: string,
  imgId: string,
) {
  // Verify provider owns accommodation
  await getOwnedAccommodation(accId, ownerUserId)

  // Verify room belongs to accommodation
  const room = await prisma.roomType.findUnique({ where: { id: roomId } })
  if (!room || room.accommodationId !== accId) throw new AppError('Room type not found.', 404)

  const image = await prisma.roomTypeImage.findUnique({ where: { id: imgId } })
  if (!image || image.roomTypeId !== roomId) throw new AppError('Image not found.', 404)

  await prisma.roomTypeImage.delete({ where: { id: imgId } })
  return { deleted: true, publicId: image.publicId }
}

// ─────────────────────────────────────────────────────────────────────────────
// Publish readiness
// ─────────────────────────────────────────────────────────────────────────────

interface ReadinessInput {
  name:               string
  description:        string | null
  accommodationType:  string
  checkInTime:        string | null
  checkOutTime:       string | null
  roomTypeCount:      number
  hasRoomWithPrice:   boolean
  imageCount:         number
}

export interface AccommodationReadinessResult {
  ready: boolean
  missing: string[]
}

export function checkReadiness(input: ReadinessInput): AccommodationReadinessResult {
  const missing: string[] = []

  if (!input.name || input.name.trim().length < 2) missing.push('Name must be at least 2 characters')
  if (!input.description || input.description.trim().length < 50) missing.push('Description must be at least 50 characters')
  if (!input.accommodationType) missing.push('Accommodation type must be set')
  if (!input.checkInTime) missing.push('Check-in time must be set')
  if (!input.checkOutTime) missing.push('Check-out time must be set')
  if (input.roomTypeCount < 1) missing.push('At least 1 room type is required')
  if (!input.hasRoomWithPrice) missing.push('At least 1 room type with price > 0 and maxGuests >= 1 is required')
  if (input.imageCount < 1) missing.push('At least 1 image is required')

  return { ready: missing.length === 0, missing }
}

function validateReadiness(input: ReadinessInput) {
  const result = checkReadiness(input)
  if (!result.ready) {
    throw new AppError(`Accommodation is not ready to publish: ${result.missing.join('; ')}`, 400)
  }
}
