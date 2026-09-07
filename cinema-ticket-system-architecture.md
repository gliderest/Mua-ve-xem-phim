# Cinema Ticket System — System Architecture & Coding Agent Specification

> Project: **Cinema Ticket Booking Website + Mobile App**
>
> Course: Web Programming — Large Assignment
>
> Architecture goal: Build a real full-stack cinema ticket booking system with a React website, React Native mobile app, Express REST API, Supabase PostgreSQL, real bank-transfer payment confirmation via VietQR + SePay webhook, and a custom frontend design system.
>
> **Critical course constraint:** Do not copy existing websites, templates, dashboards, UI kits, or pre-built visual components. The frontend must be designed and implemented from scratch. Libraries are allowed only when they provide technical infrastructure rather than replacing the project's own UI/design work.

---

## 1. Product Vision

Build a premium, cinematic cinema ticket booking platform.

The primary user journey is:

```text
Discover movies
    ↓
Movie detail
    ↓
Choose cinema
    ↓
Choose date
    ↓
Choose showtime
    ↓
Choose seats
    ↓
Create booking
    ↓
Bank-transfer payment via VietQR
    ↓
SePay detects incoming transfer
    ↓
Backend verifies transaction
    ↓
Booking becomes PAID
    ↓
Digital ticket / QR code
```

The same backend API must serve both:

```text
React Web
     │
     ├──────── REST API ──────── Express Backend
     │                                  │
React Native Mobile                     │
                                        ▼
                                  Supabase PostgreSQL
                                        │
                                  Supabase Storage
```

---

# 2. Course Requirements Mapping

The implementation must explicitly satisfy all of the following.

## Website

- Database-backed data.
- Login and logout.
- Username + password authentication.
- Two roles: `ADMIN` and `USER`.
- Dynamic content page by ID, e.g. `/movies/:id`.
- Comment form:
  - name
  - email
  - content
  - rating
- Submitted comments and ratings are publicly visible.
- Homepage advertisement popup appears 60 seconds after opening.
- Popup dismissal is persisted using a cookie.
- About page.
- Contact page.
- Contact opinion form.
- Admin dashboard.
- Admin can see total website views.
- Admin can update movie/content information.
- Admin can list and delete user comments.
- Responsive layout with three ranges:
  - `< 800px`
  - `800px–1199px`
  - `>= 1200px`
- Original visual design.
- Clean project organization.
- Avoid copied/pre-built UI libraries/templates because of the assignment penalty.

## Mobile App

- Communicates with the backend through REST API.
- Home screen.
- Login screen.
- Dynamic movie/content screen.
- User can comment and rate movies.
- Contact/opinion screen.
- Original responsive/adaptive mobile UI.
- Clean project organization.
- Avoid copied/pre-built UI templates/components.

---

# 3. Technology Stack

## Web

- React
- Vite
- React Router
- JavaScript or TypeScript (prefer TypeScript if project setup permits)
- Custom CSS / CSS Modules
- Web APIs where appropriate

## Animation / Visuals

- GSAP
- SVG created and animated by the project
- CSS transitions/keyframes
- Web Animation API where useful

Use animation deliberately. Do not add motion everywhere just for decoration.

## Backend

- Node.js
- Express
- REST API
- JWT authentication
- bcrypt password hashing
- Zod request validation

## Database / Backend Services

- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime may be used for payment-status updates

## Mobile

- React Native
- Expo
- React Navigation
- React Native StyleSheet / custom styling

## Payment

- VietQR-compatible bank transfer QR
- SePay webhook for automatic transaction notification
- Real bank transfer
- No real payment gateway integration is required.

The payment architecture is:

```text
Booking
  ↓
PENDING_PAYMENT
  ↓
Display VietQR
  ↓
User transfers money
  ↓
Bank account
  ↓
SePay
  ↓
POST /api/webhooks/sepay
  ↓
Verify webhook
  ↓
Verify transfer amount
  ↓
Verify booking code
  ↓
Verify transaction is not duplicated
  ↓
Create payment record
  ↓
Booking = PAID
  ↓
Generate/show digital ticket
```

## Deployment

- Backend: Render Free
- Database: Supabase
- Web: Vercel or Render
- Mobile: Expo development / Android build
- GitHub for source control

---

# 4. Architectural Principles

1. **Backend is the authority for business rules.**
2. Frontend must never decide that a payment succeeded.
3. Mobile and web must use the same REST API.
4. Never expose secrets in frontend/mobile code.
5. Never trust client-provided price, role, payment status, or seat availability.
6. Database constraints must prevent duplicate seat booking.
7. Payment webhook must be idempotent.
8. Every payment transaction must be traceable by a unique transaction ID.
9. UI must be original.
10. Use libraries for infrastructure/behavior, not copied visual templates.
11. Prefer simple architecture that is easy to explain during course defense.
12. Every important user-facing operation needs loading, success, empty, and error states.

