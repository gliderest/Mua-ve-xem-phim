import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { movieService, cinemaService } from '@/services/api'
import { PosterArt } from '@/components/svg/PosterArt'
import { IconArrowLeft, IconClock, IconPlay, IconCalendar } from '@/components/svg/Icons'
import { formatVND } from '@/data/mock'
import type { Cinema, Showtime } from '@/types'
import { CommentSection } from '@/components/common/CommentSection'

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<Awaited<ReturnType<typeof movieService.byId>> | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [cinemas, setCinemas] = useState<Record<string, Cinema>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    Promise.all([
      movieService.byId(id),
      movieService.showtimes(id),
      cinemaService.list(),
    ])
      .then(([m, st, cs]) => {
        if (!alive) return
        setMovie(m)
        setShowtimes(st)
        setCinemas(Object.fromEntries(cs.map((c) => [c.id, c])))
        const firstDate = st[0]?.date
        if (firstDate) setSelectedDate(firstDate)
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const dates = useMemo(
    () => Array.from(new Set(showtimes.map((s) => s.date))).sort(),
    [showtimes],
  )

  const groupedByCinema = useMemo(() => {
    const map = new Map<string, Showtime[]>()
    showtimes
      .filter((s) => s.date === selectedDate)
      .forEach((s) => {
        const list = map.get(s.cinemaId) ?? []
        list.push(s)
        map.set(s.cinemaId, list)
      })
    return map
  }, [showtimes, selectedDate])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="skeleton" style={{ height: 480 }} />
        </div>
      </section>
    )
  }

  if (error || !movie) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert--error">{error ?? 'Không tìm thấy phim.'}</div>
          <Link to="/movies" className="btn btn--ghost" style={{ marginTop: 'var(--space-4)' }}>
            <IconArrowLeft size={18} /> Trở về danh sách
          </Link>
        </div>
      </section>
    )
  }

  const dateLabel = (date: string) => {
    const d = new Date(date + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
    if (same(d, today)) return 'Hôm nay'
    if (same(d, tomorrow)) return 'Ngày mai'
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
  }

  return (
    <>
      <section className="detail-hero">
        <div className="container detail-hero__grid">
          <div className="detail-hero__poster" style={{ position: 'relative' }}>
            <PosterArt movie={movie} />
            <span className="badge badge--gold" style={{ position: 'absolute', top: 12, left: 12 }}>
              {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
            </span>
          </div>
          <div className="detail-info">
            <h1 className="detail-info__title">{movie.title}</h1>
            {movie.originalTitle && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>
                {movie.originalTitle}
              </p>
            )}
            <div className="detail-info__sub">
              <span>{movie.genre.join(' · ')}</span>
              <span>{movie.rated}</span>
              <span>{movie.language}</span>
            </div>
            <p className="detail-info__desc">{movie.description}</p>

            <dl className="detail-info__meta">
              <div className="detail-info__meta-item">
                <dt>Đạo diễn</dt>
                <dd>{movie.director}</dd>
              </div>
              <div className="detail-info__meta-item">
                <dt>Thời lượng</dt>
                <dd>{movie.durationMinutes} phút</dd>
              </div>
              <div className="detail-info__meta-item">
                <dt>Khởi chiếu</dt>
                <dd>{new Date(movie.releaseDate + 'T00:00:00').toLocaleDateString('vi-VN')}</dd>
              </div>
              <div className="detail-info__meta-item">
                <dt>Diễn viên</dt>
                <dd>{movie.cast.join(', ')}</dd>
              </div>
            </dl>

            <div className="detail-info__actions">
              {movie.status === 'NOW_SHOWING' && (
                <a href="#showtimes" className="btn btn--gold btn--lg">
                  <IconPlay size={20} /> Đặt vé ngay
                </a>
              )}
              <Link to="/movies" className="btn btn--ghost btn--lg">
                <IconArrowLeft size={18} /> Xem phim khác
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionShowtimes
        groupedByCinema={groupedByCinema}
        dates={dates}
        cinemas={cinemas}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dateLabel={dateLabel}
      />

      <CommentSection movieId={movie.id} />
    </>
  )
interface ShowtimesProps {
  groupedByCinema: Map<string, Showtime[]>
  dates: string[]
  cinemas: Record<string, Cinema>
  selectedDate: string
  onDateChange: (d: string) => void
  dateLabel: (d: string) => string
}

function SectionShowtimes({ groupedByCinema, dates, cinemas, selectedDate, onDateChange, dateLabel }: ShowtimesProps) {
  return (
    <section className="section" id="showtimes" style={{ paddingTop: 'var(--space-6)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Lịch chiếu</span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Chọn <em>suất chiếu</em>
            </h2>
          </div>
        </div>

        {dates.length > 0 && (
          <div className="date-strip">
            {dates.map((d) => (
              <button
                key={d}
                className={`date-chip${selectedDate === d ? ' is-selected' : ''}`}
                onClick={() => onDateChange(d)}
              >
                <IconCalendar size={16} />
                <small>Ngày</small>
                {dateLabel(d)}
              </button>
            ))}
          </div>
        )}

        {groupedByCinema.size === 0 ? (
          <div className="state-empty">
            <IconClock size={44} />
            <p>Chưa có suất chiếu cho ngày này.</p>
          </div>
        ) : (
          <div className="showtimes-grid">
            {Array.from(groupedByCinema.entries()).map(([cinemaId, list]) => {
              const cinema = cinemas[cinemaId]
              return (
                <article className="card showtime-card" key={cinemaId}>
                  <div className="showtime-card__head">
                    <h3 className="showtime-card__cinema">{cinema?.name ?? 'CINÉRA'}</h3>
                    <span className="badge">{cinema?.district}</span>
                  </div>
                  <div className="showtime-chip-list">
                    {list
                      .slice()
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((st) => {
                        const time = new Date(st.startTime)
                        return (
                          <Link key={st.id} to={`/booking/${st.id}`} className="showtime-chip">
                            {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            <small>{formatVND(st.priceStandard)}</small>
                          </Link>
                        )
                      })}
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
}