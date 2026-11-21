# Nikah Community Center — Backend Plan (Supabase + Express)

> **For the AI agent:** read this whole file first, then implement in the order of section 14.
> The existing frontend is `nikah-app/` (React 18 + Vite + Tailwind + react-router 7). Today bookings live in
> `localStorage` (`src/lib/store.js`). Goal: move **users, bookings, payments** to Supabase, behind an Express API.
> Hobby project → everything must run on **free tiers**.

---

## 1. Goals and rules

| # | Rule |
|---|------|
| 1 | Logged-out visitor can **view everything** (pages, packages, food, gallery, live availability) but **cannot book**. |
| 2 | "My bookings" link is **visible only when logged in**. |
| 3 | Logged-in user can **view / update / cancel own bookings**, see billing, **view + download invoice PDF** anytime. |
| 4 | **Admin** can do everything: see all bookings, edit, confirm, cancel, delete, record/verify payments, manual booking. |
| 5 | Navbar (and My bookings page) show the user's **name + Google profile picture**. |
| 6 | A date + shift that is booked can **never** be booked by another user (enforced **in the database**). |
| 7 | Login methods: **Google** and **email + password**. |
| 8 | Packages, add-ons, food, images, events, gallery stay **hardcoded in the frontend**. Not in DB. |

Only these are in the database: **profiles, bookings, payments** (+ optional booking_events audit log).

## 2. Architecture

```
React (Vercel)
  ├─ supabase-js ──► Supabase Auth   (signup, login, Google OAuth, reset password, JWT)
  └─ fetch + Bearer JWT ──► Express API (Render free) ──► Supabase Postgres (service role key)
```

- **Auth is handled by Supabase.** Express does **not** store passwords or issue tokens.
- Frontend logs in with `supabase-js`, gets an `access_token` (JWT), sends it as `Authorization: Bearer <token>`.
- Express verifies the token, loads `profiles.role`, and enforces ownership/admin rules in code.
- Express uses the **service role key** (bypasses RLS). All tables have **RLS enabled with no policies**, so the
  browser can never read/write tables directly with the anon key. The only door is the Express API.
- Invoice **PDF is generated in the browser** (existing `html2canvas + jsPDF`) → zero server cost. The API only
  supplies the invoice data.

## 3. Free-tier notes (read before coding)

| Service | Free limit / gotcha | Handling |
|---|---|---|
| Supabase | 500 MB DB, 50k MAU. **Project pauses after ~1 week of inactivity.** | GitHub Actions cron pings `GET /api/health` (does a tiny DB query) every few days. |
| Supabase email | Built-in SMTP has a **very low hourly limit**; fine for dev, not for real signups. | Make **Google login primary**. For email signup: disable "Confirm email" while hobby-testing, or plug free SMTP (Resend / Brevo). |
| Render free web service | Sleeps after ~15 min idle; first request takes ~30–60 s. | Frontend shows "Waking up server…" on first slow call. Alternative: deploy Express as a Vercel serverless function. |
| Vercel (frontend) | Already used. | Add env vars. |

## 4. What stays hardcoded vs what goes to DB

**Stays in frontend (`src/data.js`)**: `packages`, `addons`, `foodPkgs`, `foodItems`, `events`, `gallery`, `slides`,
`facilities`, FAQ, images, contact info, `PAYMENT` method details.

**Server needs a copy of pricing** (it must never trust a client-sent price):
`server/src/config/pricing.js` mirrors `packages (id, name, price, cap)`, `addons (id, label, price)`,
`foodPkgs (id, name, price per guest)`, `SHIFTS (mult)`, weekend rule (Fri/Sat +15 %), advance = 30 %.
Comment at top: *"Keep in sync with client src/data.js and src/lib/store.js quote()."*

**Price snapshot:** every booking stores `price_snapshot` (jsonb). Invoices/bills are rendered from the snapshot,
so changing a package price later never rewrites old invoices.

**Remove from frontend:** `CONTACT.adminPass`, the demo `seed()`/`takenSlots()` fake bookings, localStorage booking
store, sessionStorage admin check.

## 5. Supabase project setup (manual, one time)

1. Create project (free). Note **Project URL**, **anon/publishable key**, **service_role/secret key**.
2. **Auth → Providers → Email**: enabled. Decide "Confirm email" (see section 3).
3. **Auth → Providers → Google**:
   - Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web).
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Paste Client ID + Secret into Supabase.
4. **Auth → URL Configuration**: Site URL = `https://nikah-convention.vercel.app`.
   Redirect URLs: `http://localhost:5173/**`, `https://nikah-convention.vercel.app/**`.
