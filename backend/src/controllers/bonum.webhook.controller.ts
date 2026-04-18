import { Request, Response, NextFunction } from 'express'
import { ingestBonumWebhook } from '../services/bonumWebhook.service'
import { getBonumChecksumHeader } from '../integrations/bonum/bonum.verify'

/**
 * Body must be the raw Buffer from `express.raw` — never JSON.parse/re-stringify before checksum.
 */
export async function handleBonumWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({
        success: false,
        error: 'Invalid body: expected raw buffer (ensure express.raw runs before express.json).',
      })
      return
    }

    const result = await ingestBonumWebhook(req.body, getBonumChecksumHeader(req))
    res.status(result.status).json(result.body)
  } catch (err) {
    next(err)
  }
}
