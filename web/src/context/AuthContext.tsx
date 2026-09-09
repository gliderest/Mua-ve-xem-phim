import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/api'
import type { User } from '@/types'
interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (username: string, email: string, password: string) => Promise<User>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    authService
      .me()
      .then((u) => alive && setUser(u))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const u = await authService.login(email, password)
    setUser(u)
    return u
  }

  const register = async (username: string, email: string, password: string) => {
    const u = await authService.register(username, email, password)
    setUser(u)
    return u
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng trong <AuthProvider>')
  return ctx
}

/** Guard route: cần đăng nhập */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="skeleton" style={{ height: 200 }} />
  if (!user) {
    window.location.href = '/login'
    return null
  }
  return <>{children}</>
}

/** Guard route: cần ADMIN */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="skeleton" style={{ height: 200 }} />
  if (!user) {
    window.location.href = '/login'
    return null
  }
  if (!isAdmin) {
    window.location.href = '/'
    return null
  }
  return <>{children}</>
}