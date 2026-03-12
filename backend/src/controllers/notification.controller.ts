import { Request, Response, NextFunction } from 'express'
import * as notificationService from '../services/notification.service'
import { ok, noContent } from '../utils/response'

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationService.listNotifications(req.user!.userId)
    return ok(res, notifications)
  } catch (err) {
    next(err)
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notif = await notificationService.markAsRead(
      String(req.params.id),
      req.user!.userId,
    )
    return ok(res, notif)
  } catch (err) {
    next(err)
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.user!.userId)
    return noContent(res)
  } catch (err) {
    next(err)
  }
}
