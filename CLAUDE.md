# CLAUDE.md — EJ Art Mover v2

## What This Is

A full rebuild of the EJ Art Mover job management app. The original is a Django monolith with server-rendered templates (Bootstrap 5) deployed on Heroku. This version splits it into:

- **Backend:** Django + Django REST Framework (API only, no templates)
- **Frontend:** Next.js + React + TypeScript + Tailwind CSS
- **Database:** PostgreSQL (same schema as original — data will be migrated via pg_dump)
- **Deployment target:** Backend on Railway, Frontend on Netlify

The original repo lives at `~/Desktop/MattsPyProjects/art_moving_buisness` and is still running in production on Heroku. Do NOT modify it.

## Quick Commands

```bash
# Run everything (from project root)
docker compose up --build

# Backend only
docker compose up backend db

# Frontend only (needs backend running)
docker compose up frontend

# Run Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell
```

## Project Structure

```
ej-artmover-v2/
├── docker-compose.yml        ← Postgres + Django API + Next.js
├── docs/
│   ├── CURRENT_FUNCTIONALITY.md  ← COMPLETE feature map of the original app
│   └── DATABASE_SCHEMA.md        ← Exact DB schema + migration instructions
├── backend/                  ← Django + DRF (port 8000)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── .env
│   ├── django_project/       ← Settings, URLs, WSGI
│   ├── accounts/             ← CustomUser (extends AbstractUser)
│   ├── clients/              ← Client CRUD API
│   ├── workorders/           ← WorkOrder, Event, Attachment, Note APIs
│   ├── invoices/             ← Invoice CRUD + status flow API
│   └── calendar_app/         ← Calendar events endpoint
└── frontend/                 ← Next.js 16 + React 19 + TS + Tailwind v4 (port 3000)
    ├── Dockerfile
    ├── src/
    │   ├── app/              ← App router pages (login, dashboard, clients, work-orders, invoices, calendar)
    │   ├── components/       ← UI components (shadcn/ui + custom)
    │   ├── hooks/            ← TanStack Query hooks (use-clients, use-work-orders, use-invoices, etc.)
    │   ├── lib/              ← API client, utilities, Zod validations
    │   ├── providers/        ← Auth, QueryClient, GoogleMaps providers
    │   └── types/            ← TypeScript type definitions
    └── package.json
```

## What's Already Built

### Backend (DONE)
- All models are identical to the original Django app (same app names, same field definitions) for database compatibility
- DRF serializers for every model
- ViewSets with full CRUD for: clients, work orders, events, attachments, notes, invoices
- All status action endpoints (mark_completed, mark_paid, complete_and_invoice, advance_status, change_status, reset_invoiced, toggle_complete, update_daily_order)
- JWT authentication (SimpleJWT) — login at `/api/auth/token/`, refresh at `/api/auth/token/refresh/`
- CORS configured for localhost:3000
- Cloudinary storage (same config as original)
- Calendar events endpoint with color coding
- Custom Cloudinary storage class for image vs raw file handling

### Frontend (BUILT)
- Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix primitives)
- JWT auth with automatic token refresh (axios interceptors)
- All CRUD pages: Clients, Work Orders, Invoices (list/create/edit/detail)
- FullCalendar (month/week/day views) with drag-and-drop event reordering (@dnd-kit)
- File attachments (Cloudinary upload) and inline notes on work order detail
- Phone auto-formatting `(XXX) XXX-XXXX` with validation
- Google Places address autocomplete on all address fields (client form + event form)
- Currency input with 2-decimal-place restriction
- Inline client creation dialog from work order form (with Places autocomplete)
- Client dropdown ordered by most recent work order activity
- Clickable table rows across all list pages
- Mobile-responsive: card layout on mobile, table layout on desktop
- React Hook Form + Zod validation
- TanStack Query v5 for server state management
- Toast notifications (sonner)
- Back button on work order detail page (router.back)
- Day event cards show client name, tappable to navigate to work order, with chevron indicator
- Event completion toggle recalculates work order status (auto-complete/revert)
- Calendar color based on individual event completion, not work order status
- Calendar includes scheduled_time in start field (timed events vs all-day)

### Backend Enhancements (since initial build)
- `EventSerializer` includes `client_name` (via `work_order.client.name`)
- `EventViewSet` uses `select_related('work_order__client')` for efficient queries
- `toggle_complete` action recalculates work order status:
  - Unchecking an event on a completed WO → reverts WO to in_progress
  - Checking the last event → auto-marks WO as completed
- `NestedEventSerializer` for work order create/update (excludes `work_order` field)
- Calendar endpoint includes `scheduled_time` in event start field
- Calendar color based on `event.completed` only (not `wo.status`)

## API Endpoints

