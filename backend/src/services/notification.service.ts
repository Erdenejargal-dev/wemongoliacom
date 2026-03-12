import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export async function listNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })
  return notifications
}

export async function markAsRead(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } })
  if (!notif)                  throw new AppError('Notification not found.', 404)
  if (notif.userId !== userId) throw new AppError('Forbidden.', 403)
  return prisma.notification.update({
    where: { id },
    data:  { isRead: true, readAt: new Date() },
  })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true, readAt: new Date() },
  })
}

/**
 * Create a notification for a user (called internally by other services).
 */
export async function createNotification(data: {
  userId:     string
  type:       string
  title:      string
  body:       string
  actionUrl?: string
}) {
  return prisma.notification.create({ data })
}
