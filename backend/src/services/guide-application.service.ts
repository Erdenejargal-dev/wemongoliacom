import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { GuideSpecialty } from '@prisma/client'

export interface GuideApplicationData {
  name:            string
  bio:             string
  about:           string
  location:        string
  specialties:     GuideSpecialty[]
  languages:       string[]
  yearsExperience: number
  dailyRate?:      number
  dailyCurrency?:  string
  contactEmail:    string
  contactPhone?:   string
  idPhotoUrl:      string
  photoUrl?:       string
}

export async function submitApplication(userId: string, data: GuideApplicationData) {
  const existing = await prisma.guideApplication.findUnique({ where: { userId } })
  if (existing) {
    if (existing.status === 'pending') {
      throw new AppError('You already have a pending application.', 409)
    }
    if (existing.status === 'approved') {
      throw new AppError('Your application is already approved.', 409)
    }
    // Rejected — allow resubmit by updating
    return prisma.guideApplication.update({
      where: { userId },
      data: { ...data, status: 'pending', rejectionReason: null, reviewedAt: null },
    })
  }

  return prisma.guideApplication.create({
    data: { userId, ...data },
  })
}

export async function getMyApplication(userId: string) {
  return prisma.guideApplication.findUnique({ where: { userId } })
}

export async function listApplications(params: { status?: string; page?: number; limit?: number }) {
  const page  = Math.max(1, params.page  ?? 1)
  const limit = Math.min(50, params.limit ?? 20)
  const skip  = (page - 1) * limit

  const where = params.status ? { status: params.status as 'pending' | 'approved' | 'rejected' } : {}

  const [applications, total] = await Promise.all([
    prisma.guideApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.guideApplication.count({ where }),
  ])

  return { applications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getApplicationById(id: string) {
  const app = await prisma.guideApplication.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  })
  if (!app) throw new AppError('Application not found', 404)
  return app
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let n = 1
  while (await prisma.guide.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`
  }
  return slug
}

export async function approveApplication(id: string) {
  const app = await getApplicationById(id)
  if (app.status !== 'pending') throw new AppError('Only pending applications can be approved.', 400)

  const slug = await uniqueSlug(slugify(app.name))

  await prisma.$transaction(async tx => {
    // Create Guide record
    const guide = await tx.guide.create({
      data: {
        slug,
        name:            app.name,
        bio:             app.bio,
        about:           app.about,
        photo:           app.photoUrl ?? '',
        coverImage:      '',
        location:        app.location,
        specialties:     app.specialties,
        languages:       app.languages,
        yearsExperience: app.yearsExperience,
        dailyRate:       app.dailyRate ?? null,
        dailyCurrency:   app.dailyCurrency ?? 'USD',
        contactEmail:    app.contactEmail,
        contactPhone:    app.contactPhone ?? null,
        verified:        true,
        status:          'active',
        ownerUserId:     app.userId,
      },
    })

    // Elevate user role to guide_owner
    await tx.user.update({
      where: { id: app.userId },
      data:  { role: 'guide_owner' },
    })

    // Mark application approved
    await tx.guideApplication.update({
      where: { id },
      data:  { status: 'approved', reviewedAt: new Date() },
    })

    return guide
  })
}

export async function rejectApplication(id: string, reason: string) {
  const app = await getApplicationById(id)
  if (app.status !== 'pending') throw new AppError('Only pending applications can be rejected.', 400)

  return prisma.guideApplication.update({
    where: { id },
    data:  { status: 'rejected', rejectionReason: reason, reviewedAt: new Date() },
  })
}
