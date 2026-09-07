# CINÉRA — Cinema Ticket Booking System

Hệ thống đặt vé xem phim full-stack: **React Website + React Native Mobile + Express REST API + Supabase PostgreSQL + Thanh toán ngân hàng (VietQR/SePay)**.

> Đọc kỹ: [`cinema-ticket-system-architecture.md`](./cinema-ticket-system-architecture.md)

## Quy tắc thiết kế (bắt buộc)
- **TUYỆT ĐỐI không dùng thư viện UI/template** (MUI, Ant, Bootstrap, Tailwind, DaisyUI, Shadcn, ...).
- Giao diện: **Custom CSS thuần + SVG tự vẽ + GSAP** — phong cách **Cinematic / CINÉRA**.
- Responsive 3 mức: `<800px`, `800–1199px`, `>=1200px`.

## Cấu trúc monorepo
```text
├── web/        # React + Vite + TS + React Router (giao diện web)
├── backend/    # Express + TS + Supabase (REST API) — Phase 2
├── mobile/     # React Native + Expo — Phase 6
├── docker-compose.yml  # PostgreSQL local (dev)
└── .env / .env.example # biến môi trường (KHÔNG commit .env)
```

## Chạy local
```bash
npm install        # cài dependencies (npm workspaces)
npm run dev:web    # web dev server → http://localhost:5173
docker compose up -d   # (tùy chọn) chạy PostgreSQL local cho backend
```

## Biến môi trường
Copy `.env.example` → `.env` và điền giá trị thực (Supabase, JWT, ...). Xem thêm `web/.env.example`, `backend/.env.example`.