---

# 5. High-Level Architecture

```text
                         INTERNET
                            │
             ┌──────────────┴──────────────┐
             │                             │
       React Website                 React Native App
             │                             │
             └──────────────┬──────────────┘
                            │
                         HTTPS
                            │
                            ▼
                  ┌───────────────────┐
                  │   Express API     │
                  │   Render Free     │
                  ├───────────────────┤
                  │ Auth              │
                  │ Movies            │
                  │ Cinemas           │
                  │ Showtimes         │
                  │ Seats             │
                  │ Bookings          │
                  │ Payments          │
                  │ Comments          │
                  │ Contact           │
                  │ Admin             │
                  │ Webhooks          │
                  └─────────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       Supabase DB      Supabase       SePay
       PostgreSQL       Storage        Webhook
             │
             ▼
      Supabase Realtime
```

---

# 6. Repository Structure

Use a monorepo:

```text
cinema-ticket-system/
│
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml                 # optional local services
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma              # optional if Prisma is used
│   │   └── seed.ts
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       │
│       ├── config/
│       │   ├── env.ts
│       │   └── supabase.ts
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── admin.middleware.ts
│       │   ├── error.middleware.ts
│       │   ├── rate-limit.middleware.ts
│       │   └── validate.middleware.ts
│       │
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── movies.routes.ts
│       │   ├── cinemas.routes.ts
│       │   ├── showtimes.routes.ts
│       │   ├── seats.routes.ts
│       │   ├── bookings.routes.ts
│       │   ├── payments.routes.ts
│       │   ├── comments.routes.ts
│       │   ├── contact.routes.ts
│       │   ├── views.routes.ts
│       │   ├── admin.routes.ts
│       │   └── webhook.routes.ts
│       │
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── validators/
│       ├── types/
│       └── utils/
│
├── web/
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── assets/
│       │   ├── images/
│       │   └── svg/
│       │
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── movie/
│       │   ├── booking/
│       │   ├── payment/
│       │   ├── comments/
│       │   └── admin/
│       │
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── MoviesPage.tsx
│       │   ├── MovieDetailPage.tsx
│       │   ├── BookingPage.tsx
│       │   ├── PaymentPage.tsx
│       │   ├── TicketPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── MyTicketsPage.tsx
│       │   ├── AboutPage.tsx
│       │   ├── ContactPage.tsx
│       │   ├── NotFoundPage.tsx
│       │   └── admin/
│       │
│       ├── hooks/
│       ├── services/
│       │   ├── api.ts
│       │   ├── auth.service.ts
│       │   ├── movie.service.ts
│       │   ├── booking.service.ts
│       │   ├── payment.service.ts
│       │   └── comment.service.ts
│       │
│       ├── context/
│       │   └── AuthContext.tsx
│       │
│       ├── styles/
│       │   ├── globals.css
│       │   ├── variables.css
│       │   ├── animations.css
│       │   └── responsive.css
│       │
│       └── utils/
│
└── mobile/
    ├── package.json
    ├── app.json
    └── src/
        ├── App.tsx
        ├── screens/
        │   ├── HomeScreen.tsx
        │   ├── LoginScreen.tsx
        │   ├── RegisterScreen.tsx
        │   ├── MoviesScreen.tsx
        │   ├── MovieDetailScreen.tsx
        │   ├── ShowtimeScreen.tsx
        │   ├── SeatSelectionScreen.tsx
        │   ├── PaymentScreen.tsx
        │   ├── TicketScreen.tsx
        │   └── ContactScreen.tsx
        ├── components/
        ├── navigation/
        ├── services/
        │   └── api.ts
        ├── context/
        ├── hooks/
        ├── assets/
        └── utils/
```

---

# 7. Database Model

Use Supabase PostgreSQL.

Core tables:

```text
users
movies
cinemas
rooms
seats
showtimes
bookings
booking_seats
payments
comments
contact_messages
website_views
advertisements
```

## users

```text
id
username UNIQUE
password_hash
email UNIQUE
full_name
role              # USER | ADMIN
created_at
updated_at
```

Never store plaintext passwords.

## movies

```text
id
title
description
poster_url
backdrop_url
duration_minutes
genre
director
cast
release_date
status             # NOW_SHOWING | COMING_SOON | ENDED
created_at
updated_at
```

