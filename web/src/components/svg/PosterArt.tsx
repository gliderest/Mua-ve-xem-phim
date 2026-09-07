import type { Movie } from '@/types'

/* ============================================================
   PosterArt — Poster phim SVG tự vẽ (thay ảnh poster mạng).
   Mỗi phim nhận layout độc đáo qua artIndex + màu qua hue.
   ============================================================ */

export const LAYOUTS: Array<(h: number) => JSX.Element> = [
  // 0 — Vầng dương giữa sườn núi
  (h: number) => {
    const d = `hsl(${h + 20} 70% 40%)`
    return (
      <>
        <circle cx="250" cy="340" r="170" fill={`hsl(${h} 80% 30%)`} opacity="0.5" />
        <circle cx="250" cy="340" r="110" fill={`hsl(${h} 85% 48%)`} opacity="0.55" />
        <path d="M0 420 L120 300 L210 400 L320 280 L500 430 L500 480 L0 480 Z" fill={d} />
        <path d="M0 460 L180 350 L310 430 L500 350 L500 480 L0 480 Z" fill={`hsl(${h} 30% 16%)`} />
        <path d="M0 200 Q250 140 500 190" stroke={`hsl(${h} 65% 55%)`} strokeWidth="2" fill="none" opacity="0.5" />
      </>
    )
  },
  // 1 — Bóng đêm răng cưa
  (h: number) => {
    const c = `hsl(${h} 70% 50%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 40% 8%)`} />
        <path d="M0 360 L80 300 L140 340 L220 260 L300 330 L380 250 L460 320 L500 290 L500 720 L0 720 Z" fill={`hsl(${h} 35% 12%)`} />
        <path d="M60 720 L60 430 L140 380 L220 470 L300 400 L380 500 L440 440 L500 470 L500 720 Z" fill="rgba(0,0,0,0.55)" />
        <circle cx="390" cy="150" r="3" fill="#fff" opacity="0.8" />
        <circle cx="120" cy="110" r="2" fill="#fff" opacity="0.6" />
        <circle cx="280" cy="90" r="2.5" fill="#fff" opacity="0.7" />
        <rect x="330" y="60" width="90" height="3" fill={c} opacity="0.7" />
      </>
    )
  },
  // 2 — Mưa nghiêng
  (h: number) => {
    const c = `hsl(${h} 55% 52%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 45% 12%)`} />
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={i}
            x1={30 + i * 27}
            y1={40 + ((i * 53) % 160)}
            x2={50 + i * 27}
            y2={60 + ((i * 53) % 160)}
            stroke={c}
            strokeWidth="1.4"
            opacity="0.5"
          />
        ))}
        <path d="M0 520 Q250 460 500 520 L500 720 L0 720 Z" fill={`hsl(${h} 30% 16%)`} />
        <circle cx="250" cy="430" r="64" fill="none" stroke={c} strokeWidth="1.6" opacity="0.7" />
        <circle cx="250" cy="430" r="40" fill={c} opacity="0.12" />
      </>
    )
  },
  // 3 — Chuyến bay
  (h: number) => {
    const c = `hsl(${h + 20} 70% 55%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 50% 18%)`} />
        <path d="M0 600 L500 380 L500 720 L0 720 Z" fill="rgba(0,0,0,0.5)" />
        <path d="M-40 440 L560 400" stroke={c} strokeWidth="1.6" strokeDasharray="10 8" opacity="0.7" />
        <path d="M120 320 l180 -46 l-26 14 l-34 18 z" fill={`hsl(${h} 100% 70%)`} opacity="0.9" />
        <circle cx="370" cy="180" r="34" fill="none" stroke={c} strokeWidth="1.6" opacity="0.6" />
      </>
    )
  },
// 4 — Vùng đất huyền bí (cổng ánh sáng)
  (h: number) => {
    const c = `hsl(${h} 60% 55%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 55% 10%)`} />
        <path d="M250 720 L150 300 Q250 160 350 300 Z" fill={`hsl(${h} 45% 20%)`} opacity="0.85" />
        <ellipse cx="250" cy="420" rx="58" ry="120" fill={`hsl(${h} 80% 60%)`} opacity="0.35" />
        <circle cx="250" cy="420" r="24" fill={`hsl(${h} 90% 75%)`} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={70 + i * 52} y="640" width="20" height="60" fill={c} opacity="0.4" />
        ))}
      </>
    )
  },
  // 5 — Hoa dại
  (h: number) => {
    const c = `hsl(${h} 50% 55%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 35% 14%)`} />
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 40 + (i % 7) * 62
          const y = 160 + Math.floor(i / 7 || 0) * 90 + ((i * 41) % 40)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill={c} opacity={0.5 + (i % 3) * 0.15} />
              <circle cx={x} cy={y} r="2.4" fill="#f7efcf" />
              <line x1={x} y1={y + 6} x2={x + 18} y2={y + 130} stroke={`hsl(${h} 20% 34%)`} strokeWidth="2.4" />
            </g>
          )
        })}
        <circle cx="250" cy="620" r="80" fill="none" stroke={c} strokeWidth="1.6" opacity="0.5" />
      </>
    )
  },
  // 6 — Chạy đêm (sọc dọc)
  (h: number) => {
    const c = `hsl(${h + 30} 75% 60%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 40% 9%)`} />
        <rect x="60" y="0" width="26" height="720" fill={c} opacity="0.35" />
        <rect x="150" y="0" width="10" height="720" fill={`hsl(${h} 40% 20%)`} />
        <rect x="270" y="0" width="34" height="720" fill={c} opacity="0.2" />
        <rect x="410" y="0" width="8" height="720" fill={`hsl(${h} 40% 20%)`} />
        <circle cx="370" cy="300" r="70" fill="none" stroke={c} strokeWidth="2.4" strokeDasharray="10 14" />
        <circle cx="370" cy="300" r="42" fill="rgba(0,0,0,0.4)" />
      </>
    )
  },
  // 7 — Giao thừa (đồi + pháo hoa)
  (h: number) => {
    const c = `hsl(${h} 75% 58%)`
    return (
      <>
        <rect width="500" height="720" fill={`hsl(${h} 50% 13%)`} />
        <rect x="0" y="560" width="500" height="160" fill={`hsl(${h} 30% 10%)`} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const x = 250 + Math.cos(a) * (70 + (i % 3) * 22)
          const y = 96 + Math.sin(a) * 18
          return <line key={i} x1={250 + Math.cos(a) * 96} y1={120 + Math.sin(a) * 18} x2={x} y2={y} stroke={c} strokeWidth="1.2" opacity="0.8" />
        })}
        <circle cx="250" cy="110" r="5" fill={c} />
        <path d="M140 560 L210 470 L280 560 Z" fill={`hsl(${h} 40% 16%)`} />
        <text x="250" y="560" textAnchor="middle" fill="#f3eee4" fontSize="30" fontFamily="Cormorant Garamond, serif" fontStyle="italic">Giao Thừa</text>
      </>
    )
  },
]

interface Props {
  movie: Pick<Movie, 'title' | 'hue' | 'artIndex'>
}

export function PosterArt({ movie }: Props) {
  const Layout = LAYOUTS[movie.artIndex % LAYOUTS.length] ?? LAYOUTS[0]
  return (
    <svg
      viewBox="0 0 500 720"
      preserveAspectRatio="xMidYMid slice"
      className="poster-art"
      role="img"
      aria-label={`Poster phim ${movie.title}`}
    >
      {Layout(movie.hue)}
    </svg>
  )
}