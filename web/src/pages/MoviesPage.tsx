import { useEffect, useState } from 'react'
import { movieService } from '@/services/api'
import { MovieCard } from '@/components/common/MovieCard'
import { IconSearch } from '@/components/svg/Icons'
import type { Movie } from '@/types'

const FILTERS: Array<{ key: 'ALL' | 'NOW_SHOWING' | 'COMING_SOON'; label: string }> = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'NOW_SHOWING', label: 'Đang chiếu' },
  { key: 'COMING_SOON', label: 'Sắp chiếu' },
]

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('ALL')
  const [query, setQuery] = useState('')

  useEffect(() => {
    movieService.list().then(setMovies).finally(() => setLoading(false))
  }, [])

  const filtered = movies.filter((m) => {
    const okFilter = filter === 'ALL' || m.status === filter
    const q = query.trim().toLowerCase()
    const okQuery = !q || m.title.toLowerCase().includes(q) || m.genre.some((g) => g.toLowerCase().includes(q))
    return okFilter && okQuery
  })

  return (
    <>
      <section className="section section--page">
        <div className="container">
          <span className="eyebrow">Thư viện phim</span>
          <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
            Khám phá <em>danh mục phim</em>
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="showtime-chip-list">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`showtime-chip${filter === f.key ? ' is-selected' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="field" style={{ marginBottom: 0, minWidth: 240, flex: 1, maxWidth: 340 }}>
              <label htmlFor="search">Tìm phim</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="search"
                  type="search"
                  placeholder="Tên phim hoặc thể loại..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ paddingLeft: '2.6rem' }}
                />
                <IconSearch size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {loading ? (
            <div className="loading-shimmer-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-empty">
              <IconSearch size={44} />
              <p>Không tìm thấy phim phù hợp với bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="movies-grid">
              {filtered.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}