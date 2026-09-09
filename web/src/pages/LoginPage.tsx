import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { IconAlert, IconUser } from '@/components/svg/Icons'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(username, password)
      navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true })
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
            Chào mừng <em>trở lại</em>
          </h1>
          <p className="auth-card__sub">Đăng nhập CINEGA để đặt vé và quản lý vé của bạn.</p>

          {error && (
            <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
              <IconAlert size={20} /> {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: minh (demo)"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập ít nhất 3 ký tự (demo)"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn btn--gold btn--block btn--lg" disabled={loading}>
            <IconUser size={20} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="auth-switch">
            Chưa có tài khoản?{' '}
            <Link to="/register">Tạo tài khoản</Link>
          </p>
        </form>
      </div>
    </section>
  )
}