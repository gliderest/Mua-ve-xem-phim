import { useEffect, useState } from 'react'
import { movieService } from '@/services/api'
import { RatingStars } from '@/components/common/RatingStars'
import { IconCheck } from '@/components/svg/Icons'

/** Bình luận lấy trực tiếp từ TMDB reviews. Form gửi sẽ bật khi có backend (Phase 2). */
export function CommentSection({ movieId }: { movieId: string }) {
  const [comments, setComments] = useState<Awaited<ReturnType<typeof movieService.comments>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const load = () => {
    setLoading(true)
    movieService
      .comments(movieId)
      .then(setComments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [movieId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || content.trim().length < 4) {
      return
    }
    // Chưa có backend để lưu bình luận (Phase 2) — ghi nhận mong muốn gửi.
    setSubmitted(true)
    setName('')
    setEmail('')
    setContent('')
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Bình luận &amp; đánh giá</span>
            <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
              Khán giả <em>nói gì</em>
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
          <div className="comment-list">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)
            ) : comments.length === 0 ? (
              <div className="state-empty">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
            ) : (
              comments.map((c) => (
                <article className="card comment-item" key={c.id}>
                  <div className="comment-item__head">
                    <span className="comment-item__name">{c.name}</span>
                    <span className="comment-item__date">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <RatingStars value={c.rating} />
                  <p className="comment-item__content" style={{ marginTop: 'var(--space-2)' }}>
                    {c.content}
                  </p>
                </article>
              ))
            )}
            {error && <div className="alert alert--error">{error}</div>}
          </div>

          <form className="card comment-form" onSubmit={submit}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Để lại nhận xét</h3>
            {submitted && (
              <div className="alert alert--success" style={{ marginBottom: 'var(--space-4)' }}>
                <IconCheck size={20} /> Đã nhận ghi nhận của bạn. Bình luận &amp; đánh giá hệ thống CINEGA sẽ được lưu khi backend hoàn thiện (Phase 2).
              </div>
            )}
            <div className="field">
              <label htmlFor="c-name">Tên của bạn *</label>
              <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn A" required />
            </div>
            <div className="field">
              <label htmlFor="c-email">Email *</label>
              <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="c-content">Nội dung *</label>
              <textarea id="c-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Cảm nhận của bạn về bộ phim..." required />
            </div>
            <button type="submit" className="btn btn--gold btn--block">
              Gửi bình luận
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}