import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env.js'

/**
 * Supabase client.
 * - admin: service_role — CHỈ dùng phía server cho các thao tác tin cậy (seed, xác thực token).
 * - anon:  anon key — dùng cho đọc dữ liệu public qua RLS.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export const supabaseAnon: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

/**
 * Lấy user từ JWT (Bearer token) do Supabase Auth cấp.
 * Trả null nếu token không hợp lệ.
 */
export async function userFromRequest(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) return { user: null, error: null }
  const token = authHeader.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return { user: null, error }
  // Lấy profile (role)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle()
  return { user: { ...data.user, profile: profile ?? null }, error: null }
}

export type AuthedUser = Awaited<ReturnType<typeof userFromRequest>>['user']