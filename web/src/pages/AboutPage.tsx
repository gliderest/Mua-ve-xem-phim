import { BrandText, LogoMark } from '@/components/svg/Brand'

export function AboutPage() {
  return (
    <section className="section section--page">
      <div className="container">
        <span className="eyebrow">Về chúng tôi</span>
        <h1 className="section-title" style={{ marginTop: 'var(--space-3)', maxWidth: '16ch' }}>
          Nơi điện ảnh trở thành <em>trải nghiệm</em>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-7)', marginTop: 'var(--space-7)', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.9 }}>
              CINÉRA ra đời với sứ mệnh đưa điện ảnh đến gần hơn với khán giả Việt. Chúng tôi tin rằng một
              bộ phim hay không chỉ nằm ở câu chuyện trên màn ảnh — mà còn ở không gian, âm thanh, sự thoải
              mái của chiếc ghế bạn ngồi, và sự trọn vẹn của một buổi tối bạn chọn.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.9 }}>
              Từ phòng chiếu IMAX cao nhất Việt Nam tại Landmark 81 đến không gian hoài cổ của Royal Center,
              mỗi cụm rạp của chúng tôi được thiết kế riêng — không khuôn mẫu, không sao chép — để mỗi lần
              mua vé là mỗi lần bạn tìm thấy một góc điện ảnh mới.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <LogoMark size={64} className="nav__logo-dot" style={{ marginInline: 'auto', marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', letterSpacing: '0.18em' }}>
              <BrandText />
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>
              "Điện ảnh không chỉ là một bộ phim."
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)', marginTop: 'var(--space-7)' }}>
          {[
            { t: 'Công nghệ', d: 'Âm thanh Dolby Atmos, màn hình IMAX thế hệ mới, đặt vé và thanh toán trực tuyến trong vài phút.' },
            { t: 'Thiết kế', d: 'Mỗi cụm rạp có ngôn ngữ thiết kế riêng, được vẽ và dựng bởi chính đội ngũ CINÉRA.' },
            { t: 'Con người', d: 'Đội ngũ nhân viên nhiệt tình, sẵn sàng hỗ trợ trước, trong và sau suất chiếu của bạn.' },
          ].map((item) => (
            <article className="card" key={item.t} style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ color: 'var(--accent-strong)', fontFamily: 'var(--font-body)', fontWeight: 800 }}>{item.t}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>{item.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}