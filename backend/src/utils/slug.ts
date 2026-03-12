import { prisma } from '../lib/prisma'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Generates a unique slug by appending a counter suffix if needed */
export async function uniqueSlug(
  base: string,
  checkFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base)
  let counter = 0

  while (await checkFn(slug)) {
    counter++
    slug = `${slugify(base)}-${counter}`
  }

  return slug
}

/** Booking reference: WM-2026-00142 */
export async function generateBookingCode(): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await prisma.booking.count()
  const seq   = String(count + 1).padStart(5, '0')
  return `WM-${year}-${seq}`
}