## cinemas

```text
id
name
address
description
created_at
updated_at
```

## rooms

```text
id
cinema_id FK
name
created_at
```

## seats

```text
id
room_id FK
row_label
seat_number
seat_type          # STANDARD | VIP
created_at
```

There must be a unique constraint such as:

```text
UNIQUE(room_id, row_label, seat_number)
```

## showtimes

```text
id
movie_id FK
room_id FK
start_time
end_time
price
created_at
```

## bookings

```text
id
user_id FK
showtime_id FK
booking_code UNIQUE
total_price
status             # PENDING_PAYMENT | PAID | EXPIRED | CANCELLED
expires_at
created_at
updated_at
```

## booking_seats

```text
id
booking_id FK
seat_id FK
price
created_at
```

Prevent the same seat from being booked twice for the same showtime. The final implementation must enforce this at database/service level, not only in the UI.

## payments

```text
id
booking_id FK
amount
method             # BANK_TRANSFER
status             # PENDING | SUCCESS | FAILED
transaction_id UNIQUE
bank_code
transfer_content
paid_at
created_at
```

## comments

```text
id
movie_id FK
user_id FK nullable
name
email
content
rating             # 1–5
created_at
updated_at
```

## contact_messages

```text
id
name
email
message
status             # NEW | READ | RESOLVED
created_at
```

## website_views

Recommended daily aggregation:

```text
id
view_date UNIQUE
count
```

## advertisements

```text
id
title
description
image_url
product_url nullable
active
created_at
updated_at
```

---

# 8. Authentication

Implement username/password authentication.

Flow:

```text
POST /api/auth/login
       ↓
Find user by username
       ↓
bcrypt.compare(password, password_hash)
       ↓
Create JWT
       ↓
Return authenticated user + token
```

JWT payload:

```json
{
  "userId": "USER_ID",
  "role": "USER"
}
```

Required endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

For logout, if using stateless JWT, client must remove its stored token. If refresh tokens are implemented, revoke/delete them server-side.

Protected routes must verify JWT.

Admin routes must additionally verify:

```text
role === ADMIN
```

Never trust a role sent by the frontend.

---

# 9. Movie Domain

Required public endpoints:

```text
GET /api/movies
GET /api/movies/:id
GET /api/movies/:id/showtimes
GET /api/movies/:id/comments
```

Admin:

```text
POST   /api/admin/movies
PUT    /api/admin/movies/:id
DELETE /api/admin/movies/:id
```

Movie detail page:

```text
/movies/:id
```

Must display different movie content based on the URL ID.

Include:

- poster
- backdrop
- title
- description
- genre
- duration
- director
- cast
- release date
- average rating
- rating count
- comments
- available showtimes
- booking CTA

---

# 10. Cinema / Showtime / Seat Booking Domain

User flow:

```text
Movie
  ↓
Cinema
  ↓
Date
  ↓
Showtime
  ↓
Seat Selection
  ↓
Booking Summary
```

Seat states:

```text
AVAILABLE
SELECTED
BOOKED
```

Visual states must be clearly distinguishable.

Never trust the frontend's selected-seat price.

Backend must calculate:

```text
total_price =
sum(price for selected valid seats)
```

---

# 11. Booking Creation

Endpoint:

```text
POST /api/bookings
```

Request concept:

```json
{
  "showtimeId": 123,
  "seatIds": [12, 13]
}
```

Backend must:

1. Authenticate user.
2. Validate showtime.
3. Validate seats belong to the selected room.
4. Check seats are available for the showtime.
5. Calculate price server-side.
6. Generate unique booking code.
7. Create booking as `PENDING_PAYMENT`.
8. Create booking-seat records.
9. Set `expires_at`, e.g. 15 minutes.
10. Return booking + payment information.

Use a database transaction for booking creation.

---

# 12. Booking Expiration

Default:

```text
PENDING_PAYMENT → EXPIRED
```

after approximately 15 minutes.

Expired bookings must not remain valid.

The implementation can use:

- scheduled cleanup job, or
- expiration checks whenever booking/payment state is accessed, or
- both.

Do not introduce unnecessary infrastructure for the course project.

---

# 13. Real Bank Transfer Payment

Payment is **real bank transfer**, not fake payment.

Recommended architecture:

```text
Backend creates booking
       ↓
Generate booking_code
       ↓
Generate VietQR payment data
       ↓
Payment page shows:
  - QR
  - amount
  - bank
  - account
  - transfer content
       ↓
User transfers money
       ↓
Bank receives transfer
       ↓
SePay detects transaction
       ↓
SePay webhook
       ↓
POST /api/webhooks/sepay
```