5. Run the SQL in section 6 (SQL Editor).
6. Sign up once, then make yourself admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
   ```
   Admin role lives in `profiles.role`, **not** in `user_metadata` (users can edit their own metadata).

## 6. Database design

### Tables

**profiles** — one row per auth user (auto-created by trigger)
`id (= auth.users.id)`, `email`, `full_name`, `avatar_url`, `phone`, `role ('user'|'admin')`, timestamps.

**bookings** — one row per reservation
`id (uuid)`, `code` (public id like `NCC-AB12CD`, unique), `user_id`, `status`
(`pending | confirmed | cancelled | expired | completed`), `event_type`, `package_id`, `shift`
(`morning | evening | full`), `booking_date`, `guests`, `addons text[]`, `catering` (`own|hall`), `menu_id`,
contact snapshot (`contact_name`, `contact_phone`, `contact_email`), `notes`, `price_snapshot jsonb`, `total`,
`advance`, `paid_amount`, `hold_expires_at`, `cancelled_at`, `cancel_reason`, timestamps,
and `during tsrange` (generated) used by the **no-double-booking exclusion constraint**.

**payments** — advance / balance records
`id`, `booking_id`, `amount`, `method (bkash|nagad|bank|office|card)`, `reference` (trx id), `status
(pending|verified|rejected)`, `note`, `submitted_by`, `verified_by`, `verified_at`, `created_at`.
Users can only create `pending` payments. Only admin can verify.

**booking_events** (optional audit log) — `booking_id`, `actor_id`, `action`, `detail jsonb`, `created_at`.

### Relationships

```
auth.users 1─1 profiles 1─* bookings 1─* payments
                              bookings 1─* booking_events
```

### SQL (run in Supabase SQL Editor)

```sql
-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ bookings ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','expired','completed')),
  event_type text not null,
  package_id text not null,
  shift text not null check (shift in ('morning','evening','full')),
  booking_date date not null,
  guests int not null check (guests between 20 and 600),
  addons text[] not null default '{}',
  catering text not null default 'own' check (catering in ('own','hall')),
  menu_id text,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  notes text,
  price_snapshot jsonb not null,
  total int not null check (total >= 0),
  advance int not null check (advance >= 0),
  paid_amount int not null default 0,
  hold_expires_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- time window of the shift (must match SHIFTS in the frontend)
  during tsrange generated always as (
    case shift
      when 'morning' then tsrange(booking_date + time '10:00', booking_date + time '15:00')
      when 'evening' then tsrange(booking_date + time '17:00', booking_date + time '22:30')
      else               tsrange(booking_date + time '10:00', booking_date + time '22:30')
    end
  ) stored,

  -- THE rule: two active bookings can never overlap. 'full' overlaps both morning and evening.
  constraint no_double_booking
    exclude using gist (during with &&)
    where (status in ('pending','confirmed','completed'))
);
-- If the generated column errors on your Postgres version, replace it with a plain tsrange column
-- + a BEFORE INSERT OR UPDATE trigger that sets it. Keep the exclusion constraint as is.

create index bookings_user_idx   on public.bookings (user_id, booking_date desc);
create index bookings_date_idx   on public.bookings (booking_date);
create index bookings_status_idx on public.bookings (status);

-- ============ payments ============
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount int not null check (amount > 0),
  method text not null check (method in ('bkash','nagad','bank','office','card')),
  reference text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  note text,
  submitted_by uuid references public.profiles(id),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index payments_booking_idx on public.payments (booking_id);

-- ============ audit log (optional) ============
create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  actor_id uuid,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ============ updated_at ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger t_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger t_bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();

-- ============ expire unpaid holds ============
-- Pending bookings with no payment release their slot after hold_expires_at.
create or replace function public.expire_stale_holds()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.bookings set status = 'expired'
   where status = 'pending' and paid_amount = 0 and hold_expires_at < now();
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.expire_stale_holds() from public, anon, authenticated;

