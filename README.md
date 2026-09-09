# CINEGA — Cinema Ticket Booking System

Hệ thống đặt vé xem phim full-stack: **React Website + Express REST API + Supabase PostgreSQL + TMDB + Thanh toán ngân hàng (VietQR/SePay)**.

> Đọc kỹ: [`cinema-ticket-system-architecture.md`](./cinema-ticket-system-architecture.md)

## Quy tắc thiết kế (bắt buộc)
- **TUYỆT ĐỐI không dùng thư viện UI/template** (MUI, Ant, Bootstrap, Tailwind, DaisyUI, Shadcn, ...).
- Giao diện: **Custom CSS thuần + SVG tự vẽ + GSAP** — phong cách **Cinematic / CINEGA**.
- Responsive 3 mức: `<800px`, `800–1199px`, `>=1200px`.

## Dữ liệu phim
- Phim đang chiếu/sắp chiếu tại VN được **đồng bộ từ TMDB vào Supabase** (`POST /api/admin/movies/sync-tmdb`, hoặc tự sync khi bảng `movies` trống).
- Ảnh poster/backdrop thật từ `image.tmdb.org`.

## Cấu trúc monorepo
```text
├── web/        # React + Vite + TS + React Router (giao diện web)
├── backend/    # Express + TS + Supabase (REST API + đang phục vụ cả web/dist)
├── mobile/     # React Native + Expo — Phase 6
├── docker-compose.yml  # PostgreSQL local (dev)
├── render.yaml # Blueprint deploy — 1 Web Service chạy cả API + giao diện
└── .env / .env.example # biến môi trường (KHÔNG commit .env)
```

## Chạy local
```bash
npm install
# Terminal 1 — backend (cần .env có SUPABASE keys + JWT_SECRET)
npm run dev:backend
# Terminal 2 — web
npm run dev:web        # http://localhost:5173
```

## Deploy lên Render + Supabase
1. **Supabase:** dán `backend/src/db/schema.sql` vào SQL Editor → Run.
2. **Supabase Auth:** Authentication → Sign In / Up → Email → **"Confirm email" TẮT** (để đăng ký tự active).
3. **Render:** New + → **Blueprint** → chọn repo (có `render.yaml`) → Deploy.
   - Hoặc dùng Web Service hiện có: đổi **Build Command** thành
     `npm install && npm run build:backend && npm run build:web`,
     **Start Command** thành `npm run start:backend`,
     rồi thêm các env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `FRONTEND_URL`, `TMDB_API_KEY`.
4. **Đổi tên domain:** Settings → Service Name = `cinega` → URL mới `https://cinega.onrender.com`.

## Biến môi trường
Copy `.env.example` → `.env` và điền giá trị thực. Xem `web/.env.example`, `backend/.env.example`.