The transfer content should contain a unique booking code.

Example:

```text
CINEMA82931
```

Do not rely on amount alone because two users may owe the same amount.

---

# 14. SePay Webhook Processing

Endpoint:

```text
POST /api/webhooks/sepay
```

Webhook processing must:

1. Verify webhook authentication/signature according to the selected SePay integration method.
2. Confirm transfer direction is incoming.
3. Extract transaction ID.
4. Check transaction ID has not already been processed.
5. Find booking using booking code in transfer content.
6. Confirm booking is `PENDING_PAYMENT`.
7. Confirm transfer amount equals booking total.
8. Confirm booking is not expired.
9. Create `payments` record.
10. Update booking to `PAID`.
11. Return successful HTTP response.

Concept:

```text
Webhook
   ↓
Authenticate
   ↓
Incoming transfer?
   ↓ yes
Transaction already processed?
   ├── yes → return success/idempotent
   └── no
        ↓
Find booking code
        ↓
Amount matches?
        ↓
Booking still pending?
        ↓
Create payment
        ↓
Booking = PAID
        ↓
Notify frontend/mobile
```

Never allow a frontend request such as:

```text
POST /api/bookings/:id/mark-paid
```

to mark a booking as paid.

Only verified payment processing can do this.

---

# 15. Payment Status UI

Payment page:

```text
┌────────────────────────────────────┐
│          COMPLETE PAYMENT          │
│                                    │
│              [ QR ]                │
│                                    │
│          160,000 VND               │
│                                    │
│ Transfer content:                  │
│ CINEMA82931                        │
│                                    │
│          Waiting for payment       │
│              14:32                 │
└────────────────────────────────────┘
```

After webhook:

```text
PENDING
   ↓
✓ PAYMENT SUCCESS
   ↓
Digital ticket
```

Use Supabase Realtime if practical.

Fallback: poll payment status through:

```text
GET /api/payments/:bookingId/status
```

Do not poll excessively.

---

# 16. Digital Ticket

After successful payment:

```text
Ticket
├── movie
├── cinema
├── room
├── date
├── start time
├── seats
├── booking code
├── amount
└── QR code
```

QR code can encode:

```text
booking_code
```

or a signed ticket verification URL.

Do not put sensitive user information inside the QR code.

---

# 17. Comments and Ratings

Public:

```text
GET /api/movies/:movieId/comments
```

Authenticated:

```text
POST /api/movies/:movieId/comments
```

Fields:

```text
name
email
content
rating
```

Validation:

```text
name: required
email: valid email
content: required, reasonable max length
rating: integer 1–5
```

After successful submission, refresh/revalidate the public comment list.

Comments are publicly visible.

Admin:

```text
GET    /api/admin/comments
DELETE /api/admin/comments/:id
```

---

# 18. Homepage Advertisement Requirement

The homepage must display a predefined product/movie-related advertisement after 60 seconds.

Implementation:

```text
Home page mounts
       ↓
Check cookie
       ↓
If cookie exists:
    do nothing
Else:
    setTimeout(60000)
       ↓
    show popup
```

When user closes:

```text
movie_ad_closed=true
```

Use an appropriate expiration/max-age.

Do not show the popup again when the user later revisits the site if the cookie is still valid.

The popup should have:

- image
- title
- description
- CTA
- close button

Animation:

```text
opacity: 0 → 1
scale: 0.96 → 1
```

Use GSAP/CSS rather than a modal UI library.

---

# 19. Website View Counter

Track total website views.

Recommended behavior:

- Increment homepage/site view in backend.
- Avoid incrementing multiple times from one browser reload if the course interpretation permits a simple visitor/session counter.
- Store aggregated daily counts in `website_views`.

Admin endpoint:

```text
GET /api/admin/stats
```

Example response:

```json
{
  "totalViews": 35821,
  "totalUsers": 523,
  "totalMovies": 42,
  "totalBookings": 1245
}
```

---

# 20. Contact Page

Route:

```text
/contact
```

Form:

```text
name
email
message
```

Endpoint:

```text
POST /api/contact
```

Store submissions in `contact_messages`.

Show:

```text
loading
success
error
```

states.

---

# 21. Admin Dashboard

Routes:

```text
/admin
/admin/movies
/admin/comments
/admin/contact
```

Admin dashboard should contain:

```text
Total website views
Total users
Total movies
Total bookings
Paid bookings
Pending bookings
```

Admin movie management:

```text
Create
Read
Update
Delete
```

Admin comment management:

```text
List
Delete
```

Do not use a pre-built admin dashboard template.

