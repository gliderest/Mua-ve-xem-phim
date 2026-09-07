import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bookingService, movieService, cinemaService, showtimeService } from '@/services/api'
import { formatVND } from '@/data/mock'
import { useCountdown } from '@/hooks/useCountdown'
import { IconArrowLeft, IconShield, IconCheck, IconClock, IconAlert } from '@/components/svg/Icons'
import type { Booking } from '@/types'

/* ============================================================
   MockQrSvg — QR giả định cho prototype. Kiến trúc #13:
   Phase 2 backend sẽ tạo VietQR thật từ bookingCode + số tài khoản.
   ============================================================ */
export function MockQrSvg({ seed, size = 220 }: { seed: string; size?: number }) {
  const n = 25
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0
    return h / 4294967296
  }

  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)

  const cells: boolean[][] = []
  for (let r = 0; r < n; r++) {
    cells[r] = []
    for (let c = 0; c < n; c++) {
      if (isFinder(r, c)) {
        const inFinder =
          (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        cells[r][c] = inFinder
      } else {
        const skip = (r % 2 === 0 && c % 4 === 0) || (r % 3 === 0 && c % 5 === 0)
        cells[r][c] = skip || rand() > 0.52
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="Mã QR thanh toán" style={{ display: 'block' }}>
      <rect width={n} height={n} fill="#fff" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0a0a0d" /> : null,
        ),
      )}
    </svg>
  )
}

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [movieTitle, setMovieTitle] = useState('')
  const [cinemaName, setCinemaName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const { minutes, seconds, expired } = useCountdown(booking?.expiresAt)

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
        if (b.status === 'PAID') navigate(`/ticket/${b.id}`, { replace: true })
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [bookingId, navigate])

  const simulateBankTransfer = async () => {
    if (!booking) return
    setPaying(true)
    try {
      // Mock: mô phỏng SePay phát hiện giao dịch → PENDING → PAID
      await new Promise((res) => setTimeout(res, 1800))
      const paid = await bookingService.markPaid(booking.id)
      setBooking(paid)
      navigate(`/ticket/${booking.id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setPaying(false)
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

  if (error || !booking) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert--error">{error ?? 'Không tìm thấy đặt vé.'}</div>
          <Link to="/movies" className="btn btn--ghost" style={{ marginTop: 'var(--space-4)' }}>
            <IconArrowLeft size={18} /> Quay lại
          </Link>
        </div>
      </section>
    )
  }

  const seatLabels = booking.seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')

  return (
    <section className="section">
      <div className="container payment-layout">
        <Link to={`/movies/${booking.movieId}`} className="crumb">
          <IconArrowLeft size={16} /> Trang thanh toán
        </Link>

        <div className="card payment-card">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            Hoàn tất thanh toán
          </span>
          <h1 className="section-title" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
            Chuyển khoản <em>ngân hàng</em>
          </h1>

          <div className="payment-card__qr">
            <MockQrSvg seed={booking.bookingCode + booking.totalPrice} />
          </div>

          <div className="payment-card__amount">{formatVND(booking.totalPrice)}</div>

          <div className="payment-bank-row">
            <span>Ngân hàng</span>
            <strong>MB Bank — 970422</strong>
          </div>
          <div className="payment-bank-row">
            <span>Số tài khoản</span>
            <strong>1900123456789</strong>
          </div>
          <div className="payment-bank-row">
            <span>Chủ tài khoản</span>
            <strong>CINÉRA ENTERTAINMENT</strong>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Nội dung chuyển khoản (bắt buộc)
            </span>
            <div className="payment-card__content-code">{booking.bookingCode}</div>
          </div>

          <div className={`payment-timer${expired ? ' is-expired' : ''}`}>
            <IconClock size={20} />
            {expired
              ? 'Vé đã hết hạn thanh toán'
              : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
          </div>

          {expired && (
            <div className="alert alert--error" style={{ marginTop: 'var(--space-4)' }}>
              <IconAlert size={20} /> Thời gian giữ ghế đã kết thúc. Vui lòng tạo đặt vé mới.
            </div>
          )}

          <div style={{ marginTop: 'var(--space-5)' }}>
            <button
              className="btn btn--gold btn--block btn--lg"
              disabled={expired || paying}
              onClick={simulateBankTransfer}
            >
              <IconCheck size={20} />
              {paying ? 'Đang chờ ngân hàng...' : 'Tôi đã chuyển khoản (demo)'}
            </button>
            <p
              style={{
                color: 'var(--text-faint)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-3)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconShield size={16} /> Bản demo: nhấn nút để mô phỏng SePay phát hiện giao dịch. Trạng thái: {booking.status}
            </p>
          </div>

          <div className="payment-states" style={{ textAlign: 'left' }}>
            <div className="summary-row">
              <span>Phim</span>
              <strong>{movieTitle}</strong>
            </div>
            <div className="summary-row">
              <span>Rạp</span>
              <strong>{cinemaName}</strong>
            </div>
            <div className="summary-row">
              <span>Vé</span>
              <strong>{booking.bookingCode}</strong>
            </div>
            <div className="summary-row">
              <span>Ghế</span>
              <strong>{seatLabels}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}