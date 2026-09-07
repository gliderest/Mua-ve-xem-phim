import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { movieService } from '@/services/api'
import { MOCK_CONTACT_MESSAGES } from '@/data/mock'
import { IconEdit, IconTrash, IconChat, IconUser, IconTicket, IconEye } from '@/components/svg/Icons'
import type { AdminStats, Comment, ContactMessage, Movie } from '@/types'

/* ============================================================
   Admin Dashboard — giao diện tự thiết kế, không template.
   ============================================================ */
export function AdminDashboardPage() {
  return (
    <section className="section section--page">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Quản trị</span>
            <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Bảng điều khiển <em>CINÉRA</em>
            </h1>
          </div>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <IconEye size={18} /> Thống kê
            </NavLink>
            <NavLink to="/admin/movies" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <IconTicket size={18} /> Phim
            </NavLink>
            <NavLink to="/admin/comments" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <IconChat size={18} /> Bình luận
            </NavLink>
            <NavLink to="/admin/contact" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <IconUser size={18} /> Liên hệ
            </NavLink>
          </aside>

          <div>
            <Routes>
              <Route index element={<AdminStats />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="contact" element={<AdminContact />} />
            </Routes>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminStats() {
  const [movies, setMovies] = useState<Movie[]>([])
  useEffect(() => {
    movieService.list().then(setMovies)
  }, [])

  const stats: AdminStats = useMemo(
    () => ({
      totalViews: 35821,
      totalUsers: 523,
      totalMovies: movies.length,
      totalBookings: 1245,
      paidBookings: 987,
      pendingBookings: 64,
    }),
    [movies],
  )

  return (
    <div>
      <div className="stat-grid">
        {[
          { label: 'Tổng lượt xem', value: stats.totalViews.toLocaleString('vi-VN'), hint: 'website_views' },
          { label: 'Người dùng', value: stats.totalUsers, hint: 'users' },
          { label: 'Phim', value: stats.totalMovies, hint: 'movies' },
          { label: 'Tổng đặt vé', value: stats.totalBookings, hint: 'bookings' },
          { label: 'Vé đã thanh toán', value: stats.paidBookings, hint: 'PAID' },
          { label: 'Đang chờ thanh toán', value: stats.pendingBookings, hint: 'PENDING_PAYMENT' },
        ].map((s) => (
          <article className="card stat-card" key={s.label}>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__hint">{s.hint}</div>
          </article>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Phim đang chiếu gần đây</h3>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {movies.slice(0, 5).map((m) => (
            <div key={m.id} className="summary-row">
              <span>{m.title}</span>
              <strong>{m.status === 'NOW_SHOWING' ? 'Đang chiếu' : m.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã chiếu'}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ st }: { st: Movie['status'] }) {
  if (st === 'NOW_SHOWING') return <span className="badge badge--green">Đang chiếu</span>
  if (st === 'COMING_SOON') return <span className="badge badge--gold">Sắp chiếu</span>
  return <span className="badge">Đã chiếu</span>
}

function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    movieService.list().then(setMovies).finally(() => setLoading(false))
  }, [])

  const remove = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id))
    setNotice('Đã xóa phim (mock).')
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <h2>Quản lý phim</h2>
        <button className="btn btn--gold btn--sm" onClick={() => setNotice('Tính năng tạo phim mở form ở Phase 2 khi kết nối backend.')}>
          + Thêm phim
        </button>
      </div>
      {notice && <div className="alert alert--info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Phim</th>
              <th>Thể loại</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: 22 }} /></td>
                    <td><div className="skeleton" style={{ height: 22 }} /></td>
                    <td><div className="skeleton" style={{ height: 22 }} /></td>
                    <td><div className="skeleton" style={{ height: 22 }} /></td>
                    <td><div className="skeleton" style={{ height: 22 }} /></td>
                    <td />
                  </tr>
                ))
              : movies.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.title}</strong></td>
                    <td>{m.genre.join(', ')}</td>
                    <td>{m.durationMinutes} phút</td>
                    <td><StatusBadge st={m.status} /></td>
                    <td>{m.rating > 0 ? `${m.rating.toFixed(1)} ★` : '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label={`Sửa ${m.title}`}>
                          <IconEdit size={18} />
                        </button>
                        <button className="icon-btn icon-btn--del" aria-label={`Xóa ${m.title}`} onClick={() => remove(m.id)}>
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  // Gom review/comment TRỰC TIẾP từ TMDB của các phim đang chiếu
  useEffect(() => {
    ;(async () => {
      try {
        const movies = await movieService.list()
        const all: Comment[] = []
        for (const m of movies.slice(0, 4)) {
          try {
            const cs = await movieService.comments(m.id)
            all.push(...cs)
          } catch {
            // phim không có review thì bỏ qua
          }
        }
        setComments(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const remove = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
    setNotice('Đã xóa khỏi danh sách hiển thị. (Backend Phase 2 sẽ xóa vĩnh viễn.)')
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2>Bình luận &amp; đánh giá (TMDB)</h2>
        <span className="badge">{comments.length} bình luận</span>
      </div>
      {notice && <div className="alert alert--info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người gửi</th>
              <th>Nội dung</th>
              <th>Đánh giá</th>
              <th>Ngày</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: 20 }} /></td>
                    <td><div className="skeleton" style={{ height: 20 }} /></td>
                    <td><div className="skeleton" style={{ height: 20 }} /></td>
                    <td><div className="skeleton" style={{ height: 20 }} /></td>
                    <td />
                  </tr>
                ))
              : comments.length === 0
                ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="state-empty">Chưa có đánh giá công khai nào từ TMDB.</div>
                      </td>
                    </tr>
                  )
                : comments.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{c.email || 'TMDB'}</div>
                      </td>
                      <td>{c.content.slice(0, 120)}{c.content.length > 120 ? '…' : ''}</td>
                      <td>{c.rating > 0 ? '★'.repeat(Math.min(c.rating, 5)) : '—'}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button className="icon-btn icon-btn--del" aria-label={`Xóa bình luận của ${c.name}`} onClick={() => remove(c.id)}>
                          <IconTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_CONTACT_MESSAGES)
  const [notice, setNotice] = useState<string | null>(null)

  const resolve = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'RESOLVED' as const } : m)))
    setNotice('Đã đánh dấu đã xử lý (mock).')
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2>Thông điệp liên hệ</h2>
        <span className="badge">{messages.filter((m) => m.status === 'NEW').length} mới</span>
      </div>
      {notice && <div className="alert alert--info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</div>}

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {messages.map((m) => (
          <article className="card" key={m.id} style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <strong>{m.name}</strong>
                <span style={{ color: 'var(--text-faint)', marginLeft: 8 }}>{m.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${m.status === 'NEW' ? 'badge--red' : m.status === 'READ' ? 'badge--gold' : 'badge--green'}`}>
                  {m.status}
                </span>
                {m.status !== 'RESOLVED' && (
                  <button className="btn btn--surface btn--sm" onClick={() => resolve(m.id)}>
                    Đã xử lý
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>{m.message}</p>
            <div style={{ color: 'var(--text-faint)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              {new Date(m.createdAt).toLocaleString('vi-VN')}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}