import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { AppError } from '../middleware/error.js'
import { ok } from '../lib/api.js'
import { env } from '../config/env.js'
import type { Request } from 'express'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

/* ---------------- Thống kê ---------------- */
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const tables = ['movies', 'cinemas', 'bookings', 'comments', 'contact_messages', 'profiles']
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const { count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true })
      counts[t] = error ? 0 : (count ?? 0)
    }
    const { data: views } = await supabaseAdmin.from('website_views').select('count').limit(10000)
    const totalViews = (views ?? []).reduce((s: number, v: { count: number }) => s + (v.count ?? 0), 0)
    const { count: paid } = await supabaseAdmin
      .from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'PAID')
    ok(res, {
      movies: counts.movies,
      cinemas: counts.cinemas,
      bookings: counts.bookings,
      paidBookings: paid ?? 0,
      comments: counts.comments,
      contactMessages: counts.contact_messages,
      users: counts.profiles,
      totalViews,
    })
  } catch (e) { next(e) }
})

/* ---------------- Movies CRUD (admin) ---------------- */
const movieSchema = z.object({
  title: z.string().min(1),
  original_title: z.string().optional(),
  overview: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  genre: z.array(z.string()).optional(),
  release_date: z.string().optional(),
  language: z.string().optional(),
  certificate: z.string().optional(),
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  status: z.enum(['NOW_SHOWING', 'COMING_SOON', 'ENDED']).optional(),
})

adminRouter.get('/movies', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('movies').select('*').order('created_at', { ascending: false })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

adminRouter.post('/movies', async (req: Request, res, next) => {
  try {
    const parsed = movieSchema.parse(req.body)
    const { data, error } = await supabaseAdmin.from('movies').insert(parsed).select().single()
    if (error) throw error
    ok(res, data, 201)
  } catch (e) { next(e) }
})

adminRouter.put('/movies/:id', async (req: Request, res, next) => {
  try {
    const parsed = movieSchema.partial().parse(req.body)
    const { data, error } = await supabaseAdmin.from('movies').update(parsed).eq('id', req.params.id).select().single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
})

adminRouter.delete('/movies/:id', async (req: Request, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('movies').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) { next(e) }
/* ---------------- Đồng bộ phim từ TMDB (region=VN) ---------------- */
interface TmdMovie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  runtime?: number
}

const TMDB_GENRES: Record<number, string> = {
  28: 'Hành động', 12: 'Phiêu lưu', 16: 'Hoạt hình', 35: 'Hài', 80: 'Tội phạm',
  18: 'Chính kịch', 10751: 'Gia đình', 14: 'Kỳ ảo', 36: 'Lịch sử', 27: 'Kinh dị',
  10402: 'Âm nhạc', 9648: 'Bí ẩn', 10749: 'Lãng mạn', 878: 'Khoa học viễn tưởng',
  53: 'Giật gân', 10752: 'Chiến tranh', 37: 'Miền Tây', 99: 'Tài liệu', 10770: 'TV Movie',
}

async function tmdFetch(path: string): Promise<TmdMovie[]> {
  if (!env.TMDB_API_KEY) throw new AppError('Thiếu TMDB_API_KEY trong environment.', 500, 'TMDB_DISABLED')
  const r = await fetch(`https://api.themoviedb.org/3${path}?api_key=${env.TMDB_API_KEY}`)
  if (!r.ok) throw new AppError(`TMDB lỗi ${r.status}.`, 502, 'TMDB_ERROR')
  const j = (await r.json()) as { results?: TmdMovie[] }
  return j.results ?? []
}

function mapTmd(m: TmdMovie): Record<string, unknown> {
  const genre = (m.genre_ids ?? []).slice(0, 3).map((g) => TMDB_GENRES[g] ?? `#${g}`)
  const img = 'https://image.tmdb.org/t/p'
  const isNow = !!m.release_date && m.release_date <= new Date().toISOString().slice(0, 10)
  return {
    tmdb_id: m.id,
    title: m.title || m.original_title,
    original_title: m.original_title,
    overview: m.overview?.trim() || null,
    duration_minutes: m.runtime ?? null,
    genre: genre.length ? genre : null,
    release_date: m.release_date || null,
    poster_url: m.poster_path ? `${img}/w500${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `${img}/w1280${m.backdrop_path}` : null,
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
    vote_count: m.vote_count ?? 0,
    status: isNow ? 'NOW_SHOWING' : 'COMING_SOON',
  }
}

adminRouter.post('/movies/sync-tmdb', async (_req, res, next) => {
  try {
    const [now, up] = await Promise.all([
      tmdFetch('/movie/now_playing?language=vi-VN&region=VN&page=1'),
      tmdFetch('/movie/upcoming?language=vi-VN&region=VN&page=1'),
    ])
    const seen = new Set<number>()
    let inserted = 0, updated = 0
    for (const m of [...now, ...up]) {
      if (seen.has(m.id)) continue
      seen.add(m.id)
      const payload = mapTmd(m)
      const { data: existing } = await supabaseAdmin
        .from('movies').select('id').eq('tmdb_id', m.id).maybeSingle()
      if (existing) {
        const { error } = await supabaseAdmin.from('movies').update(payload).eq('id', existing.id)
        if (!error) updated++
      } else {
        const { error } = await supabaseAdmin.from('movies').insert(payload)
        if (!error) inserted++
      }
    }
    ok(res, { inserted, updated, total: seen.size })
  } catch (e) { next(e) }
})
/* ---------------- Showtimes CRUD (admin) ---------------- */
const showtimeSchema = z.object({
  movie_id: z.string().uuid(),
  cinema_id: z.string().uuid(),
  room_id: z.string().uuid(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  price_standard: z.number().int().positive(),
  price_vip: z.number().int().positive(),
})

adminRouter.get('/showtimes', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('showtimes')
      .select('*, movie:movies(id,title), cinema:cinemas(id,name), room:rooms(id,name)')
      .order('start_time', { ascending: true })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

adminRouter.post('/showtimes', async (req: Request, res, next) => {
  try {
    const parsed = showtimeSchema.parse(req.body)
    const { data, error } = await supabaseAdmin.from('showtimes').insert(parsed).select().single()
    if (error) throw error
    ok(res, data, 201)
  } catch (e) { next(e) }
})

adminRouter.put('/showtimes/:id', async (req: Request, res, next) => {
  try {
    const parsed = showtimeSchema.partial().parse(req.body)
    const { data, error } = await supabaseAdmin.from('showtimes').update(parsed).eq('id', req.params.id).select().single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
})

adminRouter.delete('/showtimes/:id', async (req: Request, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('showtimes').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) { next(e) }
})

/* ---------------- Comments admin ---------------- */
adminRouter.get('/comments', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('comments').select('*, movie:movies(id,title)').order('created_at', { ascending: false })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

adminRouter.delete('/comments/:id', async (req: Request, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('comments').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) { next(e) }
})

/* ---------------- Contact admin ---------------- */
adminRouter.get('/contact', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_messages').select('*').order('created_at', { ascending: false })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

adminRouter.put('/contact/:id', async (req: Request, res, next) => {
  try {
    const status = (req.body?.status as string) ?? 'RESOLVED'
    const { data, error } = await supabaseAdmin
      .from('contact_messages').update({ status }).eq('id', req.params.id).select().single()
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
})
})