import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type Target = 'body' | 'query' | 'params'

/** Validates req[target] against the given Zod schema and replaces it with the parsed value */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(result.error)
      return
    }
    // Replace with validated & transformed data
    ;(req as any)[target] = result.data
    next()
  }
}