-- ============ RLS: deny everything to browser clients ============
alter table public.profiles       enable row level security;
alter table public.bookings       enable row level security;
alter table public.payments       enable row level security;
alter table public.booking_events enable row level security;
-- No policies on purpose. Only the Express API (service role) touches these tables.
```

## 7. Business rules (assumptions — change if you disagree)

| Topic | Rule |
|---|---|
| Who can book | Logged-in users only. Server rejects `POST /api/bookings` without a valid token. |
| Earliest date | Tomorrow, in **Asia/Dhaka** time (never use server UTC "today"). |
| Slot hold | New booking = `pending`, holds the slot for **24 h** (`HOLD_HOURS`). No payment by then → `expired`, slot freed. |
| Hoarding limit | Max **3 pending** bookings per user (`MAX_PENDING_PER_USER`). |
| Conflict | Database exclusion constraint. API maps Postgres error `23P01` → HTTP 409 "just booked by someone else". |
| Price | Always computed on the server from `pricing.js`. Client `total/advance` are ignored. |
| Payment | User submits a payment record (`pending`, with bKash/Nagad trx id). **Only admin verifies.** When verified payments ≥ advance → booking auto-`confirmed`. The demo card gateway also creates a `pending` record. |
| User edit | Own booking, status `pending` or `confirmed`, event date ≥ today + **3 days** (`EDIT_CUTOFF_DAYS`). Price is recomputed. If a `confirmed` booking changes date/shift/package → back to `pending` for admin re-approval. |
| User cancel | Own booking, `pending` or `confirmed`, event date still in the future. Soft cancel (`status='cancelled'`, slot freed). Refund is manual by admin. |
| User delete | Users do **not** hard-delete. "Delete" in the UI = cancel. |
| Admin | Can edit/confirm/cancel any booking, **hard delete**, record + verify payments, create walk-in bookings (assigned to the admin's user_id, customer info in `contact_*`). |
| Past bookings | Read-only for users. |

## 8. API design (Express)

Base: `/api`. JSON in/out. Booking `id` in responses = the public `code` (e.g. `NCC-AB12CD`) so existing
frontend code (`invoiceNo`, `b.id`) keeps working. Response fields are **camelCase and match the old localStorage
booking shape**: `id, createdAt, status, eventType, packageId, shift, date, guests, addons, catering, menu,
name, phone, email, notes, total, advance, paidAmount, holdExpiresAt, priceSnapshot, payments[]`.

### Public
| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Returns ok + does a tiny DB query (keep-alive). |
| GET | `/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` | `[{date, morning:bool, evening:bool}]` — only booked days, **no personal data**. Max range ~400 days. `Cache-Control: public, max-age=20`. |

### Authenticated user
| Method | Path | Purpose |
|---|---|---|
| GET | `/me` | `{id, email, fullName, avatarUrl, phone, role}` |
| PATCH | `/me` | Update `phone`, `fullName`. |
| POST | `/bookings` | Create booking (validated, priced, conflict-checked). |
| GET | `/bookings` | **Own** bookings (with payments), newest first. |
| GET | `/bookings/:id` | One own booking. |
| PATCH | `/bookings/:id` | Update (rules in section 7). |
| POST | `/bookings/:id/cancel` | Cancel. |
| GET | `/bookings/:id/invoice` | Invoice JSON: booking + priceSnapshot + payments + `paidAmount` + `balance` + `invoiceNo` (`INV-` + code without `NCC-`). Frontend renders it and makes the PDF. |
| POST | `/bookings/:id/payments` | Submit payment `{amount, method, reference?}` → `pending`. |

### Admin (`requireAdmin`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/bookings?status=&q=&from=&to=&page=&pageSize=` | All bookings; `q` matches code/name/phone. |
| POST | `/admin/bookings` | Manual (walk-in) booking. |
| PATCH | `/admin/bookings/:id` | Edit any field + set `status`. |
| DELETE | `/admin/bookings/:id` | Hard delete. |
| POST | `/admin/bookings/:id/payments` | Record a payment already verified (cash at office). |
| PATCH | `/admin/payments/:id` | `{status: 'verified'|'rejected'}` → recomputes `paid_amount`, auto-confirms booking. |
| GET | `/admin/stats` | Totals: bookings, pending, confirmed revenue, upcoming. |

### Error format
`{ "error": "message", "details"?: {...} }` with status 400 (validation), 401 (no/invalid token),
403 (not allowed), 404, 409 (slot conflict / wrong state), 429 (rate limit / too many pending), 500.
Return **404 (not 403)** when a user asks for someone else's booking.

## 9. Server implementation

### Folder structure
```
server/
  package.json            ("type": "module", node >= 20)
  .env.example
  src/
    index.js              app.listen
    app.js                express app, middleware, routes
    config/env.js         zod-validated env
    config/pricing.js     SHIFTS, PACKAGES, ADDONS, FOOD + buildQuote()
    lib/supabase.js       service-role client
    lib/dates.js          dhakaToday(), addDays()
    lib/mappers.js        toApi(row)
    middleware/auth.js    requireAuth, requireAdmin
    middleware/error.js   httpError(), errorHandler
    routes/health.js
    routes/availability.js
    routes/me.js
    routes/bookings.js
    routes/payments.js
    routes/admin.js
    services/bookingService.js
    schemas.js            zod schemas
```

### Packages
```bash
npm i express@5 cors helmet express-rate-limit morgan zod dotenv @supabase/supabase-js
npm i -D nodemon
```

### `.env.example`
```
PORT=4000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=            # server only, NEVER in frontend or git
CLIENT_ORIGINS=http://localhost:5173,https://nikah-convention.vercel.app
HOLD_HOURS=24
EDIT_CUTOFF_DAYS=3
MAX_PENDING_PER_USER=3
```

### `config/env.js`
```js
import 'dotenv/config'
import { z } from 'zod'

export const env = z.object({
  PORT: z.coerce.number().default(4000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  HOLD_HOURS: z.coerce.number().default(24),
  EDIT_CUTOFF_DAYS: z.coerce.number().default(3),
  MAX_PENDING_PER_USER: z.coerce.number().default(3),
}).parse(process.env)
```

### `lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
```

### `middleware/error.js`
```js
import { ZodError } from 'zod'

export const httpError = (status, message) => Object.assign(new Error(message), { status })

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input', details: err.flatten() })
  const status = err.status ?? 500
  if (status === 500) console.error(err)
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message })
}
```

### `middleware/auth.js` — login verification
```js
import { supabase } from '../lib/supabase.js'
import { httpError } from './error.js'

export async function requireAuth(req, _res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) throw httpError(401, 'Please log in')

  // Supabase validates signature + expiry. One network call per request: fine for a hobby app.
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) throw httpError(401, 'Session expired, please log in again')

  const { data: profile } = await supabase.from('profiles')
    .select('id,email,full_name,avatar_url,phone,role').eq('id', data.user.id).single()

  req.user = { id: data.user.id, email: data.user.email, role: profile?.role ?? 'user', profile }
  next()
}

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') throw httpError(403, 'Admins only')
  next()
}
```
(Optional upgrade later: verify JWT locally with `jose` + Supabase JWKS to skip the network call.)

### `app.js`
```js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error.js'
import { requireAuth, requireAdmin } from './middleware/auth.js'
import health from './routes/health.js'
import availability from './routes/availability.js'
import me from './routes/me.js'
import bookings from './routes/bookings.js'
import admin from './routes/admin.js'

