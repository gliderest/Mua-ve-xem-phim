import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cinemaService, movieService, seatService, bookingService, showtimeService } from '@/services/api'
import { formatVND } from '@/data/mock'
import { IconArrowLeft, IconSeat, IconShield, IconArrowRight } from '@/components/svg/Icons'
import type { Cinema, Movie, Room, Seat, Showtime } from '@/types'

export function BookingPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const navigate = useNavigate()

  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [cinema, setCinema] = useState<Cinema | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    if (!showtimeId) return
    let alive = true
    ;(async () => {
      try {
        const st = await showtimeService.byId(showtimeId)
        const [mv, { cinema, room }, seatsData] = await Promise.all([
          movieService.byId(st.movieId),
          cinemaService.room(st.roomId),
          seatService.seatsFor(st.id, st.roomId),
        ])
        if (!alive) return
        setShowtime(st)
        setMovie(mv)
        setCinema(cinema)
        setRoom(room)
        setSeats(seatsData)
      } catch (e) {
        if (alive) setError((e as Error).message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [showtimeId])

  const rows = useMemo(() => {
    const map = new Map<string, Seat[]>()
    seats.forEach((s) => {
      const list = map.get(s.rowLabel) ?? []
      list.push(s)
      map.set(s.rowLabel, list)
    })
    return map
  }, [seats])

  /** Ghế BOOKED không chọn được (server rule). */
  const toggle = (seat: Seat) => {
    if (seat.status === 'BOOKED') return
    setPageError(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(seat.id)) next.delete(seat.id)
      else next.add(seat.id)
      return next
    })
  }

  const selectedSeats = seats.filter((s) => selected.has(s.id))
  const totalPrice = selectedSeats.reduce(
    (sum, s) => sum + (s.seatType === 'VIP' ? (showtime?.priceVip ?? 0) : (showtime?.priceStandard ?? 0)),
    0,
  )

  const createBooking = async () => {
    if (!showtimeId || selected.size === 0) return
    setCreating(true)
    setPageError(null)
    try {
      const booking = await bookingService.create(showtimeId, selectedSeats.map((s) => s.id))
      navigate(`/payment/${booking.id}`)
    } catch (e) {
      setPageError((e as Error).message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      </section>
    )
  }

  if (error || !showtime || !movie || !cinema || !room) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert--error">{error ?? 'Không tải được dữ liệu.'}</div>
          <Link to="/movies" className="btn btn--ghost" style={{ marginTop: 'var(--space-4)' }}>
            <IconArrowLeft size={18} /> Quay lại chọn phim
          </Link>
        </div>
      </section>
    )
  }

  const startTime = new Date(showtime.startTime)

  return (
    <section className="section">
      <div className="container">
        <Link to={`/movies/${movie.id}`} className="crumb">
          <IconArrowLeft size={16} /> {movie.title}
        </Link>

        <div className="section-head">
          <div>
            <span className="eyebrow">Chọn ghế</span>
            <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              {movie.title} <em>· {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</em>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge">{cinema.name}</span>
              <span className="badge">{room.name}</span>
              <span className="badge badge--gold">{formatVND(showtime.priceStandard)} / ghế thường</span>
              <span className="badge badge--gold">{formatVND(showtime.priceVip)} / ghế VIP</span>
            </p>
          </div>
        </div>

        <div className="booking-layout">
          <div>
            <div className="screen-stage">
              <div className="screen-stage__arc" />
              <span className="screen-stage__label">Màn hình</span>
            </div>

            <div className="seat-map">
              {Array.from(rows.entries()).map(([rowLabel, rowSeats]) => (
                <div className="seat-row" key={rowLabel}>
                  <span className="seat-row__label">{rowLabel}</span>
                  {rowSeats.map((seat) => {
                    const isSelected = selected.has(seat.id)
                    const isBooked = seat.status === 'BOOKED'
                    const isVip = seat.seatType === 'VIP'
                    return (
                      <button
                        key={seat.id}
                        className={`seat${isSelected ? ' is-selected' : ''}${isBooked ? ' is-booked' : ''}${isVip ? ' is-vip' : ''}`}
                        onClick={() => toggle(seat)}
                        disabled={isBooked}
                        aria-label={`Ghế ${rowLabel}${seat.seatNumber}${isVip ? ' VIP' : ''}${isBooked ? ' (đã đặt)' : ''}`}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? seat.seatNumber : ''}
                      </button>
                    )
                  })}
                  <span className="seat-row__label" style={{ textAlign: 'left', marginRight: 0, marginLeft: 4 }}>
                    {rowLabel}
                  </span>
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <span className="legend-dot"><i className="seat-sample" /> Còn trống</span>
              <span className="legend-dot"><i className="vip-sample" /> VIP</span>
              <span className="legend-dot"><i className="selected-sample" /> Đang chọn</span>
              <span className="legend-dot"><i className="booked-sample" /> Đã đặt</span>
            </div>
          </div>
<aside className="card summary-panel">
            <h3 className="summary-panel__title">Tóm tắt đặt vé</h3>
            <div className="summary-row">
              <span>Phim</span>
              <strong>{movie.title}</strong>
            </div>
            <div className="summary-row">
              <span>Rạp</span>
              <strong>{cinema.name}</strong>
            </div>
            <div className="summary-row">
              <span>Phòng</span>
              <strong>{room.name}</strong>
            </div>
            <div className="summary-row">
              <span>Suất</span>
              <strong>
                {startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}{' '}
                {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
            <div className="summary-row">
              <span>Ghế ({selected.size})</span>
              <strong>{selectedSeats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ') || '—'}</strong>
            </div>
            <div className="summary-total">
              <span className="summary-total__label">Tổng cộng</span>
              <span className="summary-total__price">{formatVND(totalPrice)}</span>
            </div>

            {pageError && (
              <div className="alert alert--error" style={{ marginTop: 'var(--space-4)' }}>
                {pageError}
              </div>
            )}

            <button
              className="btn btn--gold btn--block btn--lg"
              disabled={selected.size === 0 || creating}
              onClick={createBooking}
            >
              <IconSeat size={20} />
              {creating ? 'Đang xác nhận...' : 'Tiếp tục thanh toán'}
              <IconArrowRight size={20} className="btn__arrow" />
            </button>

            <p style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-faint)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)', justifyContent: 'center' }}>
              <IconShield size={16} /> Giá do hệ thống tính, ghế giữ trong 15 phút
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}