The admin UI must use the same custom design language as the rest of the website.

---

# 22. Frontend Design Direction

## Brand concept

Working brand name:

```text
CINÉRA
```

The name can be changed later.

Visual direction:

**Premium cinematic / modern cinema / editorial film aesthetic.**

Avoid:

- generic Bootstrap look
- generic SaaS dashboard
- excessive gradients
- excessive glassmorphism
- copying Netflix
- copying CGV
- copying Galaxy Cinema
- copying any existing cinema website

The design should feel original.

---

# 23. Frontend Design Skills

The coding agent should use these four skill collections:

1. `frontend-design-pro`
2. `web-animation-skills`
3. `frontend-agent-skills`
4. `frontend-ui-ux-skill`

Their role:

```text
frontend-design-pro
    ↓
Visual direction + design system + layout

web-animation-skills
    ↓
GSAP + SVG + motion + performance

frontend-agent-skills
    ↓
UX + checkout + accessibility + interaction

frontend-ui-ux-skill
    ↓
Review + quality + usability + responsive checks
```

These skills are guidance/workflow. Do not copy their example UI into the project.

---

# 24. Anti-Copy / Course Compliance Rule

This is a hard requirement.

DO NOT use:

- Material UI as the visual system
- Ant Design as the visual system
- Bootstrap components
- DaisyUI
- Flowbite
- Chakra UI
- copied Shadcn UI component collections
- pre-built cinema templates
- pre-built admin dashboard templates
- copied layouts from GitHub
- copied Netflix/CGV/Galaxy Cinema layouts

Do not import a component simply because it already looks like the desired design.

Allowed:

- React
- React Router
- Express
- Supabase
- JWT
- bcrypt
- Zod
- GSAP
- React Native
- Expo
- technical utility libraries

For visual UI, prefer:

```text
Semantic HTML
+
Custom CSS
+
SVG
+
GSAP
+
Web APIs
```

The agent must be able to explain how each major visual component was built.

---

# 25. Responsive Breakpoints

Hard requirement:

```text
Mobile:
< 800px

Tablet:
800px–1199px

Desktop:
>= 1200px
```

Use custom CSS.

Example:

```css
@media (max-width: 799px) {
  /* mobile */
}

@media (min-width: 800px) and (max-width: 1199px) {
  /* tablet */
}

@media (min-width: 1200px) {
  /* desktop */
}
```

Do not make desktop UI and simply shrink it on mobile.

Mobile layouts should be intentionally designed.

---

# 26. Animation System

Animation should communicate hierarchy and state.

## Hero

Potential sequence:

```text
Page enter
 ↓
Logo reveal
 ↓
Hero title split/reveal
 ↓
Backdrop fade
 ↓
Poster scale/parallax
 ↓
CTA reveal
```

## Movie cards

```text
Hover
 ↓
image scale
 ↓
overlay appears
 ↓
metadata moves/reveals
```

Keep performance in mind.

## Page transitions

Use lightweight GSAP transitions where appropriate.

## Seat selection

```text
AVAILABLE
    ↓ hover
scale slightly

SELECTED
    ↓
scale + subtle pulse

BOOKED
    ↓
no interaction
```

## Ticket success

Use an original SVG ticket animation:

```text
ticket path draw
      ↓
barcode / QR reveal
      ↓
success indicator
```

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* reduce/disable non-essential motion */
}
```

---

# 27. Custom SVG Strategy

Create original SVG assets for:

- cinema logo
- film reel
- ticket
- empty states
- success state
- payment state
- seat map elements
- decorative film-strip elements

SVG should be authored specifically for this project.

Potential SVG animations:

- stroke drawing
- path reveal
- subtle rotation
- opacity reveal
- transform/scale
- morphing only where useful

Avoid downloading an existing animated SVG and using it unchanged.

---

# 28. Design Tokens

Create a small custom design system.

Example:

```css
:root {
  --bg-primary: ...;
  --bg-secondary: ...;
  --surface: ...;
  --text-primary: ...;
  --text-secondary: ...;
  --accent: ...;
  --border: ...;

  --space-1: ...;
  --space-2: ...;
  --space-3: ...;
  --space-4: ...;
  --space-5: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;

  --duration-fast: ...;
  --duration-normal: ...;
  --duration-slow: ...;
}
```

The exact visual values should be decided during the design phase, not blindly copied from another project.

---

# 29. Website Routes

Public:

```text
/
/movies
/movies/:id
/cinemas
/booking/:showtimeId
/payment/:bookingId
/ticket/:bookingId
/login
/register
/my-tickets
/about
/contact
```

Admin:

```text
/admin
/admin/movies
/admin/movies/new
/admin/movies/:id/edit
/admin/comments
/admin/contact
```

Protect admin routes.

---

# 30. Mobile Navigation

Recommended:

```text
Bottom Tabs
├── Home
├── Movies
├── Tickets
└── Profile
```

Stack screens:

```text
Movie Detail
    ↓
