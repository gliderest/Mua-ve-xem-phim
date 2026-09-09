import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { validate } from '../middleware/validate.js'
import { ok } from '../lib/api.js'
import type { Request } from 'express'

export const contactRouter = Router()

const contactSchema = z.object({
  name: z.string().min(2, 'Nhập tên của bạn.'),
  email: z.string().email('Email không hợp lệ.'),
  message: z.string().min(5, 'Nội dung quá ngắn.'),
})

contactRouter.post('/contact', validate(contactSchema), async (req: Request, res, next) => {
  try {
    const payload = (req as Request & { validated: z.infer<typeof contactSchema> }).validated
    const { data, error } = await supabaseAdmin.from('contact_messages').insert({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      status: 'NEW',
    }).select().single()
    if (error) throw error
    ok(res, data, 201)
  } catch (e) { next(e) }
})