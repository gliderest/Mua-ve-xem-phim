import express, { type Request } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'node:path'
import fs from 'node:fs'
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.themoviedb.org'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://image.tmdb.org'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)
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
app.use('/api', catalogRouter) // /movies, /cinemas, /rooms, /showtimes, ...
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

/* ============================================================
   Static: phục vụ web/dist (1 Web Service chạy cả API + giao diện)
   ============================================================ */
const webDistCandidates = [
  path.resolve(process.cwd(), '../web/dist'),
  path.resolve(process.cwd(), 'web/dist'),
  path.resolve(process.cwd(), '../dist'),
]
const webDist = webDistCandidates.find((p) => fs.existsSync(path.join(p, 'index.html')))

if (webDist) {
  app.use(express.static(webDist))
  // SPA fallback: các route không phải /api trả index.html
  app.get(/^\/?(?!api(\/|$)).*/, (_req, res, next) => {
    res.sendFile(path.join(webDist, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
}

app.use(notFound)
app.use(errorHandler)