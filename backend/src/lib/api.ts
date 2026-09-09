import type { Response } from 'express'

/** OK response chuẩn: { data: ... } */
export function ok<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ data })
}

/** Sinh mã đặt vé kiểu: CINE6A + 5 số (mẫu theo kiến trúc) */
export function genBookingCode() {
  const seq = Math.floor(10000 + Math.random() * 90000)
  return `CINE${seq}`
}

/** Lấy cursor "now" cho ISO */
export const nowIso = () => new Date().toISOString()