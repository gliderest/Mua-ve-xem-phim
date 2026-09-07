import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { usePageEnter } from '@/lib/gsap'

export function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll về đầu mỗi khi đổi trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  usePageEnter(mainRef, [pathname])

  return (
    <>
      <Navbar />
      <main ref={mainRef}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}