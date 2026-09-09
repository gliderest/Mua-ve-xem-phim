-- ============================================================
-- CINEGA — Supabase schema (Phase 2)
-- Chạy trong Supabase SQL Editor (hoặc supabase db push).
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
create type movie_status as enum ('NOW_SHOWING', 'COMING_SOON', 'ENDED');
create type seat_type as enum ('STANDARD', 'VIP');
create type booking_status as enum ('PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED');
create type payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
create type payment_provider as enum ('BANK_TRANSFER', 'SEPAY');
create type contact_status as enum ('NEW', 'READ', 'RESOLVED');

-- ---------- Profiles (mở rộng auth.users) ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text,
  email text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- Movies (phim & lịch niên TMDB) ----------
create table movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id bigint unique,
  title text not null,
  original_title text,
  overview text,
  duration_minutes int,
  genre text[] default '{}',
  release_date date,
  language text,
  certificate text,
  poster_url text,
  backdrop_url text,
  rating numeric(3,1) default 0,
  vote_count int default 0,
  status movie_status not null default 'NOW_SHOWING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Cinemas / Rooms / Seats ----------
create table cinemas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  district text,
  description text,
  room_count int not null default 1,
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  cinema_id uuid not null references cinemas (id) on delete cascade,
  name text not null,
  rows int not null,
  cols int not null,
  created_at timestamptz not null default now()
);

create table seats (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  row_label text not null,
  seat_number int not null,
  seat_type seat_type not null default 'STANDARD',
  unique (room_id, row_label, seat_number)
);

-- ---------- Showtimes ----------
create table showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references movies (id) on delete cascade,
  cinema_id uuid not null references cinemas (id) on delete cascade,
  room_id uuid not null references rooms (id) on delete cascade,
  date date not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  price_standard int not null default 90000,
  price_vip int not null default 120000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Bookings ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  showtime_id uuid not null references showtimes (id) on delete restrict,
  total_price int not null default 0,
  status booking_status not null default 'PENDING_PAYMENT',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table booking_seats (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  seat_id uuid not null references seats (id) on delete restrict,
  price int not null,
  unique (booking_id, seat_id)
);

-- ---------- Payments (VietQR / SePay) ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  amount int not null,
  provider payment_provider not null default 'BANK_TRANSFER',
  content_code text,
  bank_code text,
  account_number text,
  status payment_status not null default 'PENDING',
  raw_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Comments / Contact / Views / Ads ----------
create table comments (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references movies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text,
  content text not null,
  rating int not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status contact_status not null default 'NEW',
  created_at timestamptz not null default now()
);

create table website_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  view_date date not null default current_date,
  count int not null default 1,
  unique (path, view_date)
);

create table advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cta text,
  image_url text,
  is_active boolean not null default true,
  dismiss_cookie text not null default 'movie_ad_closed',
  created_at timestamptz not null default now()
-- ---------- Enable RLS ----------
alter table profiles enable row level security;
alter table movies enable row level security;
alter table cinemas enable row level security;
alter table rooms enable row level security;
alter table seats enable row level security;
alter table showtimes enable row level security;
alter table bookings enable row level security;
alter table booking_seats enable row level security;
alter table payments enable row level security;
alter table comments enable row level security;
alter table contact_messages enable row level security;
alter table website_views enable row level security;
alter table advertisements enable row level security;

-- ---------- Helper: người dùng có phải ADMIN ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN');
$$;

-- ---------- Policies ----------
-- Public đọc: movies, cinemas, rooms, seats, showtimes, comments, ads
create policy "movies public read" on movies for select using (true);
create policy "cinemas public read" on cinemas for select using (true);
create policy "rooms public read" on rooms for select using (true);
create policy "seats public read" on seats for select using (true);
create policy "showtimes public read" on showtimes for select using (true);
create policy "comments public read" on comments for select using (true);
create policy "ads public read" on advertisements for select using (is_active = true);
create policy "profiles public read" on profiles for select using (true);
create policy "profiles self update" on profiles for update using (auth.uid() = id);

-- Comments: khách/better backend tạo qua service_role
create policy "comments public insert" on comments for insert with check (true);

