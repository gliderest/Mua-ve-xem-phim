import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { movieService, cinemaService } from '@/services/api'
import { tmdbService } from '@/services/tmdb'
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
  const [video, setVideo] = useState<{ youtubeKey: string; type: string } | null>(null)

  // Lấy trailer YouTube từ TMDB khi có tmdbId
  useEffect(() => {
    if (!movie?.tmdbId) return
    let alive = true
    tmdbService
      .videos(movie.tmdbId)
      .then((v) => alive && setVideo(v))
      .catch(() => alive && setVideo(null))
    return () => {
      alive = false
    }
  }, [movie?.tmdbId])

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
      <section
        className="detail-hero detail-hero--full"
        style={
          movie.backdropUrl
            ? { backgroundImage: `linear-gradient(90deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.6) 45%, rgba(10,8,6,0.25) 100%), url(${movie.backdropUrl})` }
            : undefined
        }
      >
        <div className="container detail-hero__inner">
          <span className="badge badge--gold">
            {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
          </span>
          <h1 className="detail-info__title">{movie.title}</h1>
          {movie.originalTitle && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>
              {movie.originalTitle}
            </p>
          )}
          <div className="detail-info__sub">
            <span>{movie.genre.join(' · ')}</span>
            {movie.rated && <span>{movie.rated}</span>}
            {movie.language && <span>{movie.language}</span>}
            <span>{movie.durationMinutes} phút</span>
          </div>
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
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container detail-layout">
          <div className="detail-info">
            <p className="detail-info__desc detail-info__desc--full">{movie.description}</p>
            <dl className="detail-info__meta">
              {movie.director && (
                <div className="detail-info__meta-item">
                  <dt>Đạo diễn</dt>
                  <dd>{movie.director}</dd>
                </div>
              )}
              {movie.cast.length > 0 && (
                <div className="detail-info__meta-item">
                  <dt>Diễn viên</dt>
                  <dd>{movie.cast.join(', ')}</dd>
                </div>
              )}
              <div className="detail-info__meta-item">
                <dt>Thời lượng</dt>
                <dd>{movie.durationMinutes} phút</dd>
              </div>
              <div className="detail-info__meta-item">
                <dt>Khởi chiếu</dt>
                <dd>{new Date(movie.releaseDate + 'T00:00:00').toLocaleDateString('vi-VN')}</dd>
              </div>
              {movie.rating > 0 && (
                <div className="detail-info__meta-item">
                  <dt>Đánh giá TMDB</dt>
                  <dd>{movie.rating.toFixed(1)} ★ ({movie.reviewCount.toLocaleString('vi-VN')} lượt)</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="detail-trailer">
            {video ? (
              <iframe
                className="detail-trailer__frame"
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeKey}`}
                title="Trailer phim"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="detail-trailer__fallback">
                <PosterArt movie={movie} />
                <p className="detail-trailer__note">Chưa có trailer từ TMDB cho phim này.</p>
              </div>
            )}
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
                    <h3 className="showtime-card__cinema">{cinema?.name ?? 'CINEGA'}</h3>
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