const app = express()
app.set('trust proxy', 1)                       // behind Render/Vercel proxy
app.use(helmet())
app.use(cors({ origin: env.CLIENT_ORIGINS.split(','), credentials: false }))
app.use(express.json({ limit: '50kb' }))
app.use(morgan('tiny'))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120 }))

app.use('/api/health', health)
app.use('/api/availability', availability)
app.use('/api/me', requireAuth, me)
app.use('/api/bookings', requireAuth, rateLimit({ windowMs: 60_000, limit: 30 }), bookings)
app.use('/api/admin', requireAuth, requireAdmin, admin)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
app.use(errorHandler)
export default app
```
`index.js`: `import app from './app.js'; import { env } from './config/env.js'; app.listen(env.PORT, () => console.log('API on', env.PORT))`

### `lib/dates.js`
```js
// "today" in Bangladesh, as YYYY-MM-DD
export const dhakaToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date())

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
```

### `config/pricing.js` (mirror of the frontend — keep in sync)
```js
import { httpError } from '../middleware/error.js'

export const SHIFTS = {
  morning: { label: 'Morning',  time: '10:00 AM – 3:00 PM',  mult: 1 },
  evening: { label: 'Evening',  time: '5:00 PM – 10:30 PM',  mult: 1 },
  full:    { label: 'Full Day', time: '10:00 AM – 10:30 PM', mult: 1.7 },
}
export const PACKAGES = {
  'wedding-basic': { name: 'Wedding Basic',   price: 55000,  cap: 400 },
  'wedding-plus':  { name: 'Wedding Plus',    price: 85000,  cap: 600 },
  'corporate':     { name: 'Corporate Event', price: 120000, cap: 500 },
}
export const ADDONS = {            // per-event add-ons (catering is handled via FOOD)
  stage: { label: 'Stage & floral decoration', price: 18000 },
  sound: { label: 'Sound, lights & projector', price: 9000 },
  photo: { label: 'Photo & video coverage',    price: 22000 },
  bridal:{ label: 'Bridal / green room',       price: 5000 },
}
export const FOOD = {              // price per guest
  'wedding-basic': { name: 'Wedding Basic',   price: 450 },
  'wedding-plus':  { name: 'Wedding Plus',    price: 650 },
  'corporate':     { name: 'Corporate Event', price: 550 },
}

export function buildQuote({ packageId, shift, date, guests, addons = [], catering = 'own', menu }) {
  const pkg = PACKAGES[packageId]; if (!pkg) throw httpError(400, 'Unknown package')
  const sh = SHIFTS[shift];        if (!sh)  throw httpError(400, 'Unknown shift')
  if (guests < 20 || guests > Math.min(600, pkg.cap)) throw httpError(400, `Guests must be 20–${Math.min(600, pkg.cap)} for this package`)
  const food = catering === 'hall' ? FOOD[menu] : null
  if (catering === 'hall' && !food) throw httpError(400, 'Unknown food menu')

  const base = Math.round(pkg.price * sh.mult)
  const weekend = [5, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay())   // Fri & Sat
  const weekendFee = weekend ? Math.round(base * 0.15) : 0

  const lines = []
  if (food) lines.push({ id: 'catering', label: `Hall catering · ${food.name} menu`, amount: food.price * guests, note: `${guests} guests × ${food.price}` })
  for (const id of new Set(addons)) {
    const a = ADDONS[id]; if (!a) throw httpError(400, `Unknown add-on: ${id}`)
    lines.push({ id, label: a.label, amount: a.price, note: '' })
  }
  const total = base + weekendFee + lines.reduce((s, l) => s + l.amount, 0)
  return {
    pkgName: pkg.name, shiftLabel: sh.label, shiftTime: sh.time, menuName: food?.name ?? null,
    base, weekend, weekendFee, lines, total, advance: Math.round(total * 0.3),
  }
}
```

### `schemas.js`
```js
import { z } from 'zod'

