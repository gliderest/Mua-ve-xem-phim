import { useEffect, useState } from 'react'

/** Đếm ngược đến thời điểm hết hạn (timestamp ISO). */
export function useCountdown(expiresAt?: string) {
  const [remaining, setRemaining] = useState(() => calc(expiresAt))

  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => {
      setRemaining(calc(expiresAt))
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}

function calc(expiresAt?: string): { minutes: number; seconds: number; expired: boolean } {
  if (!expiresAt) return { minutes: 0, seconds: 0, expired: true }
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { minutes: 0, seconds: 0, expired: true }
  return {
    minutes: Math.floor(diff / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  }
}

/** Đọc/ghi cookie (kiến trúc #18 — popup advertisement). */
export function useCookie(name: string) {
  const get = (): string | null => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return m ? decodeURIComponent(m[1]) : null
  }
  const set = (value: string, maxAgeSeconds = 86400 * 30) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
  }
  const remove = () => {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
  }
  return { get, set, remove }
}