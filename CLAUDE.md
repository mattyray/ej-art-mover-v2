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
└── frontend/                 ← Next.js + React + TS + Tailwind (port 3000)
    ├── Dockerfile
    ├── src/app/              ← App router pages
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

### Frontend (NEEDS TO BE BUILT)
- Next.js is scaffolded with TypeScript + Tailwind — only the default template page exists
- All pages, components, and features need to be built

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

## Frontend TODO (What Needs to Be Built)

1. **Auth** — Login page, JWT token management, protected routes
2. **Dashboard** — Calendar (FullCalendar) + quick action buttons
3. **Clients** — List (searchable), create/edit form, detail page
4. **Work Orders** — List (grouped by status), create/edit with inline events, detail page with attachments/notes
5. **Invoices** — List (grouped by status), create/edit with client/work order selectors, detail page
6. **Calendar** — Week view, day view with drag-and-drop event reordering
7. **PDF viewing** — Call backend PDF endpoints, display inline
8. **Shared components** — Status badges, search bars, pagination, toast notifications, modals

## Tech Decisions Already Made

- **Auth:** JWT via SimpleJWT (not session-based)
- **State management:** Use React hooks / context (no Redux needed for this app size)
- **API client:** Create a typed fetch wrapper or use axios with interceptors for JWT refresh
- **Calendar:** FullCalendar React component
- **Drag-and-drop:** @dnd-kit or similar React-native DnD library
- **Forms:** React Hook Form recommended
- **Date picking:** Use a Tailwind-compatible date picker (e.g., react-datepicker)

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
