import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { IconAlert, IconUser } from '@/components/svg/Icons'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (password.length < 3) {
      setError('Mật khẩu phải có ít nhất 3 ký tự.')
      return
    }
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="container">
        <form className="card auth-card" onSubmit={submit}>
          <h1 className="auth-card__title">
            Tạo tài khoản <em>CINÉRA</em>
          </h1>
          <p className="auth-card__sub">Đặt vé nhanh hơn, lưu vé điện tử ngay trong tài khoản.</p>

          {error && (
            <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
              <IconAlert size={20} /> {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="r-username">Tên đăng nhập</label>
            <input id="r-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: meomeo123" autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="r-email">Email</label>
            <input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="r-password">Mật khẩu</label>
            <input id="r-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </div>
          <div className="field">
            <label htmlFor="r-confirm">Xác nhận mật khẩu</label>
            <input id="r-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          </div>

          <button className="btn btn--gold btn--block btn--lg" disabled={loading}>
            <IconUser size={20} />
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </section>
  )
}