import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingService, showtimeService } from '@/services/api'
import { formatVND } from '@/data/mock'
import { IconTicket, IconArrowRight } from '@/components/svg/Icons'
import type { Booking, Showtime } from '@/types'

const STATUS: Record<Booking['status'], string> = {
  PENDING_PAYMENT: 'Đang thanh toán',
  PAID: 'Đã thanh toán',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
}

export function MyTicketsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showtimes, setShowtimes] = useState<Record<string, Showtime | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const list = await bookingService.mine()
        setBookings(list)
        const map: Record<string, Showtime | null> = {}
        for (const b of list) {
          try {
            map[b.showtimeId] = await showtimeService.byId(b.showtimeId)
          } catch {
            map[b.showtimeId] = null
          }
        }
        setShowtimes(map)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section className="section section--page">
      <div className="container">
        <span className="eyebrow">Tài khoản</span>
        <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
          Vé của <em>tôi</em>
        </h1>

        {loading ? (
          <div className="skeleton" style={{ height: 260 }} />
        ) : bookings.length === 0 ? (
          <div className="state-empty">
            <IconTicket size={44} />
            <p>Bạn chưa có vé nào. Hãy chọn một bộ phim để bắt đầu.</p>
            <Link to="/movies" className="btn btn--gold" style={{ marginTop: 'var(--space-4)' }}>
              Xem phim <IconArrowRight size={18} className="btn__arrow" />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {bookings.map((b) => {
              const st = showtimes[b.showtimeId]
              const seats = b.seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')
              const time = st ? new Date(st.startTime) : null
              return (
                <article className="card" key={b.id} style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${b.status === 'PAID' ? 'badge--green' : b.status === 'PENDING_PAYMENT' ? 'badge--gold' : 'badge--red'}`}>
                          {STATUS[b.status]}
                        </span>
                        <span className="badge">{b.bookingCode}</span>
                      </div>
                      <h3 style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xl)' }}>
                        {time
                          ? `Suất ${time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Vé xem phim'}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        Ghế: {seats} · {formatVND(b.totalPrice)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      {b.status === 'PENDING_PAYMENT' && (
                        <Link to={`/payment/${b.id}`} className="btn btn--gold btn--sm">
                          Thanh toán ngay
                        </Link>
                      )}
                      {b.status === 'PAID' && (
                        <Link to={`/ticket/${b.id}`} className="btn btn--surface btn--sm">
                          Xem vé
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}