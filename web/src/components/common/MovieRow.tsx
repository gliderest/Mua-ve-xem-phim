import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { showtimeService } from '@/services/api'
import { PosterOrArt } from '@/components/common/MovieCard'
import { IconClock } from '@/components/svg/Icons'
import type { Movie, Showtime } from '@/types'

/**
 * Hàng phim trong danh sách Movies: poster nhỏ | thông tin | giờ chiếu badges.
 * Mỗi phim hiển thị giờ chiếu hiện tại (do admin quản lý).
 */
export function MovieRow({ movie }: { movie: Movie }) {
  const [times, setTimes] = useState<Showtime[]>([])

  useEffect(() => {
    showtimeService.byMovie(movie.id).then(setTimes)
  }, [movie.id])

  const isNow = movie.status === 'NOW_SHOWING'

  return (
    <article className="movie-row" data-reveal>
      <Link to={`/movies/${movie.id}`} className="movie-row__poster" aria-label={`Xem phim ${movie.title}`}>
        <PosterOrArt movie={movie} />
      </Link>

      <div className="movie-row__info">
        <h3 className="movie-row__title">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <div className="movie-row__meta">
          {movie.genre.slice(0, 3).join(' · ')}
          <span className="movie-row__dot" />
          <IconClock size={13} />
          {movie.durationMinutes} phút
          <span className="movie-row__dot" />
          <span className="movie-row__rating">
            {movie.rating > 0 ? `${movie.rating.toFixed(1)} ★` : '—'}
          </span>
        </div>
      </div>

      <div className="movie-row__times">
        {times.length > 0 ? (
          times.slice(0, 5).map((t) => {
            const hhmm = new Date(t.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            return (
              <Link key={t.id} to={`/booking/${t.id}`} className="showtime-chip" aria-label={`${movie.title} lúc ${hhmm}`}>
                {hhmm}
              </Link>
            )
          })
        ) : isNow ? (
          <span className="badge">Đang cập nhật lịch chiếu</span>
        ) : (
          <span className="badge badge--gold">Sắp chiếu</span>
        )}
        {times.length > 5 && (
          <Link to={`/movies/${movie.id}`} className="showtime-chip" style={{ color: 'var(--accent-strong)' }}>
            +{times.length - 5} suất
          </Link>
        )}
      </div>
    </article>
  )
}