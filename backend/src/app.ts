import express, { type Request } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { supabaseAdmin } from './config/supabase.js'
import { errorHandler, notFound } from './middleware/error.js'
import { ok } from './lib/api.js'
import { healthRouter } from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { catalogRouter } from './routes/catalog.js'
import { bookingRouter, sepayWebhookRouter } from './routes/bookings.js'
import { contactRouter } from './routes/contact.js'
import { adminRouter } from './routes/admin.js'

export const app = express()

app.use(helmet())
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'].filter(Boolean),
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

// Sức khỏe service
app.use(healthRouter)

// API endpoints
app.use('/api/auth', authRouter)
app.use('/api', catalogRouter) // /movies, /cinemas, /showtimes, ...
app.use('/api', bookingRouter) // /bookings, /bookings/:id/mock-pay
app.use('/api', contactRouter) // /contact
app.use('/api', sepayWebhookRouter) // /api/webhooks/sepay
app.use('/api/admin', adminRouter)

// Website views (gọi khi người dùng vào trang chủ/trang nội dung)
app.post('/api/views', async (req: Request, res, next) => {
  try {
    const path = String(req.body?.path ?? '/')
    const today = new Date().toISOString().slice(0, 10)
    await supabaseAdmin.rpc('increase_view', { p_path: path, p_date: today })
    ok(res, { ok: true })
  } catch {
    // upsert nếu rpc chưa có
    try {
      const path = String(req.body?.path ?? '/')
      const today = new Date().toISOString().slice(0, 10)
      const { data: existing } = await supabaseAdmin
        .from('website_views').select('id, count').eq('path', path).eq('view_date', today).maybeSingle()
      if (existing) {
        await supabaseAdmin.from('website_views').update({ count: (existing.count ?? 1) + 1 }).eq('id', existing.id)
      } else {
        await supabaseAdmin.from('website_views').insert({ path, view_date: today, count: 1 })
      }
      ok(res, { ok: true })
    } catch (e) { next(e) }
  }
})

app.use(notFound)
app.use(errorHandler)