const phone = z.string().transform((s) => s.replace(/[\s-]/g, ''))
  .refine((p) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p), 'Invalid Bangladeshi mobile number')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const bookingInput = z.object({
  eventType: z.enum(['Wedding', 'Reception', 'Holud', 'Corporate', 'Birthday', 'Milad', 'Other']),
  packageId: z.string(),
  date: isoDate,
  shift: z.enum(['morning', 'evening', 'full']),
  guests: z.coerce.number().int().min(20).max(600),
  addons: z.array(z.string()).max(10).default([]),
  catering: z.enum(['own', 'hall']).default('own'),
  menu: z.string().nullish(),
  name: z.string().trim().min(2).max(80),
  phone,
  email: z.string().email().or(z.literal('')).nullish(),
  notes: z.string().max(500).nullish(),
})
export const bookingPatch = bookingInput.partial()
export const dateRange = z.object({ from: isoDate, to: isoDate })
export const paymentInput = z.object({
  amount: z.coerce.number().int().positive(),
  method: z.enum(['bkash', 'nagad', 'bank', 'office', 'card']),
  reference: z.string().trim().max(60).optional(),
})
```

### `lib/mappers.js`
```js
// DB row (+ optional payments) -> same shape the old localStorage booking had
export const toApi = (r, payments) => ({
  id: r.code, createdAt: r.created_at, status: r.status, eventType: r.event_type,
  packageId: r.package_id, shift: r.shift, date: r.booking_date, guests: r.guests,
  addons: r.addons, catering: r.catering, menu: r.menu_id,
  name: r.contact_name, phone: r.contact_phone, email: r.contact_email ?? '', notes: r.notes ?? '',
  total: r.total, advance: r.advance, paidAmount: r.paid_amount, holdExpiresAt: r.hold_expires_at,
  priceSnapshot: r.price_snapshot,
  ...(payments ? { payments } : {}),
})
```

### `routes/availability.js` (public)
```js
import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { dateRange } from '../schemas.js'

const r = Router()
r.get('/', async (req, res) => {
  const { from, to } = dateRange.parse(req.query)
  await supabase.rpc('expire_stale_holds')
  const { data, error } = await supabase.from('bookings').select('booking_date,shift')
    .in('status', ['pending', 'confirmed', 'completed']).gte('booking_date', from).lte('booking_date', to)
  if (error) throw error
  const days = {}
  for (const b of data) {
    const d = (days[b.booking_date] ??= { date: b.booking_date, morning: false, evening: false })
    if (b.shift === 'full') d.morning = d.evening = true
    else d[b.shift] = true
  }
  res.set('Cache-Control', 'public, max-age=20').json(Object.values(days))
})
export default r
```

### `services/bookingService.js` — create / update / cancel
```js
import { supabase } from '../lib/supabase.js'
import { env } from '../config/env.js'
import { buildQuote } from '../config/pricing.js'
import { dhakaToday, addDays } from '../lib/dates.js'
import { httpError } from '../middleware/error.js'
import { toApi } from '../lib/mappers.js'

const ACTIVE = ['pending', 'confirmed']
const newCode = () => 'NCC-' + Math.random().toString(36).slice(2, 8).toUpperCase()
const SLOT_TAKEN = 'Sorry, that date and shift was just booked by someone else'

const cols = (i, snap) => ({
  event_type: i.eventType, package_id: i.packageId, shift: i.shift, booking_date: i.date, guests: i.guests,
  addons: [...new Set(i.addons)], catering: i.catering, menu_id: i.catering === 'hall' ? i.menu : null,
  contact_name: i.name, contact_phone: i.phone, contact_email: i.email || null, notes: i.notes || null,
  price_snapshot: snap, total: snap.total, advance: snap.advance,
})

export async function createBooking(user, input, { forAdmin = false } = {}) {
  await supabase.rpc('expire_stale_holds')
  if (input.date < addDays(dhakaToday(), 1)) throw httpError(400, 'Please pick tomorrow or a later date')

  if (!forAdmin) {
    const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('status', 'pending')
    if (count >= env.MAX_PENDING_PER_USER) throw httpError(429, 'You already have several unpaid bookings. Pay or cancel one first.')
  }

  const snap = buildQuote(input)                       // server-side price, client price ignored
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase.from('bookings').insert({
      ...cols(input, snap), code: newCode(), user_id: user.id,
      status: forAdmin ? 'confirmed' : 'pending',
      hold_expires_at: new Date(Date.now() + env.HOLD_HOURS * 3600_000).toISOString(),
    }).select().single()
    if (!error) return toApi(data)
    if (error.code === '23P01') throw httpError(409, SLOT_TAKEN)   // exclusion_violation
    if (error.code === '23505') continue                           // code collision, retry
    throw error
  }
  throw httpError(500, 'Could not create booking')
}

async function loadOwn(user, code, admin) {
  let q = supabase.from('bookings').select('*').eq('code', code)
  if (!admin) q = q.eq('user_id', user.id)
  const { data } = await q.maybeSingle()
  if (!data) throw httpError(404, 'Booking not found')
  return data
}

export async function updateBooking(user, code, patch, { admin = false } = {}) {
  const row = await loadOwn(user, code, admin)
  if (!admin) {
    if (!ACTIVE.includes(row.status)) throw httpError(409, `A ${row.status} booking can't be edited`)
    if (row.booking_date < addDays(dhakaToday(), env.EDIT_CUTOFF_DAYS))
      throw httpError(403, 'Too close to the event date to edit online. Please call us.')
  }
  const cur = {
    eventType: row.event_type, packageId: row.package_id, date: row.booking_date, shift: row.shift,
    guests: row.guests, addons: row.addons, catering: row.catering, menu: row.menu_id,
    name: row.contact_name, phone: row.contact_phone, email: row.contact_email, notes: row.notes,
  }
  const next = { ...cur, ...patch }
  if (next.date !== row.booking_date && next.date < addDays(dhakaToday(), 1)) throw httpError(400, 'Pick a future date')

  const snap = buildQuote(next)
  const scheduleChanged = next.date !== cur.date || next.shift !== cur.shift || next.packageId !== cur.packageId
  const update = { ...cols(next, snap) }
  if (!admin && row.status === 'confirmed' && scheduleChanged) update.status = 'pending'   // needs re-approval
  if (admin && patch.status) update.status = patch.status

  const { data, error } = await supabase.from('bookings').update(update).eq('id', row.id).select().single()
  if (error?.code === '23P01') throw httpError(409, SLOT_TAKEN)
  if (error) throw error
  await supabase.from('booking_events').insert({ booking_id: row.id, actor_id: user.id, action: 'updated', detail: patch })
  return toApi(data)
}

