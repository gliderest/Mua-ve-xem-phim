import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cinemaService, movieService, showtimeService } from '@/services/api'
import { useReveal } from '@/lib/gsap'
import { IconSearch } from '@/components/svg/Icons'
import type { Cinema, Movie, Showtime } from '@/types'

const FILTERS: Array<{ key: 'ALL' | 'NOW_SHOWING' | 'COMING_SOON'; label: string }> = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'NOW_SHOWING', label: 'Đang chiếu' },
  { key: 'COMING_SOON', label: 'Sắp chiếu' },
]

export function MoviesPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [selectedCinema, setSelectedCinema] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [movies, setMovies] = useState<Movie[]>([])
  const [cinemaShowtimes, setCinemaShowtimes] = useState<Array<Showtime & { movie?: Movie }>>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('ALL')
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  useReveal(listRef, [movies, loading, filter, query, selectedCinema, selectedDate])

  useEffect(() => {
    cinemaService.list().then((c) => {
      setCinemas(c)
      if (c.length > 0 && !selectedCinema) setSelectedCinema(c[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedCinema) return
    setLoading(true)
    Promise.all([
      showtimeService.byCinema(selectedCinema, selectedDate),
      movieService.list(),
    ]).then(([sts, allMovies]) => {
      setCinemaShowtimes(sts)
      // Tab "Tất cả" phải hiện cả phim Đang chiếu + Sắp chiếu (không dùng phim ENDED)
      const unique: Movie[] = []
      const added = new Set<string>()
      for (const m of allMovies) {
        if (m.status === 'NOW_SHOWING' || m.status === 'COMING_SOON') {
          if (!added.has(m.id)) { added.add(m.id); unique.push(m) }
        }
      }
      setMovies(unique)
      setLoading(false)
    }).catch(() => { setMovies([]); setCinemaShowtimes([]); setLoading(false) })
  }, [selectedCinema, selectedDate])

  const showtimesByMovie = useMemo(() => {
    const map = new Map<string, Showtime[]>()
    for (const s of cinemaShowtimes) {
      const arr = map.get(s.movieId) ?? []
      arr.push(s)
      map.set(s.movieId, arr)
    }
    return map
  }, [cinemaShowtimes])

  const filtered = movies
  .filter((m) => {
    const okFilter = filter === 'ALL' || m.status === filter
    const q = query.trim().toLowerCase()
    const okQuery = !q || m.title.toLowerCase().includes(q) || m.genre.some((g) => g.toLowerCase().includes(q))
    return okFilter && okQuery
  })
  .sort((a, b) => {
    // Đang chiếu luôn trên, Sắp chiếu dưới; trong cùng nhóm theo rating giảm dần
    if (a.status !== b.status) return a.status === 'NOW_SHOWING' ? -1 : 1
    return (b.rating ?? 0) - (a.rating ?? 0)
  })

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return { value: d.toISOString().slice(0, 10), label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }), isToday: i === 0 }
  })

  const currentCinema = cinemas.find((c) => c.id === selectedCinema)

  return (
    <>
      <section className="section section--page page-hero--dark">
        <div className="container">
          <span className="eyebrow">Thư viện phim</span>
          <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
            Khám phá <em>danh mục phim</em>
          </h1>
          <div style={{ marginTop: 'var(--space-5)' }}>
            <span className="hero-label">Chọn rạp</span>
            <div className="cinema-card-list">
              {cinemas.map((c) => (
                <button
                  key={c.id}
                  className={`cinema-card-select${selectedCinema === c.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedCinema(c.id)}
                >
                  <div className="cinema-card-select__name">{c.name}</div>
                  <div className="cinema-card-select__addr">{c.district || c.address}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedCinema && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <span className="hero-label">Ngày xem</span>
              <div className="date-strip">
                {dates.map((d) => (
                  <button
                    key={d.value}
                    className={`date-pill${selectedDate === d.value ? ' is-selected' : ''}`}
                    onClick={() => setSelectedDate(d.value)}
                  >
                    {d.isToday ? 'Hôm nay' : d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCinema && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="showtime-chip-list">
                {FILTERS.map((f) => (
                  <button key={f.key} className={`showtime-chip${filter === f.key ? ' is-selected' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
              </div>
              <div className="field" style={{ marginBottom: 0, minWidth: 240, flex: 1, maxWidth: 340 }}>
                <label htmlFor="search">Tìm phim</label>
                <div style={{ position: 'relative' }}>
                  <input id="search" type="search" placeholder="Tên phim hoặc thể loại..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                  <IconSearch size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                </div>
              </div>
            </div>
          )}
          <div className="page-hero__fx" aria-hidden="true">
            <span className="page-hero__float page-hero__float--1" />
            <span className="page-hero__float page-hero__float--2" />
            <span className="page-hero__float page-hero__float--3" />
            <div className="page-hero__ticker">
              <div className="page-hero__ticker-track">
                <span>★ CINEGA</span><span>✦ ĐANG CHIẾU</span><span>★ NOW SHOWING</span><span>✦ SẮP CHIẾU</span><span>★ COMING SOON</span>
                <span>★ CINEGA</span><span>✦ ĐANG CHIẾU</span><span>★ NOW SHOWING</span><span>✦ SẮP CHIẾU</span><span>★ COMING SOON</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {!selectedCinema ? (
            <div className="state-empty"><p>Vui lòng chọn rạp để xem danh sách phim và lịch chiếu.</p></div>
          ) : loading ? (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-empty">
              <IconSearch size={44} />
              <p>{currentCinema ? `Không có phim nào tại ${currentCinema.name} ngày này.` : 'Không tìm thấy phim phù hợp.'}</p>
            </div>
          ) : (
            <div className="movie-list" ref={listRef}>
              {filtered.map((m) => <MovieRowWithShowtimes key={m.id} movie={m} showtimes={showtimesByMovie.get(m.id) ?? []} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function MovieRowWithShowtimes({ movie, showtimes }: { movie: Movie; showtimes: Showtime[] }) {
  const times = showtimes
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => ({ time: new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }), id: s.id }))

  return (
    <article className="movie-row">
      <Link to={`/movies/${movie.id}`} className="movie-row__poster" aria-label={`Xem phim ${movie.title}`}>
        {movie.posterUrl ? <img src={movie.posterUrl} alt={`Poster phim ${movie.title}`} loading="eager" /> : <div className="movie-row__poster-art" />}
        {movie.status === 'NOW_SHOWING' && <span className="movie-row__badge">Đang chiếu</span>}
      </Link>
      <div className="movie-row__info">
        <h3 className="movie-row__title">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <div className="movie-row__meta">
          {movie.genre.slice(0, 2).join(' · ')} · {movie.durationMinutes || 120} phút
        </div>
        {times.length > 0 ? (
          <div className="movie-row__showtimes">
            {times.map((t) => {
              // Suất thật (admin tạo) → đi thẳng đến đặt vé; suất mặc định → xem chi tiết phim
              const to = String(t.id).startsWith('syn-') ? `/movies/${movie.id}` : `/booking/${t.id}`
              return (
                <Link key={t.id} to={to} className="showtime-chip" aria-label={`${movie.title} lúc ${t.time}`}>
                  {t.time}
                </Link>
              )
            })}
          </div>
        ) : movie.status === 'COMING_SOON' ? (
          <span className="badge badge--gold">Sắp chiếu</span>
        ) : (
          <span className="badge">Chưa có suất ngày này</span>
        )}
      </div>
    </article>
  )
}
