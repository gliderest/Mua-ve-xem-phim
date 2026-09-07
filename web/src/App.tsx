import { Component, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAdmin } from '@/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { MoviesPage } from '@/pages/MoviesPage'
import { MovieDetailPage } from '@/pages/MovieDetailPage'
import { BookingPage } from '@/pages/BookingPage'
import { PaymentPage } from '@/pages/PaymentPage'
import { TicketPage } from '@/pages/TicketPage'
import { CinemasPage } from '@/pages/CinemasPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { MyTicketsPage } from '@/pages/MyTicketsPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'

/** ErrorBoundary toàn cục — bắt lỗi runtime, hiển thị thân thiện thay vì "Uncaught" */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message }
  }

  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error('CINÉRA caught error:', err)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section">
          <div className="container" style={{ maxWidth: 620, textAlign: 'center' }}>
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Đã có lỗi</span>
            <h1 className="section-title" style={{ marginTop: 'var(--space-3)', marginInline: 'auto' }}>
              Có sự cố, đừng lo — <em>phim vẫn chiếu</em>.
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
              {this.state.message || 'Giao diện gặp lỗi ngoài dự kiến.'}
            </p>
            <button
              className="btn btn--gold btn--lg"
              style={{ marginTop: 'var(--space-5)' }}
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/booking/:showtimeId" element={<BookingPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/ticket/:bookingId" element={<TicketPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <AdminDashboardPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}