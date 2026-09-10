import type { Booking, Cinema, Comment, Movie, Room, Seat, Showtime, User } from '@/types'

/* ============================================================
   CINEGA — Service layer (REAL API → Express → Supabase)
   Mọi hàm gọi backend thật qua VITE_API_URL.
   Interface giữ nguyên để các trang không phải đổi.
   ============================================================ */

const RAWVITE = ((import.meta.env.VITE_API_URL as string) ?? '').trim()
// Production: luôn dùng /api relative cùng origin (bỏ localhost nếu env set nhầm)
const API = import.meta.env.PROD && (!RAWVITE || RAWVITE.includes('localhost'))
  ? '/api'
  : (RAWVITE || '/api')

export interface MockError extends Error {
  code?: string
}

const fail = (message: string, code = 'REQUEST_FAILED'): never => {
  const err = new Error(message) as MockError
  err.code = code
  throw err
}

/* ---------- Fetch helper: đính kèm JWT, parse { data } | { error } ---------- */
let accessToken: string | null = null

export function setToken(token: string | null) {
  accessToken = token
  if (token) localStorage.setItem('cinega_token', token)
  else localStorage.removeItem('cinega_token')
}
export function getToken() {
  return accessToken
}

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${API}${path}`, { ...options, headers })
  let body: any = null
  try { body = await res.json() } catch { /* no body */ }

  if (!res.ok) {
    const msg = body?.error?.message ?? 'Yêu cầu thất bại, vui lòng thử lại.'
    const code = body?.error?.code ?? 'REQUEST_FAILED'
    if (res.status === 401) setToken(null)
    throw Object.assign(new Error(msg), { code })
  }
  return (body?.data ?? body) as T
}

/* ============================================================
   AUTH — Supabase Auth qua backend
   ============================================================ */
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await http<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(res.accessToken)
    return res.user
  },
  async register(username: string, email: string, password: string, fullName?: string): Promise<User> {
    const res = await http<{ user: User; accessToken: string | null }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName: fullName ?? username }),
    })
    if (res.accessToken) setToken(res.accessToken)
    return res.user
  },
  async me(): Promise<User | null> {
    if (!accessToken) return null
    try {
      return await http<User>('/auth/me')
    } catch {
      return null
    }
  },
  logout(): void {
    setToken(null)
  },
}


/* ============================================================
   MAPPERS — Supabase → types của web
   ============================================================ */
interface RowMovie {
  id: string
  tmdb_id?: number | null
  title: string
  original_title?: string | null
  overview?: string | null
  duration_minutes?: number | null
  genre?: string[] | null
  release_date?: string | null
  language?: string | null
  certificate?: string | null
  poster_url?: string | null
  backdrop_url?: string | null
  rating?: number | null
  vote_count?: number | null
  status?: string | null
}

interface RowCinema {
  id: string
  name: string
  address?: string | null
  district?: string | null
  description?: string | null
  room_count?: number | null
}

interface RowRoom {
  id: string
  cinema_id: string
  name: string
  rows?: number
  cols?: number
}

interface RowShowtime {
  id: string
  movie_id: string
  cinema_id: string
  room_id: string
  date: string
  start_time: string
  end_time: string
  price_standard: number
  price_vip: number
}

interface RowSeat {
  id: string
  row_label: string
  seat_number: number
  seat_type: string
  status?: string
}

interface RowComment {
  id: string
  movie_id: string
  name: string
  content: string
  rating: number
  created_at: string
}

interface RowBooking {
  id: string
  booking_code: string
  user_id: string
  showtime_id: string
  total_price: number
  status: string
  expires_at: string
  created_at: string
  seats?: Array<{ seat: RowSeat; price: number }>
}

const mapMovie = (m: RowMovie): Movie => ({
  id: m.id,
  tmdbId: m.tmdb_id ?? undefined,
  title: m.title,
  originalTitle: m.original_title ?? undefined,
  description: m.overview ?? '',
  durationMinutes: m.duration_minutes ?? 120,
  genre: m.genre ?? [],
  director: '',
  cast: [],
  releaseDate: m.release_date ?? '',
  language: m.language ?? '',
  rated: m.certificate ?? '',
  status: (m.status as Movie['status']) ?? 'NOW_SHOWING',
  hue: m.tmdb_id ? (m.tmdb_id * 47) % 360 : 30,
  artIndex: m.tmdb_id ? (m.tmdb_id % 8) : 0,
  rating: m.rating ?? 0,
  reviewCount: m.vote_count ?? 0,
  slug: String(m.tmdb_id ?? m.id),
  posterUrl: m.poster_url ?? undefined,
  backdropUrl: m.backdrop_url ?? undefined,
})

const mapShowtime = (s: RowShowtime): Showtime => ({
  id: s.id,
  movieId: s.movie_id,
  cinemaId: s.cinema_id,
  roomId: s.room_id,
  date: s.date,
  startTime: s.start_time,
  endTime: s.end_time,
  priceStandard: s.price_standard,
  priceVip: s.price_vip,
})

/* ============================================================
   MOVIES — đọc từ Supabase (bảng movies, do admin sync TMDB)
   ============================================================ */
export const movieService = {
  async list(): Promise<Movie[]> {
    const rows = await http<RowMovie[]>('/movies')
    return (rows ?? []).map(mapMovie)
  },
  async byId(id: string): Promise<Movie> {
    const m = await http<RowMovie>(`/movies/${id}`)
    return mapMovie(m)
  },
  async showtimes(movieId: string): Promise<Showtime[]> {
    const rows = await http<RowShowtime[]>(`/movies/${movieId}/showtimes`)
    return (rows ?? []).map(mapShowtime)
  },
  async comments(movieId: string): Promise<Comment[]> {
    const rows = await http<RowComment[]>(`/movies/${movieId}/comments`)
    return (rows ?? []).map((c) => ({
      id: c.id,
      movieId: c.movie_id,
      name: c.name,
      email: '',
      content: c.content,
      rating: c.rating,
      createdAt: c.created_at,
    }))
  },
}


/* ============================================================
   CINEMAS / ROOMS
   ============================================================ */
export const cinemaService = {
  async list(): Promise<Cinema[]> {
    const rows = await http<Array<RowCinema & { rooms?: { count?: number } }>>('/cinemas')
    return (rows ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address ?? '',
      district: c.district ?? '',
      description: c.description ?? '',
      rooms: c.room_count ?? c.rooms?.count ?? 1,
    }))
  },
  async byId(id: string): Promise<Cinema> {
    return (await cinemaService.list()).find((c) => c.id === id) ?? fail('Không tìm thấy rạp.', 'CINEMA_NOT_FOUND')
  },
  async room(roomId: string): Promise<{ room: Room; cinema: Cinema }> {
    const { room, cinema } = await http<{ room: RowRoom; cinema: RowCinema }>(`/rooms/${roomId}`)
    return {
      room: { id: room.id, cinemaId: room.cinema_id, name: room.name, rows: room.rows ?? 9, cols: room.cols ?? 13 },
      cinema: { id: cinema.id, name: cinema.name, address: cinema.address ?? '', district: cinema.district ?? '', description: cinema.description ?? '', rooms: cinema.room_count ?? 1 },
    }
  },
}

/* ============================================================
   SHOWTIMES
   ============================================================ */
export const showtimeService = {
  async byId(id: string): Promise<Showtime> {
    const s = await http<RowShowtime>(`/showtimes/${id}`)
    return mapShowtime(s)
  },
  async byMovie(movieId: string): Promise<Showtime[]> {
    return movieService.showtimes(movieId)
  },
  /** Suất chiếu theo rạp — dùng cho trang Phim (user chọn rạp trước) */
  async byCinema(cinemaId: string, date?: string): Promise<Array<Showtime & { movie?: Movie }>> {
    const qs = date ? `?date=${date}` : ''
    const rows = await http<Array<RowShowtime & { movie?: any }>>(`/cinemas/${cinemaId}/showtimes${qs}`)
    return (rows ?? []).map((r) => ({
      ...mapShowtime(r),
      movie: r.movie ? {
        id: r.movie.id,
        title: r.movie.title,
        slug: r.movie.slug ?? '',
        description: '',
        durationMinutes: r.movie.duration_minutes ?? 120,
        genre: r.movie.genre ?? [],
        director: '',
        cast: [],
        releaseDate: '',
        language: '',
        rated: '',
        status: (r.movie.status ?? 'NOW_SHOWING') as Movie['status'],
        hue: 30,
        artIndex: 0,
        rating: 0,
        reviewCount: 0,
        posterUrl: r.movie.poster_url ?? undefined,
      } : undefined,
    }))
  },
  async all(): Promise<Showtime[]> {
    const rows = await http<RowShowtime[]>('/admin/showtimes')
    return (rows ?? []).map(mapShowtime)
  },
  async add(st: Omit<Showtime, 'id'>): Promise<Showtime> {
    const created = await http<RowShowtime>('/admin/showtimes', {
      method: 'POST',
      body: JSON.stringify({
        movie_id: st.movieId, cinema_id: st.cinemaId, room_id: st.roomId,
        date: st.date, start_time: st.startTime, end_time: st.endTime,
        price_standard: st.priceStandard, price_vip: st.priceVip,
      }),
    })
    return mapShowtime(created)
  },
  async update(id: string, patch: Partial<Omit<Showtime, 'id'>>): Promise<Showtime> {
    const updated = await http<RowShowtime>(`/admin/showtimes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ movie_id: patch.movieId, cinema_id: patch.cinemaId, room_id: patch.roomId, date: patch.date, start_time: patch.startTime, end_time: patch.endTime, price_standard: patch.priceStandard, price_vip: patch.priceVip }),
    })
    return mapShowtime(updated)
  },
  async delete(id: string): Promise<void> {
    await http<void>(`/admin/showtimes/${id}`, { method: 'DELETE' })
  },
}

