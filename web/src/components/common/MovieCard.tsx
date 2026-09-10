import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '@/types'
import { PosterArt } from '@/components/svg/PosterArt'
import { IconStar, IconClock, IconArrowRight } from '@/components/svg/Icons'
import { formatVND } from '@/data/mock'

const STATUS_LABEL: Record<Movie['status'], { label: string; cls: string }> = {
  NOW_SHOWING: { label: 'Đang chiếu', cls: 'badge--green' },
  COMING_SOON: { label: 'Sắp chiếu', cls: 'badge--gold' },
  ENDED: { label: 'Đã chiếu', cls: '' },
}

/**
 * Poster: ảnh thật TMDB. Chỉ fallback về SVG vẽ tay khi ẢNH THẬT SỰ LỖI (onError)
 * hoặc treo quá lâu chưa tải (12s). Khi ảnh đã load xong → GIỮ ẢNH vĩnh viễn,
 * timer fallback bị hủy (đây là bug trước: ảnh hiện rồi 5s sau biến mất).
 */
export function PosterOrArt({ movie }: { movie: Movie }) {
  const [err, setErr] = useState(false)
  const [slow, setSlow] = useState(false)
  const loadedRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!movie.posterUrl || err || loadedRef.current) return
    timerRef.current = window.setTimeout(() => setSlow(true), 12000)
    return () => window.clearTimeout(timerRef.current)
  }, [movie.posterUrl, err])

  const handleLoad = () => {
    loadedRef.current = true
    window.clearTimeout(timerRef.current)
    setSlow(false)
    setErr(false)
  }

  const handleError = () => {
    window.clearTimeout(timerRef.current)
    setErr(true)
  }

  if (movie.posterUrl && !err && !slow) {
    return (
      <img
        src={movie.posterUrl}
        alt={`Poster phim ${movie.title}`}
        loading="eager"
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={handleLoad}
        className="poster-art"
      />
    )
  }
  return <PosterArt movie={movie} />
}

export function MovieCard({ movie }: { movie: Movie }) {
  const st = STATUS_LABEL[movie.status]
  return (
    <article className="movie-card" data-reveal>
      <div className="movie-card__poster">
        <PosterOrArt movie={movie} />
        <div className="movie-card__badges">
          <span className={`badge ${st.cls}`}>{st.label}</span>
          <span className="badge">{movie.rated || movie.language || '2D'}</span>
        </div>
        <div className="movie-card__overlay">
          <Link
            to={`/movies/${movie.id}`}
            className="btn btn--gold btn--sm"
            aria-label={`Xem chi tiết ${movie.title}`}
          >
            Xem chi tiết <IconArrowRight size={16} className="btn__arrow" />
          </Link>
        </div>
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <div className="movie-card__meta">
          <span>{movie.genre.join(' · ') || 'Phim'}</span>
          <span>
            <IconClock size={14} /> {movie.durationMinutes} phút
          </span>
        </div>
        <p className="movie-card__desc">{movie.description}</p>
        <div className="movie-card__footer">
          <div className="rating">
            <span className="rating__stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar
                  key={i}
                  size={14}
                  fill={i < Math.round(movie.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </span>
            <span className="rating__value">{movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</span>
            {movie.reviewCount > 0 && (
              <span className="rating__count">({movie.reviewCount.toLocaleString('vi-VN')})</span>
            )}
          </div>
          {movie.status === 'NOW_SHOWING' ? (
            <Link to={`/movies/${movie.id}`} className="btn btn--surface btn--sm">
              Đặt vé
            </Link>
          ) : (
            <span className="badge">{formatVND(90000)}</span>
          )}
        </div>
      </div>
    </article>
  )
}