Showtime
    ↓
Seat Selection
    ↓
Payment
    ↓
Ticket
```

Do not make the mobile app simply a web page inside a WebView.

It must be a real React Native interface using the API.

---

# 31. REST API Contract

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Movies

```text
GET    /api/movies
GET    /api/movies/:id
POST   /api/admin/movies
PUT    /api/admin/movies/:id
DELETE /api/admin/movies/:id
```

## Cinemas

```text
GET /api/cinemas
GET /api/cinemas/:id
```

## Showtimes

```text
GET /api/showtimes
GET /api/showtimes/:id
GET /api/movies/:movieId/showtimes
```

## Seats

```text
GET /api/showtimes/:showtimeId/seats
```

## Bookings

```text
POST /api/bookings
GET  /api/bookings/my
GET  /api/bookings/:id
POST /api/bookings/:id/cancel
```

## Payments

```text
GET /api/payments/:bookingId/status
```

Payment creation can be part of booking creation or a dedicated endpoint.

## Comments

```text
GET    /api/movies/:movieId/comments
POST   /api/movies/:movieId/comments
GET    /api/admin/comments
DELETE /api/admin/comments/:id
```

## Contact

```text
POST /api/contact
```

## Admin

```text
GET /api/admin/stats
```

## Webhook

```text
POST /api/webhooks/sepay
```

---

# 32. API Response Convention

Use a consistent response structure.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_EXPIRED",
    "message": "This booking has expired."
  }
}
```

Use appropriate HTTP status codes.

Examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

---

# 33. Validation

Validate on both client and server.

Server is authoritative.

Examples:

```text
email format
password length
rating 1–5
movie ID
showtime ID
seat IDs
booking ownership
admin permissions
payment amount
booking expiration
```

Never rely only on frontend validation.

---

# 34. Security Rules

Never commit:

```text
.env
API keys
JWT secrets
SePay credentials
bank account secrets
Supabase service role key
```

Use:

```text
.env.example
```

with placeholders.

Important:

- Supabase service role key is backend-only.
- Do not put it in React or React Native.
- Use HTTPS in production.
- Validate webhook authenticity.
- Rate-limit login.
- Sanitize/validate user-generated content.
- Never trust client prices.
- Never trust client roles.
- Never allow arbitrary payment status updates.
- Never expose internal error stack traces in production.

---

# 35. Environment Variables

Backend example:

```env
NODE_ENV=development
PORT=3000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

SEPAY_API_KEY=
SEPAY_WEBHOOK_SECRET=

BANK_CODE=
BANK_ACCOUNT_NUMBER=
BANK_ACCOUNT_NAME=

FRONTEND_URL=
MOBILE_API_URL=
```

Web:

```env
VITE_API_URL=
```

Mobile:

```env
EXPO_PUBLIC_API_URL=
```

Only public-safe variables may use `VITE_` / `EXPO_PUBLIC_`.

---

# 36. Supabase Usage

Use Supabase for:

## PostgreSQL

All core business data.

## Storage

Buckets:

```text
movie-posters
movie-backdrops
advertisements
```

## Realtime

Optional but recommended for:

```text
booking.payment_status
```

When payment becomes `PAID`:

```text
Supabase DB
   ↓
Realtime event
   ↓
Web/Mobile
   ↓
Payment Success UI
```

Do not expose privileged Supabase credentials.

---

# 37. Render Deployment

Backend deployment:

```text
GitHub
   ↓
Render Web Service
   ↓
Node/Express
```

Production:

```text
https://<backend-domain>
```

Webhook:

```text
https://<backend-domain>/api/webhooks/sepay
```

Render environment variables must contain all secrets.

Do not rely on local `.env`.

---

# 38. Free-Tier Constraints

Design for free-tier limitations.

Avoid unnecessary:

- background workers
- queues
- multiple backend services
- large file processing
- high-frequency polling
- expensive image transformations

For payment status:

- prefer Supabase Realtime
- otherwise poll at a modest interval such as 3–5 seconds only while the payment page is open
- stop polling immediately after success/failure/expiration

Keep database queries indexed and simple.

---

# 39. UX States

Every important page/component must consider:

```text
Initial
Loading
Success
Empty
Error
Disabled
Hover
Focus
Active
```

Examples:

