import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as conversationService from '../services/conversation.service'
import { ok, created } from '../utils/response'

// ─── Schemas ──────────────────────────────────────────────────────────────

export const startSchema = z.object({
  providerId:     z.string().cuid(),
  listingType:    z.enum(['tour', 'vehicle', 'accommodation']).optional(),
  listingId:      z.string().cuid().optional(),
  initialMessage: z.string().min(1).max(2000),
})

export const sendMessageSchema = z.object({
  text:        z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(5).optional(),
})

export const messagesQuerySchema = z.object({
  cursor: z.string().optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await conversationService.listConversations(
      req.user!.userId,
      req.user!.role,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function startConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await conversationService.startConversation({
      travelerId: req.user!.userId,
      ...req.body,
    })
    return created(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const cursor = req.query.cursor as string | undefined
    const result = await conversationService.getMessages(
      String(req.params.id),
      req.user!.userId,
      req.user!.role,
      cursor,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await conversationService.sendMessage({
      conversationId: String(req.params.id),
      senderUserId:   req.user!.userId,
      senderRole:     req.user!.role,
      text:           req.body.text,
      attachments:    req.body.attachments,
    })
    return created(res, message)
  } catch (err) {
    next(err)
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await conversationService.markConversationRead(
      String(req.params.id),
      req.user!.userId,
      req.user!.role,
    )
    return ok(res, { ok: true })
  } catch (err) {
    next(err)
  }
}
