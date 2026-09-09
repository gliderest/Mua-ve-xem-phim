import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

/** validate(schema) — validate body theo Zod; lỗi trả 400 dạng { error } */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.'
      const err = new Error(msg) as Error & { status: number; code: string }
      err.status = 400
      err.code = 'VALIDATION_ERROR'
      next(err)
      return
    }
    ;(req as Request & { validated: T }).validated = result.data
    next()
  }
}