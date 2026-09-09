import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../middleware/error.js'
import { ok } from '../lib/api.js'
import type { Request } from 'express'

export const catalogRouter = Router()

/* ---------------- Movies ---------------- */
catalogRouter.get('/movies', async (req: Request, res, next) => {
  try {
    const status = req.query.status as string | undefined
    let query = supabaseAdmin.from('movies').select('*').order('release_date', { ascending: false })
    if (status && ['NOW_SHOWING', 'COMING_SOON', 'ENDED'].includes(status)) {
      query = query.eq('status', status)
    }
    const { data, error } = await query
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
})

catalogRouter.get('/movies/:id', async (req: Request, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('movies').select('*').eq('id', req.params.id).maybeSingle()
    if (error) throw error
    if (!data) throw new AppError('Không tìm thấy phim.', 404, 'MOVIE_NOT_FOUND')
    ok(res, data)
  } catch (e) { next(e) }
})

/* ---------------- Showtimes của phim ---------------- */
catalogRouter.get('/movies/:id/showtimes', async (req: Request, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('showtimes')
      .select('*, cinema:cinemas(name, district), room:rooms(name)')
      .eq('movie_id', req.params.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

/* ---------------- Cinemas ---------------- */
catalogRouter.get('/cinemas', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('cinemas').select('*, rooms(count)').order('name')
    if (error) throw error
    ok(res, data)
  } catch (e) { next(e) }
})

catalogRouter.get('/cinemas/:id', async (req: Request, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('cinemas').select('*').eq('id', req.params.id).maybeSingle()
    if (error) throw error
    if (!data) throw new AppError('Không tìm thấy rạp.', 404, 'CINEMA_NOT_FOUND')
    ok(res, data)
  } catch (e) { next(e) }
})

/* ---------------- Showtime detail + seats ---------------- */
catalogRouter.get('/showtimes/:id', async (req: Request, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('showtimes')
      .select('*, movie:movies(*), cinema:cinemas(*), room:rooms(*)')
      .eq('id', req.params.id)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new AppError('Suất chiếu không tồn tại.', 404, 'SHOWTIME_NOT_FOUND')
    ok(res, data)
  } catch (e) { next(e) }
})

catalogRouter.get('/showtimes/:id/seats', async (req: Request, res, next) => {
  try {
    const showtimeId = req.params.id
    const { data: st, error: stErr } = await supabaseAdmin
      .from('showtimes').select('room_id').eq('id', showtimeId).maybeSingle()
    if (stErr || !st) throw new AppError('Suất chiếu không tồn tại.', 404, 'SHOWTIME_NOT_FOUND')

    // Ghế trong phòng
    const { data: seats, error: seatErr } = await supabaseAdmin
      .from('seats').select('*').eq('room_id', st.room_id).order('row_label').order('seat_number')
    if (seatErr) throw seatErr

    // Ghế đã được đặt: booking PAID, hoặc PENDING mà chưa hết hạn giữ ghế
    const { data: bookingRows, error: bkErr } = await supabaseAdmin
      .from('bookings')
      .select('id, status, expires_at')
      .eq('showtime_id', showtimeId)
    if (bkErr) throw bkErr
    const activeBookingIds = (bookingRows ?? [])
      .filter((b: { status: string; expires_at: string }) =>
        b.status === 'PAID' || (b.status === 'PENDING_PAYMENT' && new Date(b.expires_at) > new Date()),
      )
      .map((b: { id: string }) => b.id)

    let bookedSet = new Set<string>()
    if (activeBookingIds.length > 0) {
      const { data: rows, error: bErr } = await supabaseAdmin
        .from('booking_seats')
        .select('seat_id')
        .in('booking_id', activeBookingIds)
      if (bErr) throw bErr
      bookedSet = new Set((rows ?? []).map((r: { seat_id: string }) => r.seat_id))
    }

    const mapped = (seats ?? []).map((s: { id: string; row_label: string; seat_number: number; seat_type: string }) => ({
      id: s.id,
      rowLabel: s.row_label,
      seatNumber: s.seat_number,
      seatType: s.seat_type,
      status: bookedSet.has(s.id) ? 'BOOKED' : 'AVAILABLE',
    }))
    ok(res, mapped)
  } catch (e) { next(e) }
})

/* ---------------- Comments ---------------- */
const commentSchema = z.object({
  name: z.string().min(2, 'Nhập tên của bạn.'),
  email: z.string().email('Email không hợp lệ.'),
  content: z.string().min(4, 'Nội dung quá ngắn.'),
  rating: z.number().min(1).max(5),
})

catalogRouter.get('/movies/:id/comments', async (req: Request, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('comments').select('*').eq('movie_id', req.params.id).order('created_at', { ascending: false })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

catalogRouter.post('/movies/:id/comments', validate(commentSchema), async (req: Request, res, next) => {
  try {
    const payload = (req as Request & { validated: z.infer<typeof commentSchema> }).validated
    const user = (req as Request & { user?: { id?: string } }).user
    const { data, error } = await supabaseAdmin.from('comments').insert({
      movie_id: req.params.id,
      user_id: user?.id ?? null,
      name: payload.name,
      email: payload.email,
      content: payload.content,
      rating: payload.rating,
    }).select().single()
    if (error) throw error
    ok(res, data, 201)
  } catch (e) { next(e) }
})