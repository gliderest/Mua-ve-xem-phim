import { Link } from 'react-router-dom'
import { BrandText, LogoMark, FilmStrip } from '@/components/svg/Brand'
import { IconMapPin } from '@/components/svg/Icons'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col">
            <div className="footer__brand">
              <LogoMark size={34} />
              <BrandText />
            </div>
            <p className="footer__desc">
              Trải nghiệm điện ảnh đẳng cấp — đặt vé trong vài giây, thanh toán qua chuyển khoản
              ngân hàng an toàn, nhận vé kỹ thuật số ngay tức thì.
            </p>
          </div>
          <div className="footer__col">
            <h4>Khám phá</h4>
            <Link to="/movies">Phim đang chiếu</Link>
            <Link to="/movies">Phim sắp chiếu</Link>
            <Link to="/cinemas">Hệ thống rạp</Link>
            <Link to="/my-tickets">Vé của tôi</Link>
          </div>
          <div className="footer__col">
            <h4>Hỗ trợ</h4>
            <Link to="/about">Về CINEGA</Link>
            <Link to="/contact">Liên hệ</Link>
          </div>
          <div className="footer__col">
            <h4>Rạp chính</h4>
            <p className="footer__desc" style={{ marginBottom: 'var(--space-2)' }}>
              <IconMapPin size={16} /> Tầng 68, Vinhomes Landmark 81,
              Bình Thạnh, TP.HCM
            </p>
            <p className="footer__desc">Hotline: 1900 5555 99</p>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 CINEGA Cinema. Đồ án môn Lập trình Web.</span>
          <span>Thiết kế &amp; phát triển nguyên gốc — không copy template.</span>
        </div>
      </div>
      <div className="hero__filmstrip" style={{ opacity: 0.18 }}>
        <div className="hero__filmstrip-track">
          <FilmStrip count={12} />
          <FilmStrip count={12} />
        </div>
      </div>
    </footer>
  )
}