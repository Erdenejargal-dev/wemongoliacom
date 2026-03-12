import { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page:    number
  limit:   number
  total:   number
  pages:   number
}

export function paginate(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  }
}

export function parsePagination(query: { page?: unknown; limit?: unknown }) {
  const page  = Math.max(1, parseInt(String(query.page  ?? '1'),  10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '12'), 10) || 12))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

export const ok = <T>(res: Response, data: T, message?: string, status = 200): Response =>
  res.status(status).json({ success: true, data, ...(message ? { message } : {}) } as ApiResponse<T>)

export const created = <T>(res: Response, data: T, message?: string): Response =>
  ok(res, data, message, 201)

export const noContent = (res: Response): Response =>
  res.status(204).send()

export const fail = (res: Response, message: string, status = 400): Response =>
  res.status(status).json({ success: false, error: message } as ApiResponse)
