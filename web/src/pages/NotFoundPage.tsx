import { Link } from 'react-router-dom'
import { FilmStrip } from '@/components/svg/Brand'

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ marginInline: 'auto', maxWidth: 220, marginBottom: 'var(--space-5)' }}>
          <FilmStrip count={3} />
        </div>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>Lỗi 404</span>
        <h1 className="section-title" style={{ marginTop: 'var(--space-3)', marginInline: 'auto' }}>
          Trang này <em>không có</em> trong phim.
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
          Có vẻ bạn đã lạc khỏi màn bạc. Hãy quay về rạp để khám phá những bộ phim mới.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-5)' }}>
          <Link to="/" className="btn btn--gold">Về trang chủ</Link>
          <Link to="/movies" className="btn btn--ghost">Xem phim</Link>
        </div>
      </div>
    </section>
  )
}