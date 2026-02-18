# EJ Art Mover v2 — Project Log

> Chronicling the migration of a Django monolith to a modern React frontend.
> This log captures decisions, lessons learned, and the journey of rebuilding a production app.

---

## 2026-02-18 — Project Kickoff

### What We're Doing
Taking a production Django monolith (Bootstrap 5, server-rendered templates, jQuery, Heroku) and splitting it into:
- **Backend:** Django + Django REST Framework (API only, no templates)
- **Frontend:** Next.js + React + TypeScript + Tailwind CSS

The original app manages art moving jobs — clients, work orders, scheduled events, file attachments, invoices. It's been running in production and works, but the frontend is showing its age: separate mobile/desktop templates, jQuery AJAX calls, Bootstrap modals, page reloads for most actions.

### Why the Rebuild
1. **True responsive design** — the original has separate HTML templates for mobile and desktop. A React component can be one thing that adapts.
2. **Better mobile UX** — bottom tab navigation, bottom sheets, touch-friendly interactions instead of hamburger menus and tiny Bootstrap buttons.
3. **Modern dev experience** — TypeScript catches bugs before they ship, component-based architecture is easier to maintain.
4. **API-first architecture** — the DRF backend can serve a mobile app later if needed.

### Tech Stack Decision
After researching current best practices (Feb 2026):

| Choice | Why | What We Considered |
|--------|-----|-------------------|
| **Next.js 16 (App Router)** | File-based routing, layouts, officially supports SPA pattern | Could have used Vite + React Router, but App Router gives us a lot for free |
| **shadcn/ui** | Tailwind-native, you own the code, great mobile primitives (Drawer, Sheet) | DaisyUI (simpler but less flexible), Material UI (too opinionated), plain Tailwind (too much from scratch) |
| **Tailwind CSS v4** | New project so no migration pain, faster builds, container queries | v3 would work fine but v4 is production-ready and we're starting fresh |
| **TanStack Query v5** | Caching, background refetch, loading/error states, devtools | Could use plain fetch + useState but that's reinventing the wheel |
| **React Hook Form + Zod** | shadcn Form component is built on RHF, Zod gives type-safe validation | TanStack Form is newer but less mature ecosystem |
| **Axios** | JWT interceptor pattern is clean and well-documented | Native fetch works but interceptors require manual implementation |
| **FullCalendar v6** | Most feature-complete calendar library, adequate touch support | Schedule-X (newer, smaller community), React Big Calendar (fewer features) |
| **@dnd-kit** | Touch-friendly, accessible, actively maintained, React-native | SortableJS (not React-idiomatic), react-beautiful-dnd (deprecated) |

### Mobile-First Design Decisions
- **Bottom tab navigation** over hamburger menu — research shows 20-30% faster navigation, more thumb-friendly
- **Cards on mobile, tables on desktop** — true responsive components, not two separate templates
- **Bottom sheets** for contextual actions instead of modals — feels native on mobile, swipe to dismiss
- **Floating action button (FAB)** for primary create actions on mobile
- **FullCalendar in list view on mobile** — more readable on small screens than a cramped grid

### Architecture Decisions
- **Client components for everything** — since all pages require auth and all data comes from the Django API, server components don't buy us much. We use the App Router for routing/layouts but fetch data client-side via TanStack Query.
- **No Next.js API routes as a proxy** — the frontend calls Django directly. Adding a proxy layer would be unnecessary complexity.
- **JWT in localStorage** — simple, works with Axios interceptors. The app isn't a banking app — the security tradeoff is acceptable for this use case.
- **Invoices kept modular** — the invoice section might get a schema change, so all invoice code is isolated in its own files. If we need to rebuild it, the blast radius is ~8 files.

### What the Backend Already Has
The Django DRF backend was built first and is complete:
- All models match the original Django app exactly (same app names, same fields) for database compatibility
- JWT auth via SimpleJWT (60-min access, 7-day refresh)
- Full CRUD endpoints for clients, work orders, events, attachments, notes, invoices
- All status action endpoints (mark completed, advance invoice status, etc.)
- Calendar events endpoint with color coding
- Cloudinary storage for file uploads

