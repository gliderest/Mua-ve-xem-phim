import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { BrandText, LogoMark } from '@/components/svg/Brand'
import { IconClose, IconMenu, IconTicket, IconUser } from '@/components/svg/Icons'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'

const LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/movies', label: 'Phim' },
  { to: '/cinemas', label: 'Rạp' },
  { to: '/about', label: 'Về chúng tôi' },
  { to: '/contact', label: 'Liên hệ' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container nav__inner">
          <Link to="/" className="nav__logo" aria-label="CINEGA — Trang chủ">
            <LogoMark size={30} />
            <BrandText />
          </Link>

          <nav className="nav__links" aria-label="Điều hướng chính">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
                Quản trị
              </NavLink>
            )}
          </nav>

          <div className="nav__actions">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/my-tickets" className="btn btn--ghost btn--sm">
                  <IconTicket size={18} /> Vé của tôi
                </Link>
                <button onClick={logout} className="btn btn--surface btn--sm">
                  <IconUser size={18} /> {user.username}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn--gold btn--sm">
                  Tạo tài khoản
                </Link>
              </>
            )}
            <button
              className="nav__burger"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <IconMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav__drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true">
        <button className="nav__drawer-close icon-btn" onClick={() => setOpen(false)} aria-label="Đóng menu">
          <IconClose size={22} />
        </button>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        {user ? (
          <Link to="/my-tickets" onClick={() => setOpen(false)}>
            Vé của tôi
          </Link>
        ) : (
          <Link to="/login" onClick={() => setOpen(false)}>
            Đăng nhập
          </Link>
        )}
      </div>
    </>
  )
}