export async function cancelBooking(user, code, reason, { admin = false } = {}) {
  const row = await loadOwn(user, code, admin)
  if (!ACTIVE.includes(row.status)) throw httpError(409, `Already ${row.status}`)
  if (!admin && row.booking_date < dhakaToday()) throw httpError(409, 'This event date has passed')
  const { data, error } = await supabase.from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason ?? null })
    .eq('id', row.id).select().single()
  if (error) throw error
  await supabase.from('booking_events').insert({ booking_id: row.id, actor_id: user.id, action: 'cancelled', detail: { reason } })
  return toApi(data)
}
```
Exclusion constraints ignore the row being updated, so editing your own booking never conflicts with itself.

### `routes/bookings.js`
```js
import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { bookingInput, bookingPatch, paymentInput } from '../schemas.js'
import { createBooking, updateBooking, cancelBooking } from '../services/bookingService.js'
import { toApi } from '../lib/mappers.js'
import { httpError } from '../middleware/error.js'

const r = Router()
const withPayments = async (row) => {
  const { data } = await supabase.from('payments').select('*').eq('booking_id', row.id).order('created_at')
  return toApi(row, (data ?? []).map((p) => ({ id: p.id, amount: p.amount, method: p.method, reference: p.reference, status: p.status, createdAt: p.created_at })))
}
const own = async (req) => {
  const { data } = await supabase.from('bookings').select('*').eq('code', req.params.id).eq('user_id', req.user.id).maybeSingle()
  if (!data) throw httpError(404, 'Booking not found')
  return data
}

r.post('/', async (req, res) => res.status(201).json(await createBooking(req.user, bookingInput.parse(req.body))))

r.get('/', async (req, res) => {
  const { data, error } = await supabase.from('bookings').select('*, payments(*)')
    .eq('user_id', req.user.id).order('booking_date', { ascending: false })
  if (error) throw error
  res.json(data.map(({ payments, ...row }) => toApi(row, payments)))
})

r.get('/:id', async (req, res) => res.json(await withPayments(await own(req))))
r.patch('/:id', async (req, res) => res.json(await updateBooking(req.user, req.params.id, bookingPatch.parse(req.body))))
r.post('/:id/cancel', async (req, res) => res.json(await cancelBooking(req.user, req.params.id, req.body?.reason)))

r.get('/:id/invoice', async (req, res) => {
  const b = await withPayments(await own(req))
  const paid = b.payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0)
  res.json({ ...b, invoiceNo: 'INV-' + b.id.replace(/^NCC-/, ''), paidAmount: paid, balance: b.total - paid })
})

r.post('/:id/payments', async (req, res) => {
  const row = await own(req)
  if (!['pending', 'confirmed'].includes(row.status)) throw httpError(409, 'This booking is not active')
  const p = paymentInput.parse(req.body)
  const { data, error } = await supabase.from('payments')
    .insert({ booking_id: row.id, ...p, status: 'pending', submitted_by: req.user.id }).select().single()
  if (error) throw error
  res.status(201).json(data)
})
export default r
```

### `routes/admin.js` (outline — agent completes with the same patterns)
```js
// GET    /bookings        select('*, payments(*)'), filters: status, q (code/contact_name/contact_phone ilike), from/to, pagination via .range()
// POST   /bookings        createBooking(req.user, bookingInput.parse(req.body), { forAdmin: true })
// PATCH  /bookings/:id    updateBooking(req.user, req.params.id, bookingPatch.extend({ status: z.enum([...]).optional() }).parse(req.body), { admin: true })
// DELETE /bookings/:id    supabase.from('bookings').delete().eq('code', id)   (payments cascade)
// POST   /bookings/:id/payments   insert payment with status 'verified', verified_by = admin, then recomputePaid()
// PATCH  /payments/:id    { status: 'verified' | 'rejected' } -> set verified_by/verified_at -> recomputePaid(booking_id)
// GET    /stats           counts by status + sum(total) where status='confirmed' + upcoming 30 days
```
`recomputePaid(bookingId)`: sum `payments.amount` where `status='verified'` → update `bookings.paid_amount`;
if `status='pending'` and `paid_amount >= advance` → set `status='confirmed'`, `hold_expires_at=null`. Write a `booking_events` row.

### CORS / security checklist
- `SUPABASE_SERVICE_ROLE_KEY` only in server env. Frontend gets only URL + anon/publishable key.
- Every user query filters by `user_id = req.user.id`. Admin routes sit behind `requireAdmin`.
- Validate every body/query with zod. Never accept `status`, `total`, `advance`, `paidAmount`, `user_id` from non-admin clients.
- Restrict CORS to `CLIENT_ORIGINS`. Keep helmet + rate limits.
- Never log tokens, never return raw DB errors to the client.

## 10. Frontend implementation

### New env (`.env`, and in Vercel)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...            # anon / publishable key (safe for browser)
VITE_API_URL=http://localhost:4000    # prod: https://your-api.onrender.com
```
`npm i @supabase/supabase-js`