All endpoints require JWT Bearer token (except auth endpoints).

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `POST /api/auth/token/` | POST | Login: send `{username, password}`, get `{access, refresh}` |
| `POST /api/auth/token/refresh/` | POST | Send `{refresh}`, get new `{access}` |
| `GET/POST /api/clients/` | GET, POST | List/create clients. Search: `?search=name` |
| `GET/PUT/PATCH/DELETE /api/clients/{id}/` | GET, PUT, PATCH, DELETE | Client detail |
| `GET/POST /api/workorders/` | GET, POST | List/create. Filter: `?status=pending&invoiced=false&client=1` |
| `GET/PUT/PATCH/DELETE /api/workorders/{id}/` | GET, PUT, PATCH, DELETE | Detail with nested events, attachments, notes |
| `POST /api/workorders/{id}/mark_completed/` | POST | Set status=completed |
| `POST /api/workorders/{id}/mark_paid/` | POST | Set invoiced=true |
| `POST /api/workorders/{id}/complete_and_invoice/` | POST | Both at once |
| `POST /api/workorders/{id}/change_status/` | POST | Send `{status: "pending"|"in_progress"|"completed"}` |
| `POST /api/workorders/{id}/reset_invoiced/` | POST | Set invoiced=false |
| `GET/POST /api/workorders/events/` | GET, POST | Filter: `?work_order=1&date=2026-02-18` |
| `POST /api/workorders/events/{id}/toggle_complete/` | POST | Toggle event completion |
| `POST /api/workorders/events/update_daily_order/` | POST | Bulk: `{events: [{id, daily_order, scheduled_time}]}` |
| `GET/POST /api/workorders/attachments/` | GET, POST | Filter: `?work_order=1`. Upload via multipart form |
| `GET/POST /api/workorders/notes/` | GET, POST | Filter: `?work_order=1` |
| `GET/POST /api/invoices/` | GET, POST | Filter: `?status=unpaid&client=1` |
| `GET/PUT/DELETE /api/invoices/{id}/` | GET, PUT, DELETE | Invoice detail |
| `POST /api/invoices/{id}/advance_status/` | POST | unpaid→in_quickbooks→paid |
| `POST /api/invoices/{id}/change_status/` | POST | Send `{status: "unpaid"|"in_quickbooks"|"paid"}` |
| `GET /api/calendar/events/` | GET | All scheduled events for calendar display |

## Key Documentation

**READ THESE before building frontend features:**

- `docs/CURRENT_FUNCTIONALITY.md` — Every feature, workflow, UI pattern, and business rule from the original app. This is the spec.
- `docs/DATABASE_SCHEMA.md` — Exact database schema, migration history, and instructions for loading the production database.

## Business Rules

- **Work order statuses:** pending → in_progress → completed (+ separate `invoiced` boolean)
- **Invoice statuses:** unpaid → in_quickbooks → paid
- **Events** are individual stops/tasks within a work order (pickup, wrap, install, deliver, dropoff)
- **Calendar colors:** 9-color palette by work order ID, gray for completed
- **File uploads:** max 10MB, images get thumbnails, documents stored as Cloudinary "raw"
- **All pages require auth** — no public content

## Tech Stack

- **Auth:** JWT via SimpleJWT with axios interceptors for automatic token refresh
- **State management:** TanStack Query v5 for server state, React context for auth
- **API client:** Axios with JWT interceptor (`src/lib/api.ts`)
- **Calendar:** FullCalendar React component (split into CalendarView + CalendarInner; dev uses webpack not Turbopack due to FullCalendar CSS incompatibility)
- **Drag-and-drop:** @dnd-kit for calendar day view event reordering
- **Forms:** React Hook Form + Zod v4 + @hookform/resolvers
- **UI components:** shadcn/ui (Radix primitives + Tailwind CSS v4)
- **Date picking:** react-datepicker
- **Phone formatting:** Custom `formatPhone()` utility, `(XXX) XXX-XXXX` US format
- **Address autocomplete:** Google Places API via `@react-google-maps/api` loader + native `google.maps.places.Autocomplete`
- **Currency input:** Custom `CurrencyInput` component (text input with 2-decimal-place restriction)

## Database Compatibility

The backend uses the **exact same app names** (`accounts`, `clients`, `workorders`, `invoices`) and **exact same model definitions** as the original. This means:
- `pg_dump` from the Heroku Postgres → `pg_restore` into Railway Postgres will work
- Django will see the existing `django_migrations` table and know the schema is up to date
- No data transformation needed

## Environment Variables

### Backend (.env)
- `DATABASE_URL` — Postgres connection string
- `DJANGO_SECRET_KEY` — Django secret key
- `DJANGO_DEBUG` — True/False
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CORS_ALLOWED_ORIGINS` — Comma-separated frontend URLs

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` — Backend API base URL (e.g., `http://localhost:8000/api`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key (for Places autocomplete)
