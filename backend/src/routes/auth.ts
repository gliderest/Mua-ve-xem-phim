import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin, supabaseAnon } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../middleware/error.js'
import { ok } from '../lib/api.js'
import type { Request } from 'express'

export const authRouter = Router()

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự.').max(30),
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự.'),
  fullName: z.string().max(80).optional(),
})

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Nhập mật khẩu.'),
})

// Người dùng đã có Supabase Auth → tạo profile nếu thiếu
async function ensureProfile(userId: string, email: string, username: string, fullName?: string) {
  const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (existing) return existing
  const { data, error } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    username,
    email,
    full_name: fullName || username,
    role: 'USER',
  }).select().single()
  if (error) {
    // username trùng → thử suffix
    if (error.code === '23505') {
      const { data: d2 } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        username: `${username}_${Date.now() % 1000}`,
        email,
        full_name: fullName || username,
        role: 'USER',
      }).select().single()
      return d2
    }
    throw error
  }
  return data
}

authRouter.post('/register', validate(registerSchema), async (req: Request, res, next) => {
  try {
    const { username, email, password, fullName } = (req as Request & { validated: z.infer<typeof registerSchema> }).validated
    const { data, error } = await supabaseAdmin.auth.signUp({ email, password })
    if (error) throw new AppError(error.message, 400, 'AUTH_ERROR')
    if (!data.user) throw new AppError('Không tạo được tài khoản.', 500, 'AUTH_ERROR')

    const profile = await ensureProfile(data.user.id, email, username, fullName)
    ok(res, {
      user: profile,
      accessToken: data.session?.access_token ?? null,
      message: data.session ? 'Đăng ký thành công.' : 'Tài khoản đã tạo. Vui lòng xác nhận email.',
    }, 201)
  } catch (e) { next(e) }
})

authRouter.post('/login', validate(loginSchema), async (req: Request, res, next) => {
  try {
    const { email, password } = (req as Request & { validated: z.infer<typeof loginSchema> }).validated
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new AppError('Email hoặc mật khẩu không đúng.', 401, 'INVALID_CREDENTIALS')
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', data.user.id).maybeSingle()
    ok(res, { user: profile ?? { id: data.user.id, email }, accessToken: data.session.access_token })
  } catch (e) { next(e) }
})

authRouter.get('/me', requireAuth, async (req: Request, res, next) => {
  try {
    const user = (req as Request & { user: { id: string; email?: string; profile?: unknown } }).user
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', user.id).maybeSingle()
    ok(res, { user: profile ?? { id: user.id, email: user.email } })
  } catch (e) { next(e) }
})

authRouter.post('/logout', (_req, res) => {
  ok(res, { message: 'Đăng xuất.' })
})