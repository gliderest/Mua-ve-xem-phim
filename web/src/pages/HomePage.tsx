import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { movieService } from '@/services/api'
import { MovieCard } from '@/components/common/MovieCard'
import { AdPopup } from '@/components/AdPopup'
import { FilmStrip } from '@/components/svg/Brand'
import { IconPlay, IconArrowRight, IconMapPin, IconTicket } from '@/components/svg/Icons'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import type { Movie } from '@/types'

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

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
      <Hero />
      <SectionHeader title={<em>Đang chiếu</em>} sub="Phim đang chiếu tại các rạp CINÉRA" to="/movies" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {loading ? (
            <div className="loading-shimmer-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
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
          <div className="movies-grid">
            {comingSoon.slice(0, 4).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      </section>

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

function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero__eyebrow', { opacity: 0, y: 18, duration: 0.5 })
        .from('.hero__title-line', {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
        }, '-=0.3')
        .from('.hero__lede', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero__actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero__meta', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero__filmstrip', { opacity: 0, duration: 0.8 }, '-=0.2')
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <div className="container hero__inner">
        <span className="eyebrow hero__eyebrow">Rạp chiếu phim · Đặt vé · Trải nghiệm</span>
        <h1 className="hero__title">
          <span className="hero__title-line"><span>Điện ảnh</span></span>
          <span className="hero__title-line"><span>không chỉ là</span></span>
          <span className="hero__title-line"><span>một <em>bộ phim</em>.</span></span>
        </h1>
        <p className="hero__lede">
          CINÉRA mang đến trải nghiệm điện ảnh đẳng cấp: ghế ngồi thoải mái, âm thanh sống động,
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
        <div className="hero__meta">
          <div><strong>10+</strong> phim đang chiếu</div>
          <div><strong>3</strong> rạp trải nghiệm</div>
          <div><strong>24/7</strong> đặt vé trực tuyến</div>
        </div>
      </div>
      <div className="hero__filmstrip">
        <div className="hero__filmstrip-track">
          <FilmStrip count={12} />
          <FilmStrip count={12} />
        </div>
      </div>
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
            { name: 'CINÉRA Landmark 81', desc: 'Phòng chiếu cao nhất Việt Nam', place: 'Bình Thạnh, TP.HCM' },
            { name: 'CINÉRA Royal Center', desc: 'Không gian cổ điển hoài niệm', place: 'Tràng Tiền, Hà Nội' },
            { name: 'CINÉRA The Riviera', desc: 'Ghế massage cao cấp', place: 'Nguyễn Hữu Thọ, TP.HCM' },
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