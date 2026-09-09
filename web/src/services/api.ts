import {
  MOCK_CINEMAS,
  MOCK_ROOMS,
  MOCK_USERS,
} from '@/data/mock'
import { tmdbService } from '@/services/tmdb'
import type { Booking, Cinema, Comment, Movie, Room, Seat, Showtime, User } from '@/types'

/* ============================================================
   CINÉRA — Service layer (prototype)
   - PHIM: 100% lấy trực tiếp từ TMDB (region=VN). KHÔNG mock.
   - Rạp/phòng/suất chiếu/ghế/auth: là dữ liệu riêng của hệ thống
     CINÉRA (TMDB không cung cấp) — chờ backend thật ở Phase 2.
   ============================================================ */

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

export interface MockError extends Error {
  code?: string
}

const fail = (message: string, code = 'REQUEST_FAILED'): never => {
  const err = new Error(message) as MockError
  err.code = code
  throw err
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

const isTmd = (id: string): boolean => id.startsWith('tmdb-')
const tmdId = (id: string): number => Number(id.replace('tmdb-', ''))

/** Parse id suất chiếu ảo `st-t-<movieId>-<di>` để mở thẳng URL booking được ngay */
function parseTmdShowtimeId(id: string): { movieId: string; idx: number } | null {
  const p = 'st-t-'
  if (!id.startsWith(p)) return null
  const rest = id.slice(p.length)
  const idx = rest.lastIndexOf('-')
  if (idx <= 0) return null
  const movieId = rest.slice(0, idx)
  const di = Number(rest.slice(idx + 1))
  if (!movieId.startsWith('tmdb-') || Number.isNaN(di)) return null
  return { movieId, idx: di }
}

/** Cache suất chiếu của phim TMDB (để byId tìm được khi booking) */
const tmdShowtimeCache: Showtime[] = []

/** Sinh suất chiếu cho phim TMDB — chờ backend thật (Phase 2) để lấy lịch chiếu thực */
function showtimesForTmd(movieId: string): Showtime[] {
  const cached = tmdShowtimeCache.filter((s) => s.movieId === movieId)
  if (cached.length > 0) return clone(cached)
  const now = new Date()
  const dates = [0, 1, 2].map((d) => {
    const x = new Date(now)
    x.setDate(x.getDate() + d)
    return x.toISOString().slice(0, 10)
  })
  const times = [
    { h: 10, m: 30, roomId: 'r1', cinemaId: 'c1' },
    { h: 14, m: 0, roomId: 'r2', cinemaId: 'c1' },
    { h: 19, m: 30, roomId: 'r3', cinemaId: 'c2' },
    { h: 20, m: 0, roomId: 'r4', cinemaId: 'c3' },
  ]
  const out: Showtime[] = []
  dates.forEach((d, di) => {
    const t = times[di % times.length]
    const start = new Date(`${d}T00:00:00`)
    start.setHours(t.h, t.m, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 118)
    out.push({
      id: `st-t-${movieId}-${di}`,
      movieId,
      cinemaId: t.cinemaId,
      roomId: t.roomId,
      date: d,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      priceStandard: 80000 + di * 5000,
      priceVip: 110000 + di * 5000,
    })
  })
  tmdShowtimeCache.push(...out)
  return out
}

/** Storage key cho showtimes admin đã tạo/sửa */
const STORAGE_KEY = 'cinera_showtimes'

/** Đọc showtimes đã lưu từ localStorage */
function loadSavedShowtimes(): Showtime[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Ghi showtimes admin vào localStorage */
function saveShowtimes(list: Showtime[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/** Merge: deterministic default + admin-created (admin override default cùng movieId+date+time) */
function mergedShowtimes(movieId: string): Showtime[] {
  const defaults = showtimesForTmd(movieId)
  const saved = loadSavedShowtimes().filter((s) => s.movieId === movieId)
  if (saved.length === 0) return defaults

  // Admin-saved thay thế default nếu cùng date+time+roomId
  const key = (s: Showtime) => `${s.date}-${s.startTime}-${s.roomId}`
  const savedKeys = new Set(saved.map(key))
  const filteredDefaults = defaults.filter((d) => !savedKeys.has(key(d)))
  return [...filteredDefaults, ...saved]
}

/** Tra cứu suất chiếu (data hệ thống CINÉRA) */
export const showtimeService = {
  async byId(id: string): Promise<Showtime> {
    // Tìm trong cache + saved
    let st = tmdShowtimeCache.find((s) => s.id === id)
    if (!st) {
      const saved = loadSavedShowtimes().find((s) => s.id === id)
      if (saved) { st = saved }
    }
    if (!st) {
      const parsed = parseTmdShowtimeId(id)
      if (parsed) {
        showtimesForTmd(parsed.movieId)
        st = tmdShowtimeCache.find((s) => s.id === id)
      }
    }
    if (!st) fail('Suất chiếu không tồn tại.', 'SHOWTIME_NOT_FOUND')
    return clone(st!)
  },

  /** Lấy danh sách suất chiếu cho 1 phim (merged default + admin) */
  async byMovie(movieId: string): Promise<Showtime[]> {
    return clone(mergedShowtimes(movieId))
  },

  /** Thêm suất chiếu mới từ admin */
  async add(showtime: Omit<Showtime, 'id'>): Promise<Showtime> {
    const id = `st-a-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const newSt: Showtime = { ...showtime, id }
    const saved = loadSavedShowtimes()
    saved.push(newSt)
    saveShowtimes(saved)
    return clone(newSt)
  },

  /** Sửa suất chiếu */
  async update(id: string, patch: Partial<Omit<Showtime, 'id'>>): Promise<Showtime> {
    const saved = loadSavedShowtimes()
    const idx = saved.findIndex((s) => s.id === id)
    if (idx < 0) fail('Suất chiếu không tồn tại để sửa.', 'SHOWTIME_NOT_FOUND')
    saved[idx] = { ...saved[idx], ...patch }
    saveShowtimes(saved)
    return clone(saved[idx])
  },

  /** Xóa suất chiếu */
  async delete(id: string): Promise<void> {
    const saved = loadSavedShowtimes()
    saveShowtimes(saved.filter((s) => s.id !== id))
  },

  /** Lấy tất cả showtimes (admin xem tổng quan) */
  async all(): Promise<Showtime[]> {
    const allIds = new Set<string>()
    const out: Showtime[] = []
    // Lấy saved trước
    for (const s of loadSavedShowtimes()) { allIds.add(s.id); out.push(s) }
    // Thêm defaults từ cache
    for (const s of tmdShowtimeCache) { if (!allIds.has(s.id)) { allIds.add(s.id); out.push(s) } }
    return clone(out)
  },
}

/** Xóa cache khi update (để mergedShowtimes refill) */
export function clearShowtimeCache() {
  tmdShowtimeCache.length = 0
}

/* ============================================================
   MOVIES — 100% TMDB (region=VN), không fallback mock
   ============================================================ */
export const movieService = {
  async list(): Promise<Movie[]> {
    await delay(150)
    if (!tmdbService.enabled) fail('Thiếu TMDB API key (web/.env). Không hiển thị mock.', 'TMDB_DISABLED')
    const now = await tmdbService.nowPlayingVN()
    const up = await tmdbService.upcomingVN()
    return [...now, ...up]
  },
  async byId(id: string): Promise<Movie> {
    await delay(200)
    if (!isTmd(id)) fail('Phim không tồn tại trên TMDB.', 'MOVIE_NOT_FOUND')
    return tmdbService.movieById(tmdId(id))
  },
  async showtimes(movieId: string): Promise<Showtime[]> {
    await delay()
    return showtimesForTmd(movieId)
  },
  async comments(movieId: string): Promise<Comment[]> {
    if (!isTmd(movieId)) return []
    return tmdbService.reviews(tmdId(movieId))
  },
}

export const cinemaService = {
  async list(): Promise<Cinema[]> {
    await delay()
    return clone(MOCK_CINEMAS)
  },
  async byId(id: string): Promise<Cinema> {
    await delay(250)
    const c = MOCK_CINEMAS.find((x) => x.id === id)
    if (!c) fail('Không tìm thấy rạp.', 'CINEMA_NOT_FOUND')
    return clone(c!)
  },
  async room(roomId: string): Promise<{ room: Room; cinema: Cinema }> {
    await delay()
    const room = MOCK_ROOMS.find((r) => r.id === roomId)
    if (!room) fail('Không tìm thấy phòng chiếu.', 'ROOM_NOT_FOUND')
    const cinema = MOCK_CINEMAS.find((c) => c.id === room!.cinemaId)!
    return { room: clone(room!), cinema: clone(cinema) }
  },
}

export const seatService = {
  async seatsFor(showtimeId: string, roomId: string): Promise<Seat[]> {
    await delay(400)
    await showtimeService.byId(showtimeId)

    // Sơ đồ ghế deterministic từ showtimeId (data hệ thống CINÉRA)
    const rows = 9
    const cols = 13
    const rowLabels = 'ABCDEFGHI'.slice(0, rows)
    const vipStartRow = rows - 2
    let seed = 0
    for (const ch of showtimeId) seed += ch.charCodeAt(0)

    const seats: Seat[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isVip = r >= vipStartRow
        const pseudo = (seed * (r + 3) * (c + 5) * 2654435761) % 100
        seats.push({
          id: `${roomId}-${rowLabels[r]}${c + 1}`,
          roomId,
          rowLabel: rowLabels[r],
          seatNumber: c + 1,
          seatType: isVip ? 'VIP' : 'STANDARD',
          status: pseudo < 12 ? 'BOOKED' : 'AVAILABLE',
        })
      }
    }
    return seats
  },
}

export const bookingService = {
  async create(showtimeId: string, seatIds: string[]): Promise<Booking> {
    await delay(600)
    const st = await showtimeService.byId(showtimeId)
    if (seatIds.length === 0) fail('Vui lòng chọn ít nhất một ghế.', 'NO_SEATS_SELECTED')
    const showtime: Showtime = clone(st!)
    const seats = await seatService.seatsFor(showtimeId, showtime.roomId)
    const selected = seats.filter((s) => seatIds.includes(s.id))
    const totalPrice = selected.reduce(
      (sum, s) => sum + (s.seatType === 'VIP' ? showtime.priceVip : showtime.priceStandard),
      0,
    )

    const booking: Booking = {
      id: `bk${Math.floor(Math.random() * 100000)}`,
      bookingCode: `CINÉRA${Math.floor(10000 + Math.random() * 90000)}`,
      userId: 'u2',
      showtimeId,
      movieId: showtime.movieId,
      totalPrice,
      status: 'PENDING_PAYMENT',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      seats: selected,
    }
    const saved = JSON.parse(localStorage.getItem('cinera_bookings') ?? '[]') as Booking[]
    saved.push(booking)
    localStorage.setItem('cinera_bookings', JSON.stringify(saved))
    return clone(booking)
  },

  async byId(id: string): Promise<Booking> {
    await delay(250)
    const saved = JSON.parse(localStorage.getItem('cinera_bookings') ?? '[]') as Booking[]
    const b = saved.find((x) => x.id === id)
    if (!b) fail('Không tìm thấy đặt vé.', 'BOOKING_NOT_FOUND')
    return clone(b!)
  },

  async markPaid(id: string): Promise<Booking> {
    await delay(400)
    const saved = JSON.parse(localStorage.getItem('cinera_bookings') ?? '[]') as Booking[]
    const idx = saved.findIndex((x) => x.id === id)
    if (idx < 0) fail('Không tìm thấy đặt vé.', 'BOOKING_NOT_FOUND')
    saved[idx].status = 'PAID'
    localStorage.setItem('cinera_bookings', JSON.stringify(saved))
    return clone(saved[idx])
  },

  async mine(): Promise<Booking[]> {
    await delay()
    const saved = JSON.parse(localStorage.getItem('cinera_bookings') ?? '[]') as Booking[]
    return clone(saved)
  },
}

export const authService = {
  async login(username: string, password: string): Promise<User> {
    await delay(600)
    const user = MOCK_USERS.find((u) => u.username === username)
    if (!user || password.length < 3) fail('Tên đăng nhập hoặc mật khẩu không đúng.', 'INVALID_CREDENTIALS')
    localStorage.setItem('cinera_session', JSON.stringify({ userId: user!.id }))
    return clone(user!)
  },
  async register(username: string, email: string, password: string): Promise<User> {
    await delay(600)
    if (MOCK_USERS.some((u) => u.username === username)) fail('Tên đăng nhập đã tồn tại.', 'USERNAME_TAKEN')
    const user: User = { id: `u${Date.now()}`, username, email, fullName: username, role: 'USER' }
    MOCK_USERS.push(user)
    localStorage.setItem('cinera_session', JSON.stringify({ userId: user.id }))
    return clone(user)
  },
  async me(): Promise<User | null> {
    await delay(150)
    const raw = localStorage.getItem('cinera_session')
    if (!raw) return null
    const { userId } = JSON.parse(raw) as { userId: string }
    const user = MOCK_USERS.find((u) => u.id === userId) ?? null
    return user ? clone(user) : null
  },
  logout(): void {
    localStorage.removeItem('cinera_session')
    localStorage.removeItem('cinera_guest')
  },
}