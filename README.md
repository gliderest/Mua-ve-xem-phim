# CINÉRA — Cinema Ticket Booking System

Hệ thống đặt vé xem phim full-stack: **React Website + React Native Mobile + Express REST API + Supabase PostgreSQL + Thanh toán ngân hàng (VietQR/SePay)**.

> Đọc kỹ: [`cinema-ticket-system-architecture.md`](./cinema-ticket-system-architecture.md)

## Quy tắc thiết kế (bắt buộc)
- **TUYỆT ĐỐI không dùng thư viện UI/template** (MUI, Ant, Bootstrap, Tailwind, DaisyUI, Shadcn, ...).
- Giao diện: **Custom CSS thuần + SVG tự vẽ + GSAP** — phong cách **Cinematic / CINÉRA**.
- Responsive 3 mức: `<800px`, `800–1199px`, `>=1200px`.

## Dữ liệu phim
- **TMDB API `region=VN`** — phim đang chiếu / sắp chiếu tại Việt Nam (poster ảnh thật, rating, thể loại).
- Key đặt trong `web/.env` (`VITE_TMDB_API_KEY`) — xem `web/.env.example`.
- Khi thiếu key hoặc TMDB lỗi → tự fallback về dữ liệu mock.

## Cấu trúc monorepo
```text
├── web/        # React + Vite + TS + React Router (giao diện web)
├── backend/    # Express + TS + Supabase (REST API) — Phase 2
├── mobile/     # React Native + Expo — Phase 6
├── docker-compose.yml  # PostgreSQL local (Phase 2 — không bắt buộc cho prototype)
└── .env / .env.example # biến môi trường (KHÔNG commit .env)
```

## Chạy local (không cần database)

**Cách 1 — nhanh nhất (Windows):** double-click file **`start-web.bat`**
→ nó tự cài dependencies (nếu cần) và tự mở trình duyệt `http://localhost:5173`.

**Cách 2 — bằng lệnh:**
```bash
npm install
npm run dev:web      # mở http://localhost:5173
```

Khi nào cần database? **KHÔNG cần** cho prototype. Phase 2 (backend) mới cần Supabase /
PostgreSQL local — lúc đó mới chạy `docker compose up -d`.

## Biến môi trường
Copy `.env.example` → `.env` và điền giá trị thực (Supabase, JWT, ...). Xem thêm `web/.env.example`, `backend/.env.example`.