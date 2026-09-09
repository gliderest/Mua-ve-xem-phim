/**
 * CINEGA Backend — Environment variables (validated).
 * Load từ root .env (npm workspace) hoặc process.env (Render).
 */
import 'dotenv/config'

function required(name: string, fallback = ''): string {
  const v = process.env[name] ?? fallback
  if (!v) throw new Error(`[backed] Thiếu env: ${name} — xem backend/.env.example`)
  return v
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  // Supabase
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  // Auth
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Frontend / CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // SePay webhook (mock ở dev)
  SEPAY_API_KEY: process.env.SEPAY_API_KEY || '',
  SEPAY_WEBHOOK_SECRET: process.env.SEPAY_WEBHOOK_SECRET || '',
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER || '1900123456789',
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME || 'CINEGA ENTERTAINMENT',
  BANK_CODE: process.env.BANK_CODE || '970422',
  // TMDB (đồng bộ phim đang chiếu VN vào Supabase)
  TMDB_API_KEY: process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '',
}