-- Bookings: chỉ chủ booking (hoặc admin)
create policy "bookings owner read" on bookings for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings owner insert" on bookings for insert with check (auth.uid() = user_id or public.is_admin());
create policy "bookings owner update" on bookings for update using (auth.uid() = user_id or public.is_admin());

create policy "booking_seats owner read" on booking_seats for select using (
  exists (select 1 from bookings b where b.id = booking_seats.booking_id and (b.user_id = auth.uid() or public.is_admin()))
);
create policy "booking_seats owner insert" on booking_seats for insert with check (
  exists (select 1 from bookings b where b.id = booking_seats.booking_id and (b.user_id = auth.uid() or public.is_admin()))
);

create policy "payments owner read" on payments for select using (
  exists (select 1 from bookings b where b.id = payments.booking_id and (b.user_id = auth.uid() or public.is_admin()))
);

create policy "contact public insert" on contact_messages for insert with check (true);
create policy "contact admin read" on contact_messages for select using (public.is_admin());
create policy "views public insert" on website_views for insert with check (true);
create policy "views admin read" on website_views for select using (public.is_admin());

create policy "admin all movies" on movies for all using (public.is_admin());
create policy "admin all cinemas" on cinemas for all using (public.is_admin());
create policy "admin all rooms" on rooms for all using (public.is_admin());
create policy "admin all seats" on seats for all using (public.is_admin());
create policy "admin all showtimes" on showtimes for all using (public.is_admin());
create policy "admin all comments" on comments for all using (public.is_admin());
create policy "admin all ads" on advertisements for all using (public.is_admin());
create policy "admin all payments" on payments for all using (public.is_admin());
-- ---------- Updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger movies_updated_at before update on movies
  for each row execute function public.set_updated_at();
create trigger showtimes_updated_at before update on showtimes
  for each row execute function public.set_updated_at();

-- ---------- Indexes ----------
create index idx_movies_status on movies (status);
create index idx_showtimes_movie on showtimes (movie_id, date);
create index idx_showtimes_cinema on showtimes (cinema_id, date);
create index idx_bookings_user on bookings (user_id);
create index idx_bookings_showtime on bookings (showtime_id, status);
create index idx_booking_seats_seat on booking_seats (seat_id);
create index idx_comments_movie on comments (movie_id);
create index idx_views_date on website_views (view_date);

-- ---------- Seed: rạp + phòng + ghế ----------
insert into cinemas (name, address, district, description, room_count) values
  ('CINEGA Landmark 81', 'Tầng 68, Vinhomes Landmark 81, Bình Thạnh, TP.HCM', 'Bình Thạnh', 'Phòng chiếu cao nhất Việt Nam, Dolby Atmos.', 6),
  ('CINEGA Royal Center', '30 Tràng Tiền, Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', 'Không gian cổ điển hoài cổ.', 4),
  ('CINEGA The Riviera', 'Lầu 3, 36 Nguyễn Hữu Thọ, Q.7, TP.HCM', 'Quận 7', 'Phòng VIP ghế massage.', 5);

with c as (select id from cinemas)
insert into rooms (cinema_id, name, "rows", cols)
select id, name, 10, 13 from c;

with r as (select id from rooms)
insert into seats (room_id, row_label, seat_number, seat_type)
select
  r.id,
  chr(64 + row_num),
  col,
  case when row_num > 8 then 'VIP'::seat_type else 'STANDARD' end
from r
cross join generate_series(1, 9) as row_num
cross join generate_series(1, 13) as col;

-- ---------- Helper: cập nhật movie status theo ngày ----------
create or replace function public.sync_movie_status()
returns void language sql security definer as $$
  update movies set status = 'NOW_SHOWING' where release_date <= current_date and status = 'COMING_SOON';
  update movies set status = 'COMING_SOON' where release_date > current_date and status = 'NOW_SHOWING';
$$;
);
-- ---------- Tăng lượt xem ----------
create or replace function public.increase_view(p_path text, p_date date)
returns void language sql security definer as $$
  insert into website_views (path, view_date, count)
  values (p_path, p_date, 1)
  on conflict (path, view_date)
  do update set count = website_views.count + 1;
$$;
