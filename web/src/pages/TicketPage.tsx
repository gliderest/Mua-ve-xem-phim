import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService, cinemaService, movieService, showtimeService } from '@/services/api'
import { formatVND } from '@/data/mock'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { IconArrowLeft, IconCheck } from '@/components/svg/Icons'
import type { Booking } from '@/types'
import { MockQrSvg } from '@/pages/PaymentPage'

export function TicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const ticketRef = useRef<HTMLDivElement>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [movieTitle, setMovieTitle] = useState('')
  const [cinemaName, setCinemaName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    ;(async () => {
      try {
        const b = await bookingService.byId(bookingId)
        const st = await showtimeService.byId(b.showtimeId)
        const mv = await movieService.byId(st.movieId)
        const cs = await cinemaService.byId(st.cinemaId)
        setBooking(b)
        setMovieTitle(mv?.title ?? '')
        setCinemaName(cs?.name ?? '')
        setRoomName(st.roomId ? `Screen ${b.showtimeId.slice(-1)}` : '')
        setStartTime(new Date(st.startTime))
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [bookingId])

  useEffect(() => {
    if (loading || !booking || animate) return
    const el = ticketRef.current
    if (!el) return
    setAnimate(true)
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.ticket', { scale: 0.94, opacity: 0, duration: 0.7, y: 24 })
        .from('.ticket__head', { opacity: 0, y: 14, duration: 0.4 }, '-=0.2')
        .from('.ticket__body', { opacity: 0, y: 14, duration: 0.4 }, '-=0.2')
        .from('.ticket__foot', { opacity: 0, duration: 0.4 }, '-=0.2')
        .from('.ticket-success-badge', { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.1')
    }, el)
    return () => ctx.revert()
  }, [loading, booking, animate])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      </section>
    )
  }

  if (error || !booking) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert--error">{error ?? 'Không tìm thấy vé.'}</div>
          <Link to="/movies" className="btn btn--ghost" style={{ marginTop: 'var(--space-4)' }}>
            <IconArrowLeft size={18} /> Quay lại
          </Link>
        </div>
      </section>
    )
  }

  const seatLabels = booking.seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')

  return (
    <section className="section" ref={ticketRef}>
      <div className="container ticket-wrap">
        <div className="ticket-success-badge" style={{ marginBottom: 'var(--space-4)' }}>
          <IconCheck size={22} /> Thanh toán thành công — vé của bạn đã sẵn sàng
        </div>

        <div className="ticket" role="region" aria-label="Vé điện tử">
          <div className="ticket__cutout ticket__cutout--left" />
          <div className="ticket__cutout ticket__cutout--right" />

          <div className="ticket__head">
            <div>
              <span className="badge badge--gold">Vé điện tử</span>
              <h2 className="ticket__movie" style={{ marginTop: 'var(--space-2)' }}>
                {movieTitle}
              </h2>
            </div>
            <span style={{ color: 'var(--accent-strong)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: '0.14em' }}>
              {booking.bookingCode}
            </span>
          </div>

          <div className="ticket__body">
            <dl className="ticket__meta-grid">
              <div>
                <dt>Rạp</dt>
                <dd>{cinemaName}</dd>
              </div>
              <div>
                <dt>Phòng</dt>
                <dd>{roomName}</dd>
              </div>
              <div>
                <dt>Suất chiếu</dt>
                <dd>
                  {startTime
                    ? `${startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Ghế</dt>
                <dd>{seatLabels}</dd>
              </div>
              <div>
                <dt>Số vé</dt>
                <dd>{booking.bookingCode}</dd>
              </div>
              <div>
                <dt>Giá</dt>
                <dd>{formatVND(booking.totalPrice)}</dd>
              </div>
            </dl>
            <div className="ticket__qr">
              <MockQrSvg seed={booking.bookingCode} size={108} />
            </div>
          </div>

          <div className="ticket__foot">
            <span>Quét mã QR tại cửa rạp để đổi soát vé</span>
            <span>CINÉRA</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
          <Link to="/my-tickets" className="btn btn--surface">
            Xem vé của tôi
          </Link>
          <Link to="/movies" className="btn btn--gold">
            Mua vé tiếp
          </Link>
        </div>
      </div>
    </section>
  )
}