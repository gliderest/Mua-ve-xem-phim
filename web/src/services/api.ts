import {
  MOCK_CINEMAS,
  MOCK_COMMENTS,
  MOCK_MOVIES,
  MOCK_ROOMS,
  MOCK_SHOWTIMES,
  MOCK_USERS,
} from '@/data/mock'
import type { Booking, Cinema, Comment, Movie, Room, Seat, Showtime, User } from '@/types'

/* ============================================================
   CINÉRA — Mock API service (prototype)
   Chưa có backend: mỗi hàm trả Promise với delay để mô phỏng
   network + trạng thái loading. Phase 2 sẽ thay bằng fetch().
   ============================================================ */

const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms))

export interface MockError extends Error {
  code?: string
}

const fail = (message: string, code = 'REQUEST_FAILED'): never => {
  const err = new Error(message) as MockError
  err.code = code
  throw err
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

export const movieService = {
  async list(): Promise<Movie[]> {
    await delay()
    return clone(MOCK_MOVIES)
  },
  async byId(id: string): Promise<Movie> {
    await delay(300)
    const m = MOCK_MOVIES.find((x) => x.id === id)
    if (!m) fail('Không tìm thấy phim.', 'MOVIE_NOT_FOUND')
    return clone(m!)
  },
  async showtimes(movieId: string): Promise<Showtime[]> {
    await delay()
    return clone(MOCK_SHOWTIMES.filter((s) => s.movieId === movieId))
  },
  async comments(movieId: string): Promise<Comment[]> {
    await delay(300)
    return clone(MOCK_COMMENTS[movieId] ?? [])
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
    await delay(500)
    const showtime = MOCK_SHOWTIMES.find((s) => s.id === showtimeId)
    if (!showtime) fail('Suất chiếu không tồn tại.', 'SHOWTIME_NOT_FOUND')

    // Sơ đồ ghế deterministic từ showtimeId
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
    const st = MOCK_SHOWTIMES.find((s) => s.id === showtimeId)
    if (!st) fail('Suất chiếu không tồn tại.', 'SHOWTIME_NOT_FOUND')
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