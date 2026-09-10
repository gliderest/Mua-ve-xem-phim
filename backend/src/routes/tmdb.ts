import { Router } from 'express'
import type { Request } from 'express'
import { env } from '../config/env.js'
import { ok } from '../lib/api.js'

/**
 * TMDB proxy — dùng TMDB_API_KEY phía server (tránh nhúng key vào bundle frontend).
 * Hiện tại chỉ phục vụ trailer để page chi tiết phim hiển thị YouTube embed.
 */
export const tmdbRouter = Router()

const TMDB_API = 'https://api.themoviedb.org/3'

interface TVideo {
  id: string
  key: string
  site: string
  type: string
  official?: boolean
}

interface TVideosResponse {
  results?: TVideo[]
}

async function fetchVideos(tmdbId: string, language: string): Promise<TVideo[]> {
  const url = `${TMDB_API}/movie/${tmdbId}/videos?language=${language}&api_key=${env.TMDB_API_KEY}`
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!r.ok) return []
  const j = (await r.json()) as TVideosResponse
  return j.results ?? []
}

/** Chọn video YouTube tốt nhất: Trailer official > Trailer > Teaser > video bất kỳ */
function pickYoutube(videos: TVideo[]): TVideo | null {
  const yt = videos.filter((v) => v.site === 'YouTube')
  return (
    yt.find((v) => v.type === 'Trailer' && v.official) ??
    yt.find((v) => v.type === 'Trailer') ??
    yt.find((v) => v.type === 'Teaser') ??
    yt[0] ??
    null
  )
}

/** GET /api/tmdb/videos/:tmdbId → { youtubeKey, type } | null */
tmdbRouter.get('/videos/:tmdbId', async (req: Request, res, next) => {
  try {
    const { tmdbId } = req.params
    if (!env.TMDB_API_KEY) {
      ok(res, null)
      return
    }
    // Ưu tiên vi-VN (trailer bản địa thường cho phép nhúng), nếu rỗng mới lấy en-US
    const [vn, en] = await Promise.all([fetchVideos(tmdbId, 'vi-VN'), fetchVideos(tmdbId, 'en-US')])
    const vnIds = new Set(vn.map((v) => v.id))
    const merged = [...vn, ...en.filter((v) => !vnIds.has(v.id))]
    const best = pickYoutube(merged)
    ok(res, best ? { youtubeKey: best.key, type: best.type } : null)
  } catch (e) { next(e) }
})