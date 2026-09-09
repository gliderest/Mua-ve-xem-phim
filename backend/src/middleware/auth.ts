import type { NextFunction, Request, Response } from 'express'
import { userFromRequest } from '../config/supabase.js'
import { AppError } from './error.js'

/**
 * requireAuth — yêu cầu Bearer JWT hợp lệ từ Supabase Auth.
 * Gán req.user (gồm profile) khi thành công.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const { user } = await userFromRequest(req.headers.authorization)
    if (!user) throw new AppError('Vui lòng đăng nhập.', 401, 'UNAUTHORIZED')
    ;(req as Request & { user: NonNullable<typeof user> }).user = user
    next()
  } catch (e) {
    next(e)
  }
}

/** requireAdmin — sau requireAuth, kiểm tra role ADMIN trong profile */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as Request & { user?: { profile?: { role?: string } | null } }).user
  if (!user) return next(new AppError('Vui lòng đăng nhập.', 401, 'UNAUTHORIZED'))
  if (user.profile?.role !== 'ADMIN') {
    return next(new AppError('Bạn không có quyền quản trị.', 403, 'FORBIDDEN'))
  }
  next()
}