### New files
```
src/lib/supabase.js
src/lib/api.js
src/context/AuthContext.jsx
src/components/RequireAuth.jsx     (also RequireAdmin)
src/components/Avatar.jsx
src/components/UserMenu.jsx
src/pages/Login.jsx   Signup.jsx   AuthCallback.jsx   ResetPassword.jsx
src/lib/useAvailability.js
```

### `lib/supabase.js` and `lib/api.js`
```js
// supabase.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// api.js
import { supabase } from './supabase'
const BASE = import.meta.env.VITE_API_URL

export async function api(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(session && { Authorization: `Bearer ${session.access_token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(json.error || 'Request failed'), { status: res.status })
  return json
}
```

### `context/AuthContext.jsx`
```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    // keep this callback sync and light: calling supabase.* inside it can deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {                       // role comes from our DB, not from the token
    if (!session) { setMe(null); return }
    api('/me').then(setMe).catch(() => setMe(null))
  }, [session?.user?.id])

  const u = session?.user
  const m = u?.user_metadata ?? {}
  const user = u && {
    id: u.id, email: u.email,
    name: m.full_name || m.name || u.email?.split('@')[0],
    avatar: m.avatar_url || m.picture || null,          // Google photo
  }

  const value = {
    user, session, loading, isAdmin: me?.role === 'admin',
    signInGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } }),
    signInEmail: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUpEmail: (email, password, name) => supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` } }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` }),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
