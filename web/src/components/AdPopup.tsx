import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_AD } from '@/data/mock'
import { useCookie } from '@/hooks/useCountdown'
import { IconClose, IconArrowRight } from '@/components/svg/Icons'
import { PosterArt } from '@/components/svg/PosterArt'

/**
 * Popup quảng cáo trên trang chủ.
 * Kiến trúc #18: hiện sau 60s, đóng ghi cookie `movie_ad_closed`.
 * Dev: dùng `?ad=now` để hiện ngay lập tức khi demo.
 */
export function AdPopup() {
  const cookie = useCookie('movie_ad_closed')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (cookie.get()) return
    // Cho phép demo nhanh bằng query string
    const isDemoNow = new URLSearchParams(window.location.search).get('ad') === 'now'
    const timer = window.setTimeout(() => setOpen(true), isDemoNow ? 300 : 60_000)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const close = () => {
    cookie.set('true')
    setOpen(false)
  }

  return (
    <div className={`ad-popup${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Quảng cáo">
      <div className="ad-popup__card">
        <div className="ad-popup__media">
          <PosterArt movie={{ title: MOCK_AD.title, hue: MOCK_AD.hue, artIndex: 4 }} />
          <button className="ad-popup__close icon-btn" onClick={close} aria-label="Đóng quảng cáo">
            <IconClose size={20} />
          </button>
        </div>
        <div className="ad-popup__body">
          <span className="badge badge--gold">Sự kiện đặc biệt</span>
          <h3 className="ad-popup__title">{MOCK_AD.title}</h3>
          <p className="ad-popup__desc">{MOCK_AD.description}</p>
          <div className="ad-popup__actions">
            <Link to="/movies" className="btn btn--gold" onClick={close}>
              {MOCK_AD.cta} <IconArrowRight size={18} className="btn__arrow" />
            </Link>
            <button className="btn btn--ghost" onClick={close}>
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}