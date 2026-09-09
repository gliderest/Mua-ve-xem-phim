import type { Comment, Movie } from '@/types'

/* ============================================================
   TMDB service — phim đang chiếu tại Việt Nam (region=VN)
   Dùng API key v3 (client-side). Nếu thiếu key, trả null để
   caller fallback về mock data.
   ============================================================ */

const API = 'https://api.themoviedb.org/3'
const IMG = (import.meta.env.VITE_TMDB_IMAGE_BASE as string) || 'https://image.tmdb.org/t/p'
const KEY = import.meta.env.VITE_TMDB_API_KEY as string
const TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string

const hasKey = (): boolean => KEY.length > 0 && KEY !== 'CHANGE_ME_YOUR_TMDB_API_KEY'

interface TGenre {
  id: number
  name: string
}

interface TMovie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  runtime?: number
  original_language?: string
}

interface TResponse {
  results: TMovie[]
}

/** Bộ đệm danh sách thể loại (id → tên tiếng Việt) */
let genreCache: Map<number, string> | null = null

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API}${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return (await res.json()) as T
}

async function genres(): Promise<Map<number, string>> {
  if (genreCache) return genreCache
  try {
    const data = await fetchJson<{ genres: TGenre[] }>('/genre/movie/list?language=vi-VN')
    genreCache = new Map(data.genres.map((g) => [g.id, g.name]))
  } catch {
    genreCache = new Map()
  }
  return genreCache
}

/** Chuyển kết quả TMDB thành Movie của CINEGA */
async function mapMovie(t: TMovie): Promise<Movie> {
  const g = await genres()
  const genre = (t.genre_ids ?? []).slice(0, 3).map((id) => g.get(id) ?? `#${id}`)
  const isNow = !!t.release_date && t.release_date <= new Date().toISOString().slice(0, 10)
  const title = t.title || t.original_title
  // deterministic hue từ id để tạo poster SVG fallback
  const hue = (t.id * 47) % 360

  return {
    id: `tmdb-${t.id}`,
    tmdbId: t.id,
    title: title || t.original_title,
    originalTitle: t.original_title,
    description: t.overview.trim() || 'Chưa có mô tả từ TMDB.',
    durationMinutes: t.runtime ?? 120,
    genre,
    director: '',
    cast: [],
    releaseDate: t.release_date || new Date().toISOString().slice(0, 10),
    language: '',
    rated: '',
    status: isNow ? 'NOW_SHOWING' : 'COMING_SOON',
    hue,
    artIndex: hue % 8,
    rating: t.vote_average ? Math.round(t.vote_average * 10) / 10 : 0,
    reviewCount: t.vote_count ?? 0,
    slug: `${t.id}`,
    posterUrl: t.poster_path ? `${IMG}/w500${t.poster_path}` : undefined,
    backdropUrl: t.backdrop_path ? `${IMG}/w1280${t.backdrop_path}` : undefined,
  }
}

interface TReview {
  id: string
  author: string
  content: string
  created_at: string
  author_details?: {
    username?: string
    rating?: number
  }
}

interface TReviewsResponse {
  results: TReview[]
}

interface TVideo {
  key: string
  site: string
  type: string
}

interface TVideosResponse {
  results: TVideo[]
}

/** Lấy YouTube trailer/key từ TMDB */
async function videos(tmdbId: number): Promise<{ youtubeKey: string; type: string } | null> {
  const data = await fetchJson<TVideosResponse>(
    `/movie/${tmdbId}/videos?language=vi-VN`,
  )
  const yt = (data.results ?? []).find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  )
    ?? (data.results ?? []).find((v) => v.site === 'YouTube')
  if (!yt) return null
  return { youtubeKey: yt.key, type: yt.type }
}

export const tmdbService = {
  enabled: hasKey(),

  /** Lấy trailer YouTube từ TMDB */
  async videos(tmdbId: number): Promise<{ youtubeKey: string; type: string } | null> {
    return videos(tmdbId)
  },

  /** Phim đang chiếu tại Việt Nam — /movie/now_playing với region=VN */
  async nowPlayingVN(limit = 12): Promise<Movie[]> {
    const data = await fetchJson<TResponse>(
      '/movie/now_playing?language=vi-VN&region=VN&page=1',
    )
    const list = data.results ?? []
    const full = []
    for (const t of list.slice(0, limit)) full.push(await mapMovie(t))
    return full
  },

  /** Phim sắp chiếu tại Việt Nam */
  async upcomingVN(limit = 8): Promise<Movie[]> {
    const data = await fetchJson<TResponse>('/movie/upcoming?language=vi-VN&region=VN&page=1')
    const list = data.results ?? []
    const full = []
    for (const t of list.slice(0, limit)) full.push(await mapMovie(t))
    return full
  },

  /** Chi tiết phim theo id TMDB */
  async movieById(tmdbId: number): Promise<Movie> {
    const data = await fetchJson<TMovie>(`/movie/${tmdbId}?language=vi-VN`)
    return mapMovie(data)
  },

  /** Đánh giá/comment của cộng đồng TMDB cho phim */
  async reviews(tmdbId: number, limit = 6): Promise<Comment[]> {
    const data = await fetchJson<TReviewsResponse>(`/movie/${tmdbId}/reviews`)
    const list = data.results ?? []
    return list.slice(0, limit).map((r) => ({
      id: r.id,
      movieId: `tmdb-${tmdbId}`,
      name: r.author_details?.username || r.author || 'Khán giả TMDB',
      email: '',
      content: r.content.trim(),
      rating: r.author_details?.rating ? Math.round(r.author_details.rating) : 0,
      createdAt: r.created_at,
    }))
  },

  /** Ảnh poster TMDB */
  posterUrl(path: string | null, size: 'w342' | 'w500' = 'w500'): string | undefined {
    if (!path) return undefined
    return `${IMG}/${size}${path}`
  },
}