The database can be migrated via `pg_dump` / `pg_restore` from the original Heroku Postgres — no data transformation needed.

### Build Plan
9 phases, ~86 files, building from foundation up:
1. Scaffolding & tooling
2. Authentication (JWT flow)
3. App shell & navigation (bottom tabs + sidebar)
4. API hooks & shared components
5. Clients module (simplest CRUD, establishes patterns)
6. Work orders — list & detail (the core feature)
7. Work orders — create & edit (most complex form with inline events)
8. Dashboard & calendar (FullCalendar + drag-and-drop day view)
9. Invoices module (kept modular)
10. Polish & edge cases

---

## 2026-02-18 — Full Frontend Build (Phases 0–9)

### The Sprint
Built the entire frontend in a single session — all 9 phases, ~80 files, from bare Next.js scaffold to a complete working app.

### Phase-by-Phase Highlights

**Phases 0–3: Foundation**
- Installed 30+ packages, initialized shadcn/ui with 25 components
- Built JWT auth flow with Axios interceptors (auto-refresh, request queuing)
- Mobile-first app shell: bottom tab bar with iOS safe area support, desktop sidebar
- TanStack Query hooks for every API endpoint with proper cache invalidation

**Phase 4: Clients (Pattern Setter)**
- Searchable client list with cards on mobile, table on desktop
- Reusable client select (combobox) with inline "create new" option
- Established the React Hook Form + Zod + shadcn Form pattern used everywhere after

**Phases 5–6: Work Orders (The Core)**
- Collapsible status sections (Pending, Scheduled, Completed)
- Detail page with inline event completion toggles, attachment uploads, note CRUD
- Complex create/edit form with `useFieldArray` for dynamic event management
- Three submit actions: Save, Save & Complete, Save & Invoice

**Phase 7: Dashboard & Calendar**
- FullCalendar with responsive views — list on mobile, month grid on desktop
- Day view with @dnd-kit drag-and-drop for event reordering
- Daily order persistence to backend on drop
- Previous/next day navigation

**Phase 8: Invoices**
- Isolated module — all invoice code in ~8 files
- Status flow: Unpaid → In QuickBooks → Paid
- Work order select filtered to completed, uninvoiced WOs for selected client
- Supports `?work_order=` URL param for complete-and-invoice flow

**Phase 9: Polish**
- Error boundaries at global and route-group levels
- Custom 404 page
- Reusable pagination component
- iOS viewport-fit: cover for notch/home bar support

### Lessons Learned
1. **Zod v4 broke `required_error`** — it's now `error` in the options object. Caught by TypeScript at build time.
2. **Zod `.optional().default()` creates mismatched input/output types** — causes zodResolver type errors with useForm. Better to use plain required types and set defaults in the form's `defaultValues`.
3. **shadcn init flags changed** — `--style` flag removed in newer versions, use `npx shadcn@latest init -d`.
4. **Hooks containing JSX need `.tsx` extension** — AuthContext.Provider is JSX, so `use-auth.ts` → `use-auth.tsx`.

### Architecture Patterns That Worked Well
- **`(authenticated)` route group** — clean separation between login and the nav shell
- **FormProvider + useFormContext** — nested form components (EventFormRow) access parent form without prop drilling
- **Actions pattern** — build action array based on entity state, render once for desktop (dropdown) and once for mobile (drawer)
- **Separate queries per section** — each collapsible status section has its own TanStack Query, independent loading states
- **@dnd-kit with optimistic local state** — reorder happens visually immediately, API call fires in background

### What's Next
- Load the production database from the original Heroku app via `pg_dump` / `pg_restore`
- End-to-end testing with real data
- Responsive QA at 375px, 768px, 1280px
- Deploy: backend to Railway, frontend to Netlify

---

*All 9 phases complete. Frontend is fully built and ready for integration testing.*
