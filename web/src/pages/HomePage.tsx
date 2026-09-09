import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { movieService } from '@/services/api'
import { MovieCard } from '@/components/common/MovieCard'
import { AdPopup } from '@/components/AdPopup'
import { PosterArt } from '@/components/svg/PosterArt'
import { IconPlay, IconArrowRight, IconArrowLeft, IconMapPin, IconTicket, IconClock } from '@/components/svg/Icons'
import { gsap, prefersReducedMotion, useReveal } from '@/lib/gsap'
import type { Movie } from '@/types'

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  useReveal(listRef, [movies, loading])

  useEffect(() => {
    movieService
      .list()
      .then((m) => setMovies(m.filter((x) => x.status !== 'ENDED')))
      .finally(() => setLoading(false))
  }, [])

  const nowShowing = movies.filter((m) => m.status === 'NOW_SHOWING')
  const comingSoon = movies.filter((m) => m.status === 'COMING_SOON')

  return (
    <>
      <Hero movies={nowShowing.slice(0, 8)} />
      <SectionHeader title={<em>Đang chiếu</em>} sub="Phim đang chiếu tại các rạp CINEGA" to="/movies" />
      <div ref={listRef}>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            {loading ? (
              <div className="loading-shimmer-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" />
                ))}
              </div>
            ) : nowShowing.length === 0 ? (
              <div className="state-empty">Chưa có phim đang chiếu — quản trị viên đang cập nhật lịch chiếu.</div>
            ) : (
              <div className="movies-grid">
                {nowShowing.slice(0, 8).map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>
        </section>

        <CinemaStrip />

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Sắp ra mắt</span>
                <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
                  Những bộ phim <em>đáng mong đợi</em>
                </h2>
              </div>
            </div>
            {comingSoon.length > 0 ? (
              <div className="movies-grid">
                {comingSoon.slice(0, 4).map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            ) : (
              <div className="state-empty">Sẽ cập nhật phim sắp chiếu từ TMDB.</div>
            )}
          </div>
        </section>
      </div>

      <CtaBanner />
      <AdPopup />
    </>
  )
}

function SectionHeader({ title, sub, to }: { title: React.ReactNode; sub: string; to: string }) {
  return (
    <section className="section section--page">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Có gì mới</span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              {title}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>{sub}</p>
          </div>
          <Link to={to} className="btn btn--ghost">
            Tất cả phim <IconArrowRight size={18} className="btn__arrow" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Hero({ movies }: { movies: Movie[] }) {
  const heroRef = useRef<HTMLElement>(null)
  const n = movies.length
  const [idx, setIdx] = useState(0)

  // Autoplay: tự chuyển slide mỗi 6 giây (tắt khi reduced-motion)
  useEffect(() => {
    if (n <= 1 || prefersReducedMotion()) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % n), 6000)
    return () => window.clearInterval(id)
  }, [n])

  const prev = () => setIdx((i) => (i - 1 + n) % n)
  const next = () => setIdx((i) => (i + 1) % n)

  // Entrance một lần khi mount
  useEffect(() => {
    const el = heroRef.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.hero__shell', { opacity: 0, y: 22, duration: 0.8, ease: 'power3.out' })
      gsap.from('.hero__controls', { opacity: 0, x: 14, duration: 0.6, delay: 0.7 })
    }, el)
    return () => ctx.revert()
  }, [])

  const m = n > 0 ? movies[((idx % n) + n) % n] : null

  return (
    <section className={`hero hero--slide${n > 1 ? ' has-slides' : ''}`} ref={heroRef}>
      {n > 0 && (
        <div className="hero__slides" aria-hidden="true">
          {movies.map((movie, i) => (
            <div className={`hero__slide${i === idx ? ' is-active' : ''}`} key={movie.id}>
              {movie.backdropUrl ? (
                <img src={movie.backdropUrl} alt="" className="hero__slide-img" loading={i < 2 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
              ) : movie.posterUrl ? (
                <img src={movie.posterUrl} alt="" className="hero__slide-img" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <div className="hero__slide-art">
                  <PosterArt movie={movie} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="container hero__inner">
        <div className="hero__shell">
          {m ? (
            <div key={idx} className="hero__slide-copy anim-fade-up">
              <span className="eyebrow hero__eyebrow">
                Rạp chiếu phim · {(m.genre[0] || 'Đang chiếu').toUpperCase()}
              </span>
              <h1 className="hero__title">
                <span className="hero__title-line"><span>{m.title}</span></span>
              </h1>
              <p className="hero__lede">
                {m.description.slice(0, 180)}
                {m.description.length > 180 ? '…' : ''}
              </p>
              <div className="hero__actions">
                <Link to={`/movies/${m.id}`} className="btn btn--gold btn--lg">
                  <IconPlay size={20} /> Đặt vé ngay
                </Link>
                <Link to={`/movies/${m.id}#showtimes`} className="btn btn--ghost btn--lg">
                  <IconClock size={20} /> Lịch chiếu
                </Link>
              </div>
              <div className="hero__meta">
                <div><strong>{m.durationMinutes}</strong> phút</div>
                <div><strong>{m.rating > 0 ? m.rating.toFixed(1) : '—'}</strong> đánh giá TMDB</div>
                <div><strong>{m.genre.length}</strong> thể loại</div>
              </div>
            </div>
          ) : (
            <div className="hero__slide-copy">
              <span className="eyebrow hero__eyebrow">Rạp chiếu phim · Đặt vé · Trải nghiệm</span>
              <h1 className="hero__title">
                <span className="hero__title-line"><span>Điện ảnh</span></span>
                <span className="hero__title-line"><span>không chỉ là</span></span>
                <span className="hero__title-line"><span>một <em>bộ phim</em>.</span></span>
              </h1>
              <p className="hero__lede">
                CINEGA mang đến trải nghiệm điện ảnh đẳng cấp: ghế ngồi thoải mái, âm thanh sống động,
                đặt vé và thanh toán chuyển khoản trong vài phút.
              </p>
              <div className="hero__actions">
                <Link to="/movies" className="btn btn--gold btn--lg">
                  <IconPlay size={20} /> Đặt vé ngay
                </Link>
                <Link to="/cinemas" className="btn btn--ghost btn--lg">
                  <IconMapPin size={20} /> Hệ thống rạp
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {n > 1 && (
        <div className="hero__controls">
          <button className="hero__arrow" onClick={prev} aria-label="Phim trước">
            <IconArrowLeft size={22} />
          </button>
          <button className="hero__arrow" onClick={next} aria-label="Phim tiếp theo">
            <IconArrowRight size={22} />
          </button>
        </div>
      )}

      {n > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Chọn phim đang chiếu">
          {movies.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === idx ? ' is-active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Phim ${i + 1}`}
              aria-current={i === idx || undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CinemaStrip() {
  return (
    <section className="section" style={{ background: 'var(--bg-deep)', borderBlock: '1px solid var(--border)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Hệ thống rạp</span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Không gian <em>đậm chất điện ảnh</em>
            </h2>
          </div>
          <Link to="/cinemas" className="btn btn--ghost">
            Xem danh sách <IconArrowRight size={18} className="btn__arrow" />
          </Link>
        </div>
        <div className="showtimes-grid">
          {[
            { name: 'CINEGA Landmark 81', desc: 'Phòng chiếu cao nhất Việt Nam', place: 'Bình Thạnh, TP.HCM' },
            { name: 'CINEGA Royal Center', desc: 'Không gian cổ điển hoài niệm', place: 'Tràng Tiền, Hà Nội' },
            { name: 'CINEGA The Riviera', desc: 'Ghế massage cao cấp', place: 'Nguyễn Hữu Thọ, TP.HCM' },
          ].map((c) => (
            <article className="card showtime-card" key={c.name}>
              <div className="showtime-card__head">
                <h3 className="showtime-card__cinema">{c.name}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{c.desc}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <IconMapPin size={14} /> {c.place}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="card"
          style={{
            padding: 'var(--space-7)',
            textAlign: 'center',
            background: 'linear-gradient(160deg, var(--surface-2), var(--bg-secondary))',
            borderColor: 'var(--border-accent)',
          }}
        >
          <h2 className="section-title" style={{ marginInline: 'auto' }}>
            Sẵn sàng cho một <em>đêm điện ảnh</em>?
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '46ch', margin: 'var(--space-4) auto' }}>
            Chọn phim, chọn ghế, thanh toán qua VietQR — vé điện tử sẽ xuất hiện ngay sau khi giao dịch hoàn tất.
          </p>
          <Link to="/movies" className="btn btn--gold btn--lg">
            <IconTicket size={20} /> Mua vé ngay
          </Link>
        </div>
      </div>
    </section>
  )
}