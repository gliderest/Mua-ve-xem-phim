import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { cinemaService, movieService, showtimeService } from '@/services/api'
import { MOCK_CONTACT_MESSAGES, MOCK_ROOMS, formatVND } from '@/data/mock'
import { IconEdit, IconTrash, IconChat, IconUser, IconTicket, IconEye, IconClock } from '@/components/svg/Icons'
import type { AdminStats, Cinema, Comment, ContactMessage, Movie, Showtime } from '@/types'

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
              Bảng điều khiển <em>CINEGA</em>
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
            <NavLink to="/admin/showtimes" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <IconClock size={18} /> Suất chiếu
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
              <Route path="showtimes" element={<AdminShowtimes />} />
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

function AdminShowtimes() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [times, setTimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [fMovie, setFMovie] = useState('')
  const [fCinema, setFCinema] = useState('')
  const [fRoom, setFRoom] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10))
  const [fTime, setFTime] = useState('19:30')
  const [fStd, setFStd] = useState('90000')
  const [fVip, setFVip] = useState('120000')

  const loadAll = async () => {
    const [m, c] = await Promise.all([movieService.list(), cinemaService.list()])
    setMovies(m)
    setCinemas(c)
    // Nạp suất chiếu mặc định cho phim đang chiếu (để bảng có dữ liệu sẵn)
    for (const mov of m.filter((x) => x.status === 'NOW_SHOWING').slice(0, 12)) {
      await showtimeService.byMovie(mov.id)
    }
    const t = await showtimeService.all()
    setTimes(t)
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rooms = MOCK_ROOMS.filter((r) => r.cinemaId === fCinema)
  const titleOf = (id: string) => movies.find((m) => m.id === id)?.title ?? id
  const cinemaOf = (id: string) => cinemas.find((c) => c.id === id)?.name ?? id
  const roomOf = (id: string) => MOCK_ROOMS.find((r) => r.id === id)?.name ?? id

  const flash = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3500)
  }

  const resetForm = () => {
    setEditingId(null)
    setFMovie('')
    setFCinema('')
    setFRoom('')
    setFDate(new Date().toISOString().slice(0, 10))
    setFTime('19:30')
    setFStd('90000')
    setFVip('120000')
  }

  const startEdit = (st: Showtime) => {
    setEditingId(st.id)
    setFMovie(st.movieId)
    setFCinema(st.cinemaId)
    setFRoom(st.roomId)
    setFDate(st.date)
    setFTime(new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }))
    setFStd(String(st.priceStandard))
    setFVip(String(st.priceVip))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fMovie || !fCinema || !fRoom || !fDate || !fTime) {
      flash('Vui lòng điền đầy đủ: phim, rạp, phòng, ngày, giờ.')
      return
    }
    setBusy(true)
    try {
      const start = new Date(`${fDate}T${fTime}:00`)
      const dur = movies.find((m) => m.id === fMovie)?.durationMinutes || 118
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + dur)
      const payload = {
        movieId: fMovie,
        cinemaId: fCinema,
        roomId: fRoom,
        date: fDate,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        priceStandard: Number(fStd) || 90000,
        priceVip: Number(fVip) || 120000,
      }
      if (editingId) {
        await showtimeService.update(editingId, payload)
        flash('Đã cập nhật suất chiếu.')
      } else {
        await showtimeService.add(payload)
        flash('Đã thêm suất chiếu mới.')
      }
      await loadAll()
      resetForm()
    } catch (err) {
      flash((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    await showtimeService.delete(id)
    await loadAll()
    setConfirmDelete(null)
    flash('Đã xóa suất chiếu.')
  }

  const sorted = times.slice().sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <h2>Quản lý suất chiếu</h2>
        <span className="badge">{times.length} suất hiện có</span>
      </div>
      {notice && <div className="alert alert--info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</div>}
<form className="card" onSubmit={submit} style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>
          {editingId ? `Sửa suất chiếu ${editingId.slice(-6)}` : 'Thêm suất chiếu mới'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-3)' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-movie">Phim *</label>
            <select id="as-movie" value={fMovie} onChange={(e) => { setFMovie(e.target.value); setFRoom('') }}>
              <option value="">— Chọn phim —</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'})
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-cinema">Rạp *</label>
            <select id="as-cinema" value={fCinema} onChange={(e) => { setFCinema(e.target.value); setFRoom('') }}>
              <option value="">— Chọn rạp —</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-room">Phòng *</label>
            <select id="as-room" value={fRoom} onChange={(e) => setFRoom(e.target.value)} disabled={!fCinema}>
              <option value="">— Chọn phòng —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-date">Ngày *</label>
            <input id="as-date" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-time">Giờ *</label>
            <input id="as-time" type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-std">Giá thường (VNĐ)</label>
            <input id="as-std" type="number" min={10000} step={5000} value={fStd} onChange={(e) => setFStd(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="as-vip">Giá VIP (VNĐ)</label>
            <input id="as-vip" type="number" min={10000} step={5000} value={fVip} onChange={(e) => setFVip(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn--gold" disabled={busy}>
            {busy ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm suất chiếu'}
          </button>
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={resetForm}>
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <ShowtimesTable
        loading={loading}
        sorted={sorted}
        titleOf={titleOf}
        cinemaOf={cinemaOf}
        roomOf={roomOf}
        confirmDelete={confirmDelete}
        onEdit={startEdit}
        onConfirm={setConfirmDelete}
        onDelete={remove}
      />
    </div>
  )
}

function ShowtimesTable(props: {
  loading: boolean
  sorted: Showtime[]
  titleOf: (id: string) => string
  cinemaOf: (id: string) => string
  roomOf: (id: string) => string
  confirmDelete: string | null
  onEdit: (st: Showtime) => void
  onConfirm: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { loading, sorted, titleOf, cinemaOf, roomOf, confirmDelete, onEdit, onConfirm, onDelete } = props
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Phim</th>
            <th>Rạp / Phòng</th>
            <th>Ngày</th>
            <th>Giờ chiếu</th>
            <th>Giá</th>
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
                  <td><div className="skeleton" style={{ height: 20 }} /></td>
                  <td />
                </tr>
              ))
            : sorted.length === 0
              ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="state-empty">Chưa có suất chiếu nào. Thêm suất đầu tiên bằng form bên trên.</div>
                    </td>
                  </tr>
                )
              : sorted.map((st) => (
                  <tr key={st.id}>
                    <td><strong>{titleOf(st.movieId)}</strong></td>
                    <td>
                      {cinemaOf(st.cinemaId)}
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{roomOf(st.roomId)}</div>
                    </td>
                    <td>{new Date(st.date + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</td>
                    <td>
                      <span className="badge badge--gold">
                        {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      {formatVND(st.priceStandard)}
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>VIP {formatVND(st.priceVip)}</div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label={`Sửa suất ${titleOf(st.movieId)}`} onClick={() => onEdit(st)}>
                          <IconEdit size={18} />
                        </button>
                        {confirmDelete === st.id ? (
                          <button className="btn btn--danger btn--sm" onClick={() => onDelete(st.id)}>
                            Chắc chắn?
                          </button>
                        ) : (
                          <button className="icon-btn icon-btn--del" aria-label={`Xóa suất ${titleOf(st.movieId)}`} onClick={() => onConfirm(st.id)}>
                            <IconTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
        </tbody>
      </table>
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