/* ============================================================
   SEATS — đọc sơ đồ ghế + trạng thái từ backend
   ============================================================ */
export const seatService = {
  async seatsFor(showtimeId: string, _roomId?: string): Promise<Seat[]> {
    const rows = await http<RowSeat[]>(`/showtimes/${showtimeId}/seats`)
    return (rows ?? []).map((r) => ({
      id: r.id,
      roomId: '',
      rowLabel: r.row_label,
      seatNumber: r.seat_number,
      seatType: r.seat_type === 'VIP' ? 'VIP' : 'STANDARD',
      status: (r.status as Seat['status']) ?? 'AVAILABLE',
    }))
  },
}

/* ============================================================
   BOOKINGS — tạo booking real qua backend
   ============================================================ */
const mapBooking = (b: RowBooking): Booking => ({
  id: b.id,
  bookingCode: b.booking_code,
  userId: b.user_id,
  showtimeId: b.showtime_id,
  movieId: '',
  totalPrice: b.total_price,
  status: b.status as Booking['status'],
  expiresAt: b.expires_at,
  createdAt: b.created_at,
  seats: (b.seats ?? []).map((row) => ({
    id: row.seat.id, roomId: '', rowLabel: row.seat.row_label,
    seatNumber: row.seat.seat_number,
    seatType: row.seat.seat_type === 'VIP' ? 'VIP' : 'STANDARD',
    status: 'SELECTED' as const,
  })),
})

export const bookingService = {
  async create(showtimeId: string, seatIds: string[]): Promise<Booking> {
    if (!accessToken) fail('Vui lòng đăng nhập để đặt vé.', 'UNAUTHORIZED')
    const b = await http<RowBooking>('/bookings', { method: 'POST', body: JSON.stringify({ showtimeId, seatIds }) })
    return mapBooking(b)
  },
  async byId(id: string): Promise<Booking> {
    return mapBooking(await http<RowBooking>(`/bookings/${id}`))
  },
  async markPaid(id: string): Promise<Booking> {
    const b = await http<RowBooking>(`/bookings/${id}/mock-pay`, { method: 'POST' })
    return { ...(await this.byId(id)), status: b.status as Booking['status'] }
  },
  async mine(): Promise<Booking[]> {
    const rows = await http<RowBooking[]>('/bookings')
    return (rows ?? []).map(mapBooking)
  },
}

/* Khởi tạo token từ localStorage (persist qua reload) */
try { setToken(localStorage.getItem('cinega_token')) } catch { /* ssr */ }
