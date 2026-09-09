import { useState, type FormEvent } from 'react'
import { IconCheck, IconAlert, IconMapPin } from '@/components/svg/Icons'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      // Mock API — Phase 2 sẽ gọi POST /api/contact
      await new Promise((res) => setTimeout(res, 900))
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
      setError('Không thể gửi thông điệp. Vui lòng thử lại sau.')
    }
  }

  return (
    <section
      className="section section--page cinema-photo"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), url(https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80)',
      }}
    >
      <div className="container" style={{ maxWidth: 960 }}>
        <span className="eyebrow">Liên hệ</span>
        <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
          Chúng tôi <em>lắng nghe</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 'var(--space-2)' }}>
          Mọi thắc mắc về đặt vé, khiếu nại hoặc góp ý — CINEGA phản hồi trong vòng 24 giờ.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 'var(--space-3)', alignContent: 'start' }}>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>Hotline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>1900 5555 99 — 8h-22h hàng ngày</p>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>Email</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>support@cinera.vn</p>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <IconMapPin size={20} /> Trụ sở
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Tầng 68, Vinhomes Landmark 81, Bình Thạnh, TP.HCM
              </p>
            </div>
          </div>

          <form className="card" style={{ padding: 'var(--space-6)' }} onSubmit={submit}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Gửi thông điệp</h3>

            {status === 'success' && (
              <div className="alert alert--success" style={{ marginBottom: 'var(--space-4)' }}>
                <IconCheck size={20} /> Đã nhận thông điệp của bạn. Cảm ơn đã liên hệ CINEGA!
              </div>
            )}
            {status === 'error' && (
              <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
                <IconAlert size={20} /> {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="ct-name">Họ tên *</label>
              <input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="ct-email">Email *</label>
              <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="ct-msg">Nội dung *</label>
              <textarea
                id="ct-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Viết thông điệp của bạn..."
                required
              />
            </div>

            <button type="submit" className="btn btn--gold btn--block" disabled={status === 'loading'}>
              {status === 'loading' ? 'Đang gửi...' : 'Gửi thông điệp'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}