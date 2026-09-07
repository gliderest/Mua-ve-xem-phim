/* ============================================================
   CINÉRA — Logo & brand SVGs (tự vẽ, không copy)
   ============================================================ */
import type { CSSProperties } from 'react'

interface LogoProps {
  size?: number
  className?: string
  style?: CSSProperties
}

/** Logo CINÉRA — cuộn phim cách điệu */
export function LogoMark({ size = 34, className, style }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      style={style}
    >
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <rect x="10" y="14" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="24" r="5.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="24" r="2.2" fill="currentColor" />
      <path d="M26 20.5c2.4 1.4 2.4 5.6 0 7M30 19c4 2.3 4 8.7 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Lỗ phim trên/ dưới */}
      <path d="M9 17.5h4M9 30.5h4M35 17.5h4M35 30.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function BrandText({ className }: { className?: string }) {
  return (
    <span className={className}>
      CINÉRA<span className="nav__logo-dot">.</span>
    </span>
  )
}

/** Dải phim (filmstrip) — dùng hero & footer */
export function FilmStrip({ count = 8, height = 40 }: { count?: number; height?: number }) {
  const frames = Array.from({ length: count })
  return (
    <svg width={count * 64} height={height} viewBox={`0 0 ${count * 64} ${height}`} fill="none" aria-hidden>
      {frames.map((_, i) => (
        <g key={i} transform={`translate(${i * 64} 0)`} opacity="0.9">
          <rect x="4" y="2" width="56" height={height - 4} rx="5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="10" y="8" width="44" height={(height - 16) * 0.55} rx="3" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <circle cx="16" cy={height - 9} r="2.6" stroke="currentColor" strokeWidth="1" />
          <circle cx="48" cy={height - 9} r="2.6" stroke="currentColor" strokeWidth="1" />
        </g>
      ))}
    </svg>
  )
}