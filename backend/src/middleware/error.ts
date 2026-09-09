import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  status: number
  code: string
  constructor(message: string, status = 400, code = 'BAD_REQUEST') {
    super(message)
    this.status = status
    this.code = code
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('Không tìm thấy endpoint.', 404, 'NOT_FOUND'))
}

/** Central error handler — không bao giờ lộ stack trace cho client */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } })
    return
  }
  // Lỗi từ suppressClient errors (Zod)
  if (err instanceof Error && 'status' in err) {
    const e = err as Error & { status?: number; code?: string }
    res.status(e.status ?? 400).json({ error: { code: e.code ?? 'REQUEST_FAILED', message: e.message } })
    return
  }
  // eslint-disable-next-line no-console
  console.error('[error]', err)
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Đã có lỗi máy chủ. Vui lòng thử lại.' } })
}