Movie list:

```text
Loading movies...
No movies found.
Failed to load movies.
```

Seat selection:

```text
Loading seats...
Seat unavailable.
Seat selected.
Booking expired.
```

Payment:

```text
Waiting for payment...
Payment received.
Payment failed.
Payment expired.
```

Comments:

```text
Loading comments...
No comments yet.
Comment submitted.
Failed to submit comment.
```

---

# 40. Accessibility

Use:

- semantic HTML
- labels for form inputs
- keyboard navigation
- visible focus states
- sufficient contrast
- `aria-*` only where necessary
- accessible modal behavior
- reduced-motion support

Do not sacrifice usability for animation.

---

# 41. Error Handling

Backend:

Central error middleware.

Frontend:

Central API error handling.

Do not duplicate huge amounts of error handling in every component.

Display user-friendly messages.

Never display raw stack traces to users.

---

# 42. Suggested Development Order

Do not start by building every page visually.

Follow this sequence.

## Phase 1 — Architecture

1. Initialize monorepo.
2. Set up Git.
3. Create backend.
4. Create React web.
5. Create React Native Expo app.
6. Connect Supabase.
7. Define database schema.
8. Seed sample cinema data.

## Phase 2 — Backend

1. Authentication.
2. User roles.
3. Movies.
4. Cinemas.
5. Rooms.
6. Seats.
7. Showtimes.
8. Comments.
9. Contact.
10. Admin.
11. Booking.
12. Payment.
13. SePay webhook.
14. Website views.

## Phase 3 — Web foundation

1. Design direction.
2. Design tokens.
3. Global CSS.
4. Layout.
5. Navigation.
6. Responsive system.
7. Auth state.

## Phase 4 — Web user journey

```text
Home
 ↓
Movies
 ↓
Movie Detail
 ↓
Showtime
 ↓
Seat Selection
 ↓
Booking
 ↓
Payment
 ↓
Ticket
```

## Phase 5 — Web admin

```text
Dashboard
Movies
Comments
Contact
```

## Phase 6 — Mobile

Implement the same business flow through REST API.

## Phase 7 — Animation / polish

Only after functionality works:

- GSAP hero
- page transitions
- card interactions
- SVG animations
- seat transitions
- ticket success animation
- loading states

## Phase 8 — Deployment

1. Supabase production database.
2. Render backend.
3. Web deployment.
4. Mobile API configuration.
5. SePay webhook.
6. End-to-end payment test.

---

# 43. Seed Data

Create enough realistic data for demonstration.

Minimum:

```text
1 admin
2–3 normal users

5–10 movies
2–3 cinemas
multiple rooms
multiple seats per room
multiple showtimes
sample comments
sample bookings
```

Admin credentials should exist only in development/seed configuration and must not be committed as a real production password.

---

# 44. Demo Scenario

The project should be demoable in approximately this order:

### 1. Homepage

Show:

- cinematic hero
- movie list
- responsive layout
- wait or demonstrate advertisement popup
- close popup
- refresh page
- prove cookie prevents popup

### 2. Register/Login

Login as user.

### 3. Movie

Open:

```text
/movies/:id
```

Show dynamic content.

### 4. Comment

Submit:

```text
Name
Email
Comment
Rating
```

Show public display.

### 5. Booking

Select:

```text
Cinema
Date
Showtime
Seats
```

Create booking.

### 6. Payment

Show VietQR.

Transfer real money.

### 7. Automatic confirmation

SePay webhook:

```text
BANK
 ↓
SePay
 ↓
Backend
 ↓
Supabase
 ↓
PAID
```

Show the UI changing automatically.

### 8. Ticket

Show:

```text
Movie
Cinema
Time
Seats
Booking code
QR
```

### 9. Admin

Login as admin.

Show:

```text
Total views
Movies
Edit movie
Delete comment
```

### 10. Mobile

Repeat a smaller version of:

```text
Login
Movie
Detail
Booking
Contact
```

and explain that it uses the same REST API.

---

# 45. Coding Agent Rules

The coding agent MUST:

1. Read this architecture before making structural changes.
2. Preserve the existing architecture unless there is a strong technical reason to change it.
3. Never introduce a new framework/library without explaining why it is necessary.
4. Never install a UI component library just to build a visual component.
5. Never copy a website/template.
6. Prefer custom CSS and SVG.
7. Use GSAP for complex motion where appropriate.
8. Keep animations performant.
9. Respect the three responsive breakpoints.
10. Keep business logic in backend/services, not UI components.
11. Keep API calls in service modules.
12. Keep reusable UI components small and focused.
13. Validate all user input on the backend.
14. Never trust client-side payment status.
15. Never expose secrets.
16. Keep payment webhook idempotent.
17. Use database transactions for booking operations.
18. Add appropriate database indexes/unique constraints.
19. Test critical booking/payment logic before visual polish.
20. Preserve course requirements while refactoring.

