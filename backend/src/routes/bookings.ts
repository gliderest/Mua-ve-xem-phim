import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../middleware/error.js'
import { ok, genBookingCode, nowIso } from '../lib/api.js'
import type { Request } from 'express'

export const bookingRouter = Router()

const createSchema = z.object({
  showtimeId: z.string().uuid('Suất chiếu không hợp lệ.'),
  seatIds: z.array(z.string().uuid('Ghế không hợp lệ.')).min(1, 'Chọn ít nhất 1 ghế.'),
})

bookingRouter.use(requireAuth)

/** Tạo booking PENDING_PAYMENT + booking_seats + payment PENDING */
bookingRouter.post('/bookings', validate(createSchema), async (req: Request, res, next) => {
  try {
    const user = (req as Request & { user: { id: string } }).user
    const { showtimeId, seatIds } = (req as Request & { validated: z.infer<typeof createSchema> }).validated

    const { data: st, error: stErr } = await supabaseAdmin
      .from('showtimes').select('*').eq('id', showtimeId).maybeSingle()
    if (stErr || !st) throw new AppError('Suất chiếu không tồn tại.', 404, 'SHOWTIME_NOT_FOUND')

    const { data: seats, error: seatErr } = await supabaseAdmin
      .from('seats').select('*').in('id', seatIds)
    if (seatErr) throw seatErr
    if (!seats || seats.length !== seatIds.length) throw new AppError('Một số ghế không hợp lệ.', 400, 'SEAT_NOT_FOUND')

    // Ghế đã được đặt bởi booking PAID (chưa hết hạn PENDING cũng tính là đã giữ)
    const { data: activeBk } = await supabaseAdmin
      .from('bookings').select('id, status, expires_at').eq('showtime_id', showtimeId)
    const activeIds = (activeBk ?? [])
      .filter((b: { status: string; expires_at: string }) =>
        b.status === 'PAID' || (b.status === 'PENDING_PAYMENT' && new Date(b.expires_at) > new Date()),
      )
      .map((b: { id: string }) => b.id)
    if (activeIds.length > 0) {
      const { data: taken } = await supabaseAdmin.from('booking_seats').select('seat_id').in('booking_id', activeIds)
      if (taken?.some((t: { seat_id: string }) => seatIds.includes(t.seat_id))) {
        throw new AppError('Một số ghế vừa được đặt. Vui lòng chọn ghế khác.', 409, 'SEAT_UNAVAILABLE')
      }
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    const totalPrice = (seats as Array<{ seat_type: string }>).reduce(
      (sum, s) => sum + (s.seat_type === 'VIP' ? st.price_vip : st.price_standard),
      0,
    )
    const code = genBookingCode()

    const { data: booking, error: bErr } = await supabaseAdmin.from('bookings').insert({
      booking_code: code,
      user_id: user.id,
      showtime_id: showtimeId,
      total_price: totalPrice,
      status: 'PENDING_PAYMENT',
      expires_at: expiresAt,
    }).select().single()
    if (bErr) throw bErr

    await supabaseAdmin.from('booking_seats').insert(
      (seats as Array<{ id: string; seat_type: string }>).map((s) => ({
        booking_id: booking.id,
        seat_id: s.id,
        price: s.seat_type === 'VIP' ? st.price_vip : st.price_standard,
      })),
    )

    await supabaseAdmin.from('payments').insert({
      booking_id: booking.id,
      amount: totalPrice,
      provider: 'BANK_TRANSFER',
      content_code: code,
      status: 'PENDING',
    })

    ok(res, { ...booking, seats: seatIds, expiresAt }, 201)
  } catch (e) { next(e) }
})

/** Vé của tôi */
bookingRouter.get('/bookings', async (req: Request, res, next) => {
  try {
    const user = (req as Request & { user: { id: string } }).user
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, seats:booking_seats(seat:seats(*), price)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    ok(res, data ?? [])
  } catch (e) { next(e) }
})

/** Chi tiết booking (owner hoặc admin) */
bookingRouter.get('/bookings/:id', async (req: Request, res, next) => {
  try {
    const user = (req as Request & { user: { id: string; profile?: { role?: string } | null } }).user
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, showtime:showtimes(*, movie:movies(*), cinema:cinemas(*), room:rooms(*)), seats:booking_seats(seat:seats(*), price)')
      .eq('id', req.params.id)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new AppError('Không tìm thấy đặt vé.', 404, 'BOOKING_NOT_FOUND')
    if (data.user_id !== user.id && user.profile?.role !== 'ADMIN') {
      throw new AppError('Không có quyền xem vé này.', 403, 'FORBIDDEN')
    }
    ok(res, data)
  } catch (e) { next(e) }
})

/** Mock thanh toán: mô phỏng SePay xác nhận → PAID (demo, thay webhook thật ở deployment) */
bookingRouter.post('/bookings/:id/mock-pay', async (req: Request, res, next) => {
  try {
    const user = (req as Request & { user: { id: string; profile?: { role?: string } | null } }).user
    const { data: booking, error: getErr } = await supabaseAdmin
      .from('bookings').select('*').eq('id', req.params.id).maybeSingle()
    if (getErr || !booking) throw new AppError('Không tìm thấy đặt vé.', 404, 'BOOKING_NOT_FOUND')
    if (booking.user_id !== user.id && user.profile?.role !== 'ADMIN') {
      throw new AppError('Không có quyền.', 403, 'FORBIDDEN')
    }
    if (booking.status === 'PAID') throw new AppError('Vé đã thanh toán.', 400, 'ALREADY_PAID')
    if (new Date(booking.expires_at) < new Date()) throw new AppError('Vé đã hết hạn thanh toán.', 400, 'BOOKING_EXPIRED')

    const { data: updated, error: upErr } = await supabaseAdmin
      .from('bookings').update({ status: 'PAID' }).eq('id', booking.id).select().single()
    if (upErr) throw upErr

    await supabaseAdmin
      .from('payments')
      .update({ status: 'PAID', paid_at: nowIso() })
      .eq('booking_id', booking.id)
      .eq('status', 'PENDING')

    ok(res, updated)
  } catch (e) { next(e) }
})

/* ============================================================
   SePay webhook — nhận callback ngân hàng (dev: mock, prod: config thật)
   ============================================================ */
export const sepayWebhookRouter = Router()

sepayWebhookRouter.post('/webhooks/sepay', async (req: Request, res, next) => {
  try {
    const payload = req.body ?? {}
    const content = String(payload?.content ?? payload?.transactionID ?? '')
    const match = content.match(/CINE(\d{5})/)
    if (match) {
      const { data: booking } = await supabaseAdmin
        .from('bookings').select('*').eq('booking_code', `CINE${match[1]}`).maybeSingle()
      if (booking && booking.status === 'PENDING_PAYMENT') {
        await supabaseAdmin.from('bookings').update({ status: 'PAID' }).eq('id', booking.id)
        await supabaseAdmin
          .from('payments')
          .update({ status: 'PAID', paid_at: nowIso(), raw_payload: payload, provider: 'SEPAY' })
          .eq('booking_id', booking.id)
      }
    }
    res.json({ ok: true })
  } catch (e) { next(e) }
})