```
Wrap `<AuthProvider>` around `<App/>` in `main.jsx` (inside `BrowserRouter`).

### Route guards
```jsx
// RequireAuth.jsx
export function RequireAuth({ children, admin }) {
  const { user, isAdmin, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="py-32 text-center text-slate-500">Loading…</div>
  if (!user) { sessionStorage.setItem('ncc.returnTo', loc.pathname + loc.search); return <Navigate to="/login" replace /> }
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return children
}
```
`App.jsx`: add routes `/login`, `/signup`, `/auth/callback`, `/reset-password`;
wrap `/my-bookings` with `<RequireAuth>` and `/admin` with `<RequireAuth admin>`.
`AuthCallback.jsx`: wait until `useAuth().user` exists, then `navigate(sessionStorage.getItem('ncc.returnTo') || '/', { replace: true })`.
`Login.jsx`: "Continue with Google" button + email/password form + "Forgot password". `Signup.jsx`: name, email, password.

### Navbar: name + Google picture
```jsx
// Avatar.jsx
export default function Avatar({ user, size = 36 }) {
  const [bad, setBad] = useState(false)
  const initials = (user.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return user.avatar && !bad
    ? <img src={user.avatar} alt="" width={size} height={size} referrerPolicy="no-referrer"
           onError={() => setBad(true)} className="rounded-full object-cover" style={{ width: size, height: size }} />
    : <span className="flex items-center justify-center rounded-full bg-brand text-xs font-semibold text-white" style={{ width: size, height: size }}>{initials}</span>
}
```
`referrerPolicy="no-referrer"` is needed or Google profile images often fail to load.

`Navbar.jsx` changes:
- Logged out: show **Login** button (and hide the My-bookings icon + the mobile "My bookings" entry).
- Logged in: replace the clipboard icon with `<UserMenu/>` = avatar + first name; dropdown: **My bookings**, **Admin** (only if `isAdmin`), **Log out**. Keep the red active-bookings count badge (from the API list, not the old store).
- Mobile menu: top row with avatar + name + email; "My bookings" visible only if logged in; Login/Logout button at the bottom.
- `MyBookings.jsx` hero/header: show `Avatar` + "Hi, {name}".

### Replace the localStorage store
`src/lib/store.js` keeps: `toISO, fromISO, tomorrowISO, fmtDate, money, SHIFTS, quote` (still used for the **live price preview**), toasts.
**Delete**: `useBookings, addBooking, updateBooking, removeBooking`, `seed`, and make `takenSlots/dayStatus` read from API data.

`useAvailability.js`:
```js
export function useAvailability(fromISO, toISO) {
  const [map, setMap] = useState({})
  const load = useCallback(() => api(`/availability?from=${fromISO}&to=${toISO}`)
    .then((rows) => setMap(Object.fromEntries(rows.map((r) => [r.date, { morning: r.morning, evening: r.evening }])))), [fromISO, toISO])
  useEffect(() => { load() }, [load])
  return { map, reload: load }
}
// takenSlots(iso, map) => map[iso] ?? { morning: false, evening: false }
```
`Calendar.jsx`, `AvailabilityBar.jsx`, `Booking.jsx` take `map` instead of `bookings`. Fetch the visible month ± 1.

Hooks for bookings: `useMyBookings()` → `api('/bookings')` with `reload()`; used by `MyBookings.jsx`, Navbar badge, Billing.

### Component changes
| File | Change |
|---|---|
| `Booking.jsx` | Wizard stays open to everyone. On the **Confirm** step, if not logged in show "Log in to book" (Google button) and save the form to `sessionStorage` so it restores after login. If logged in: `POST /bookings` with the form (no price fields) → show `Billing` with the returned booking. On 409: toast, `reload()` availability, go back to step 1. Prefill name/email from `useAuth().user`. |
| `Billing.jsx` | Take the booking from props/API. Payment step → `POST /bookings/:id/payments` (`pending`), show "Waiting for admin verification". Show verified/pending payments and balance. Remove `updateBooking(...)` from the store. |
| `lib/invoice.js` | `billRows(b)` builds rows from `b.priceSnapshot` (not from `data.js`). Pass `invoiceNo` from the API/`INV-…` rule. Show paid / balance / payment list on the invoice. PDF code (`downloadInvoicePdf`) unchanged. |
| `MyBookings.jsx` | Remove the search-by-phone box (not needed — list is already the user's own). List from `GET /bookings`. Actions per booking: **View invoice** (modal with `InvoiceView` + Download PDF), **Edit** (modal reusing the wizard fields → `PATCH`), **Cancel** (confirm → `POST /cancel`), **Pay / billing**. Status pill incl. `expired`. |
| `Admin.jsx` | Remove passcode login. Guard with `<RequireAuth admin>`. Data from `/admin/bookings` (filters + search + pagination). Buttons: Confirm / Cancel / Edit / Delete, payments panel (verify / reject / add cash payment), stats from `/admin/stats`, CSV export (keep client-side). |
| `Navbar.jsx`, `App.jsx`, `main.jsx` | As described above. |
| `data.js` | Delete `CONTACT.adminPass`. |
| `StatusPill.jsx` | Add `expired`, `completed`. |

Show a small "Waking up server…" message if an API call takes > 3 s (Render cold start).

## 11. Admin panel scope
- Dashboard: total, pending, confirmed revenue, upcoming events.
- Table/list: filter by status, search by code/name/phone, date range, pagination.
- Booking detail: all fields, edit, change status, cancel, hard delete (with confirm), call link.
- Payments: list per booking; verify / reject user-submitted; add cash/bank payment.
- Manual booking (walk-in) form reusing the booking wizard.
- CSV export of the current filtered list.
- Not in admin panel: package/price/image editing (hardcoded).

## 12. Environment and deployment
1. **Supabase**: section 5 + SQL.
2. **Backend** → Render (free): root `server/`, build `npm i`, start `node src/index.js`, set env vars from `.env.example`.
   Add the Vercel URL to `CLIENT_ORIGINS`.
3. **Frontend** → Vercel: add the three `VITE_*` vars. Existing `vercel.json` SPA rewrite stays.
4. **Keep-alive**: GitHub Action (cron every 3 days) → `curl https://<api>/api/health`.
5. Local dev: `server` on :4000, `nikah-app` on :5173.

## 13. Test checklist (agent must verify)
1. Logged out: all pages + availability visible; confirm step shows "Log in to book"; `POST /api/bookings` returns 401; no My bookings link.
2. Google login → navbar shows real name + photo; My bookings page shows them too. Email signup/login works; avatar falls back to initials.
3. Create booking → appears in My bookings → pending, price equals server quote (tamper with client total: ignored).
4. **Double booking**: user B tries the same date+shift → 409. `full` blocks morning and evening; morning blocks `full`; morning + evening can coexist.
5. Two simultaneous requests for the same slot → exactly one succeeds.
6. Cancel frees the slot immediately; another user can then book it.
7. Unpaid pending booking expires after 24 h (test with a short `HOLD_HOURS`) and frees the slot.
8. User A cannot read/patch/cancel user B's booking (404). Non-admin calling `/api/admin/*` → 403.
9. Edit: date change re-checks conflict + recomputes price; confirmed + date change → back to pending.
10. Invoice: view modal + PDF download work from API data; old invoices don't change if `pricing.js` changes.
11. Payment: user submits → pending; admin verifies → `paid_amount` updates, booking auto-confirms.
12. Admin can edit, confirm, cancel, delete, create walk-in booking.
13. Token expiry: expired JWT → 401 → frontend refreshes session / redirects to login.

## 14. Implementation order
1. Supabase project, providers, URL config, run SQL, make yourself admin.
2. `server/` scaffold: env, supabase client, error handler, `/health`.
3. `requireAuth` / `requireAdmin` + `/me`.
4. `pricing.js`, `/availability`.
5. Bookings create / list / get / update / cancel (+ conflict handling).
6. Payments + invoice endpoint.
7. Admin routes.
8. Frontend: supabase client, `AuthContext`, login/signup/callback/reset pages, route guards, Navbar user menu.
9. Frontend: availability from API, booking creation, Billing, My bookings (edit/cancel/invoice).
10. Frontend: Admin panel on the API.
11. Remove localStorage store + `adminPass` + demo seed. Run the test checklist. Deploy.

## 15. Out of scope (for now)
Real payment gateway (SSLCommerz/bKash PGW via webhook), email/SMS notifications, refunds automation,
multi-hall support, realtime updates, i18n of server messages.