---

# 46. Frontend Agent Workflow

Before implementing a major page:

```text
1. Understand user goal
2. Define information hierarchy
3. Define responsive behavior
4. Define interaction states
5. Define motion
6. Implement semantic structure
7. Implement custom CSS
8. Implement SVG if useful
9. Add GSAP only where valuable
10. Test desktop/tablet/mobile
11. Review accessibility
12. Remove unnecessary visual complexity
```

Do not immediately generate code after receiving a vague design request. First establish the component/page architecture.

---

# 47. Visual Quality Checklist

Before considering the frontend complete:

- [ ] No copied website layout.
- [ ] No pre-built dashboard.
- [ ] No generic UI-kit appearance.
- [ ] Typography has clear hierarchy.
- [ ] Spacing is consistent.
- [ ] Buttons have hover/focus/active/disabled states.
- [ ] Forms have validation/error states.
- [ ] Loading states exist.
- [ ] Empty states exist.
- [ ] Error states exist.
- [ ] Movie cards feel custom.
- [ ] Seat map is custom.
- [ ] Payment screen is custom.
- [ ] Ticket screen is custom.
- [ ] SVG illustrations are original.
- [ ] Motion is purposeful.
- [ ] Reduced motion is supported.
- [ ] Mobile layout is intentionally designed.
- [ ] 800px and 1200px breakpoints are explicitly handled.

---

# 48. Definition of Done

A feature is complete only when:

```text
Backend
  ✓ API implemented
  ✓ Validation implemented
  ✓ Authorization implemented where needed
  ✓ Database constraints implemented
  ✓ Error handling implemented

Web
  ✓ UI implemented
  ✓ API integrated
  ✓ Loading state
  ✓ Empty state
  ✓ Error state
  ✓ Responsive behavior
  ✓ Accessibility basics

Mobile
  ✓ API integrated
  ✓ Native UI
  ✓ Loading state
  ✓ Error state
  ✓ Responsive/adaptive layout

Testing
  ✓ Happy path
  ✓ Invalid input
  ✓ Unauthorized access
  ✓ Duplicate/conflicting operation

Visual
  ✓ Custom design
  ✓ Motion polished
  ✓ No copied template
```

---

# 49. Priority Order

When time is limited, prioritize:

## P0 — Mandatory

```text
Database
Authentication
Roles
Movies
Movie detail
Comments
Rating
Advertisement + cookie
About
Contact
Admin
Responsive
REST API
Mobile login/home/content/contact
```

## P1 — Core product

```text
Cinema
Showtime
Seat map
Booking
Real bank transfer
SePay webhook
Payment verification
Digital ticket
```

## P2 — Polish

```text
GSAP
SVG animation
Page transitions
Advanced filters
Search
Realtime payment status
Advanced admin analytics
```

The booking/payment flow is important enough that it should be treated as a major feature, not a decorative extra.

---

# 50. Final Architecture Summary

```text
                         ┌───────────────────┐
                         │   React Website   │
                         └─────────┬─────────┘
                                   │
                                   │ REST
                                   │
                         ┌─────────▼─────────┐
                         │   Express API     │
                         │     Render        │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              Supabase DB    Supabase Storage   SePay
                    │                             │
                    │                             │
                    │                        Bank Transfer
                    │                             │
                    │                             ▼
                    │                       User's Bank
                    │
                    ▼
             Supabase Realtime
                    │
                    │
                         ┌─────────▼─────────┐
                         │ React Native App  │
                         │       Expo        │
                         └───────────────────┘
```

Core business flow:

```text
USER
 ↓
MOVIE
 ↓
SHOWTIME
 ↓
SEAT
 ↓
BOOKING (PENDING_PAYMENT)
 ↓
VIETQR
 ↓
REAL BANK TRANSFER
 ↓
SEPAY WEBHOOK
 ↓
VERIFY TRANSACTION
 ↓
SUPABASE
 ↓
BOOKING (PAID)
 ↓
DIGITAL TICKET
```

Frontend philosophy:

```text
Custom React
+
Custom CSS
+
Custom SVG
+
GSAP
+
Original Design System
+
Responsive 800 / 1200 breakpoints
+
Accessibility
```

This architecture is intentionally designed to satisfy the course rubric while producing a project that feels like a real cinema ticket platform rather than a CRUD assignment.
