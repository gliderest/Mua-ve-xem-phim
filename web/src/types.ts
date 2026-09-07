export type Role = 'USER' | 'ADMIN'

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED'

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: Role
}

export interface Movie {
  id: string
  title: string
  originalTitle?: string
  description: string
  durationMinutes: number
  genre: string[]
  director: string
  cast: string[]
  releaseDate: string
  language: string
  rated: string
  status: MovieStatus
  /** seed cho poster art SVG (thay poster ảnh — không dùng ảnh mạng) */
  hue: number
  /** key chọn layout poster độc đáo */
  artIndex: number
  rating: number
  reviewCount: number
  slug: string
  /** poster ảnh thật (TMDB) — nếu có sẽ hiển thị thay cho SVG art */
  posterUrl?: string
  backdropUrl?: string
  /** mã - id thật từ TMDB khi dữ liệu từ TMDB */
  tmdbId?: number
}

export interface Cinema {
  id: string
  name: string
  address: string
  description: string
  rooms: number
  district: string
}

export interface Room {
  id: string
  cinemaId: string
  name: string
  rows: number
  cols: number
}

export interface Showtime {
  id: string
  movieId: string
  cinemaId: string
  roomId: string
  startTime: string // ISO
  endTime: string // ISO
  priceStandard: number
  priceVip: number
  date: string // YYYY-MM-DD
}

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'BOOKED'

export interface Seat {
  id: string
  roomId: string
  rowLabel: string
  seatNumber: number
  seatType: 'STANDARD' | 'VIP'
  status: SeatStatus
}

export interface Booking {
  id: string
  bookingCode: string
  userId: string
  showtimeId: string
  movieId: string
  totalPrice: number
  status: 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  createdAt: string
  seats: Seat[]
}

export interface Comment {
  id: string
  movieId: string
  userId?: string
  name: string
  email: string
  content: string
  rating: number // 1-5
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  status: 'NEW' | 'READ' | 'RESOLVED'
  createdAt: string
}

export interface AdminStats {
  totalViews: number
  totalUsers: number
  totalMovies: number
  totalBookings: number
  paidBookings: number
  pendingBookings: number
}