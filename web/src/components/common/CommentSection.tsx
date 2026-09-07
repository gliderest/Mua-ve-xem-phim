import { useEffect, useState } from 'react'
import { movieService } from '@/services/api'
import { RatingStars } from '@/components/common/RatingStars'
import { IconCheck, IconAlert } from '@/components/svg/Icons'
import type { Comment } from '@/types'

/** Mục #17 kiến trúc: form bình luận + rating công khai. */
export function CommentSection({ movieId }: { movieId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    movieService
      .comments(movieId)
      .then(setComments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [movieId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitMsg(null)

    // Server-side validation sẽ làm ở Phase 2 (Zod). Demo: validate cơ bản.
    if (name.trim().length < 2) {
      setSubmitError('Vui lòng nhập tên của bạn.')
      setSubmitting(false)
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setSubmitError('Email không hợp lệ.')
      setSubmitting(false)
      return
    }
    if (content.trim().length < 4) {
      setSubmitError('Nội dung bình luận quá ngắn.')
      setSubmitting(false)
      return
    }

    try {
      await new Promise((res) => setTimeout(res, 700))
      const newComment: Comment = {
        id: `cm${Date.now()}`,
        movieId,
        name: name.trim(),
        email: email.trim(),
        content: content.trim(),
        rating,
        createdAt: new Date().toISOString(),
      }
      setComments((prev) => [newComment, ...prev])
      setSubmitMsg('Bình luận của bạn đã được đăng tải. Cảm ơn bạn!')
      setName('')
      setEmail('')
      setContent('')
    } catch {
      setSubmitError('Không thể gửi bình luận. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
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
            {submitError && (
              <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
                <IconAlert size={20} /> {submitError}
              </div>
            )}
            {submitMsg && (
              <div className="alert alert--success" style={{ marginBottom: 'var(--space-4)' }}>
                <IconCheck size={20} /> {submitMsg}
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
              <label>Đánh giá *</label>
              <RatingStars value={rating} onSelect={setRating} interactive />
            </div>
            <div className="field">
              <label htmlFor="c-content">Nội dung *</label>
              <textarea id="c-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Cảm nhận của bạn về bộ phim..." required />
            </div>
            <button type="submit" className="btn btn--gold btn--block" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}