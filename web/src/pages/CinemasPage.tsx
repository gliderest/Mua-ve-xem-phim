import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cinemaService } from '@/services/api'
import { IconMapPin, IconArrowRight } from '@/components/svg/Icons'
import { MOCK_ROOMS } from '@/data/mock'
import type { Cinema } from '@/types'

export function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cinemaService.list().then(setCinemas).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="section section--page">
        <div className="container">
          <span className="eyebrow">Hệ thống rạp</span>
          <h1 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
            Các rạp chiếu <em>CINEGA</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            Trải nghiệm màn hình lớn, âm thanh sống động tại các cụm rạp cao cấp trên toàn quốc.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {loading ? (
            <div className="skeleton" style={{ height: 320 }} />
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
              {cinemas.map((c) => {
                const roomCount = MOCK_ROOMS.filter((r) => r.cinemaId === c.id).length
                return (
                  <article className="card" key={c.id} style={{ padding: 'var(--space-6)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge badge--gold">{c.district}</span>
                        <h2 style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-2)' }}>{c.name}</h2>
                        <p style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                          <IconMapPin size={16} /> {c.address}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--accent-strong)', lineHeight: 1 }}>
                          {roomCount > 0 ? roomCount : c.rooms}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>phòng chiếu</div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)', maxWidth: '70ch' }}>{c.description}</p>
                    <Link to="/movies" className="btn btn--surface" style={{ marginTop: 'var(--space-5)' }}>
                      Xem lịch chiếu <IconArrowRight size={18} className="btn__arrow" />
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}