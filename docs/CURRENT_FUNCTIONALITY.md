# EJ Art Mover — Complete Functionality Map

> This document captures every feature, workflow, and behavior of the current Django application
> before migration to Next.js + DRF. Nothing should be built in the new stack without referencing this.

---

## Table of Contents

1. [Authentication & Users](#1-authentication--users)
2. [Dashboard](#2-dashboard)
3. [Clients](#3-clients)
4. [Work Orders](#4-work-orders)
5. [Events (Stops/Tasks)](#5-events-stopstasks)
6. [Attachments (File Uploads)](#6-attachments-file-uploads)
7. [Notes](#7-notes)
8. [Calendar](#8-calendar)
9. [Invoices](#9-invoices)
10. [PDF Generation](#10-pdf-generation)
11. [UI/UX Patterns](#11-uiux-patterns)
12. [Data Models & Relationships](#12-data-models--relationships)
13. [Business Rules & Status Flows](#13-business-rules--status-flows)
14. [API/AJAX Endpoints](#14-apiajax-endpoints)

---

## 1. Authentication & Users

- **Login required** on every page — no public-facing content
- **No signup page** — users are created by a superuser via Django admin (`/admin/`)
- **Custom user model** (`CustomUser`) extending Django's `AbstractUser`
  - Fields: username, email, password, first_name, last_name
- **Login** at `/accounts/login/` (standard Django auth)
- **Logout** at `/accounts/logout/` (custom view, redirects to home)
- **No roles or permissions** — all authenticated users have full access to everything
- **Session-based auth** (will change to JWT for the API)

---

## 2. Dashboard

**URL:** `/` (home page)

**Features:**
- Monthly calendar (FullCalendar) showing all scheduled events
- Color-coded by work order (each work order gets a consistent color)
- Completed events/work orders show as **gray**
- **Click a date** → navigates to that day's detail view
- **Click an event** → navigates to that work order's detail page
- Quick action buttons (create work order, view clients, etc.)

---

## 3. Clients

### Client List
**URL:** `/clients/`
- Displays all clients
- **Search by name** (filters as you type)
- Each client links to their detail page

### Client Create
**URL:** `/clients/create/`
- Fields: name (required), email, phone, service address, billing address

### Client Edit
**URL:** `/clients/<id>/edit/`
- Same form as create, pre-populated

### Client Detail
**URL:** `/clients/<id>/`
- Shows client info (name, email, phone, service address, billing address)
- Lists all work orders for that client

### AJAX Client Create
**URL:** `POST /clients/create-ajax/`
- Creates a client from within the work order form (modal/inline)
- Returns JSON: `{success: true, client: {id, name}}` or `{success: false, error: "..."}`
- Used so you don't have to leave the work order form to add a new client

---

## 4. Work Orders

### Work Order List (Main Overview)
**URL:** `/workorders/`
- Organized into collapsible sections:
  - **Pending** — no events scheduled yet
  - **Scheduled** — has events with dates assigned
  - **Completed** — marked as done (split into uninvoiced and invoiced)
- Each section shows 5 items initially with a **"Load More"** button (AJAX, loads 5 more at a time)
- **Desktop view:** table rows
- **Mobile view:** card layout
- Each work order shows: ID, client name, description preview, status, dates

### Dedicated Status Views
- `/workorders/pending/` — full list of pending jobs
- `/workorders/scheduled/` — full list of scheduled jobs
- `/workorders/completed/` — full list of completed jobs (uninvoiced + invoiced)

### Work Order Create
**URL:** `/workorders/create/`
- **Client selector** — Select2 searchable dropdown with AJAX search + "create new client" option
- **Job description** — text area
- **Estimated cost** — decimal field
- **Inline events** — formset allowing you to add multiple events (stops) right in the form
  - Each event: type, address, date
  - Can add more events dynamically
  - Can remove events (checkbox)
- **Multiple submit actions:**
  - "Save" — save and stay on form
  - "Save and Invoice" — save, mark completed, redirect to invoice creation
  - "Save and Complete" — save and mark as completed

### Work Order Edit
**URL:** `/workorders/<id>/edit/`
- Same form as create, pre-populated with existing data
- Existing events shown in the formset (editable)
- Can add new events, delete existing ones

### Work Order Detail
**URL:** `/workorders/<id>/`
- **Header:** Work order ID, client name (linked), status badge, dates
- **Sections (collapsible):**
  - **Events** — list of all events with type, address, date, time, completion status
    - Each event has a **complete/uncomplete toggle** (AJAX, no page reload)
    - Shows who completed it and when
  - **Attachments** — uploaded files with thumbnails for images
    - Upload form inline on the page
    - Delete button per attachment
  - **Notes** — text notes with timestamps
    - Add note form inline
    - **Inline edit** (AJAX) — click to edit note text without page reload
    - **Delete** (AJAX) — remove note without page reload
- **Action buttons:**
  - Edit work order
  - Delete work order
  - Mark as completed
  - Complete and create invoice
  - Mark as completed and paid
  - Change status (dropdown: pending / in_progress / completed)
  - Reset invoiced status
  - Generate PDF

### Work Order Delete
**URL:** `/workorders/<id>/delete/`
- Confirmation page before deletion
- Cascades: deletes all related events, attachments, notes

### Work Order Status Actions
All are POST-only:
- **Mark Completed** — sets status to 'completed', records completed_at timestamp
- **Complete and Invoice** — marks completed, redirects to invoice create with work_order pre-filled
- **Mark Completed and Paid** — marks completed + sets invoiced=True
- **Change Status** — direct status change (pending/in_progress/completed) with success message
- **Mark Paid** — sets invoiced=True
- **Reset Invoiced** — sets invoiced=False (undo invoicing)
- **Mark Scheduled** — redirects to edit view (so you can add dates to events)

---

## 5. Events (Stops/Tasks)

Events are individual scheduled activities within a work order.

### Event Types
| Value | Display |
|-------|---------|
| `pickup` | Pickup |
| `pickup_wrap` | Pickup & Wrap |
| `wrap` | Wrap |
| `install` | Install |
| `deliver_install` | Deliver & Install |
| `dropoff` | Dropoff |

### Event Fields
- **event_type** — one of the types above
- **address** — location for this stop
- **date** — when it's scheduled (nullable — unscheduled events are allowed)
- **scheduled_time** — time of day (nullable)
- **daily_order** — position in the day's schedule (for drag-and-drop ordering)
- **completed** — boolean flag
- **completed_at** — timestamp when marked complete
- **completed_by** — text field recording who completed it

### Event Behaviors
- Events are created/edited inline within the work order form (formset)
- Events can be **individually completed** via AJAX toggle on the work order detail page
  - Returns JSON: `{success, completed, completed_at, completed_by}`
- Events can be deleted from the work order detail page (POST)
- Events are ordered by: date → daily_order → scheduled_time → id
- **An event getting a date** triggers the work order status to update (pending → in_progress)

---

## 6. Attachments (File Uploads)

### Supported File Types
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`

### Upload Rules
- **Max file size:** 10MB
- File type auto-detected from extension
- **Images** get a 200x200 JPEG thumbnail generated on upload
- **Documents** stored as Cloudinary "raw" resources (different URL path)

### Storage
- **Cloudinary** for all media files
- Custom storage class handles routing:
  - Images → `/image/upload/` (Cloudinary image pipeline)
  - Documents → `/raw/upload/` (Cloudinary raw file storage)
- Thumbnails generated via Cloudinary transformations (200x200)
- Display images optimized via Cloudinary (800x600)

### UI
- Upload form on the work order detail page
- Thumbnails displayed in a grid for images
- File icon (Bootstrap Icons) for documents
- Delete button per attachment (POST, page reload)

---

## 7. Notes

### Features
- Free-text notes attached to a work order
- Timestamp recorded on creation
- **Add:** form on work order detail page (POST, page reload)
- **Edit:** inline AJAX editing — click note text to edit, saves without reload
  - `POST /workorders/detail/<job_id>/edit-note/<note_id>/` → JSON `{success, note}`
- **Delete:** AJAX deletion — removes note without page reload
  - `POST /workorders/detail/<job_id>/delete-note/<note_id>/` → JSON `{success}`
- Notes displayed in reverse chronological order (newest first)

---

## 8. Calendar

### Monthly Calendar (Dashboard)
- **Library:** FullCalendar 5.11.3
- Shows all events that have a date assigned
- **Color coding:** each work order gets a color from a 9-color palette based on work order ID
  - Colors: blue, orange, green, red, purple, brown, pink, yellow-green, cyan
  - Completed events/work orders → gray (`#6c757d`)
- **Event title format:** `"{daily_order}. {event_type} - {client_name}"` (or without number if no daily_order)
- **Click date** → navigate to day detail view
- **Click event** → navigate to work order detail

### Week View
**URL:** `/calendar/week/<mm-dd-yy>/`
- Shows Monday through Sunday
- Events grouped by date
- Color-coded by work order
- Click event → work order detail
- Navigate between weeks

### Day View
**URL:** `/calendar/day/<mm-dd-yy>/`
- Shows all events for a single day
- **Drag-and-drop reordering** via Sortable.js
  - Dragging updates `daily_order` for all events on that day
  - Saves via POST to `/calendar/day/<day_str>/update-order/`
  - Sends JSON body: `{events: [{id, daily_order, scheduled_time}, ...]}`
- **Time input** per event (editable inline)
- **Completion checkbox** per event
- Color-coded by work order
- Shows: event type, client name, address, time, completion status
- Navigate between days

### Calendar Data API
**URL:** `GET /workorders/calendar-data/workorders/`
- Returns JSON array of event objects:
  ```json
  {
    "id": "event_123",
    "title": "1. Pickup - Smith Gallery",
    "start": "2026-02-18",
    "color": "#1f77b4",
    "url": "/workorders/45/",
    "workOrderId": 45,
    "dailyOrder": 1,
    "isEventCompleted": false,
    "isWorkOrderCompleted": false,
    "isCompleted": false
  }
  ```

---

## 9. Invoices

### Invoice List (Main Overview)
**URL:** `/invoices/`
- Organized into collapsible sections:
  - **Unpaid** — newly created invoices
  - **In QuickBooks** — sent to accounting
  - **Paid** — fully settled
- "Load More" pagination (AJAX, 5 at a time)
- Desktop table + mobile card views

### Dedicated Status Views
- `/invoices/unpaid/` — full unpaid list
- `/invoices/in-quickbooks/` — full in_quickbooks list
- `/invoices/paid/` — full paid list

### Invoice Create
**URL:** `/invoices/create/` (optional `?work_order=<id>` to pre-fill)
- **Client** — Select2 searchable dropdown (AJAX search: `GET /invoices/ajax/get_clients/?term=...`)
- **Work Order** — Select2 dropdown, loads completed work orders for selected client
  - AJAX: `GET /invoices/ajax_get_active_workorders/?client_id=...`
  - Shows completed, non-invoiced work orders for that client
- **Amount** — decimal
- **Status** — dropdown (unpaid / in_quickbooks / paid)
- **Notes** — text area
- When linked to a work order, the work order's `invoiced` flag gets set to True on save

### Invoice Detail
**URL:** `/invoices/<id>/`
- Shows: invoice number (auto-generated), client, amount, status, date created, notes
- If linked to a work order: shows that work order's events
- Action buttons: edit, delete, mark paid, change status, generate PDF

### Invoice Edit
**URL:** `/invoices/<id>/edit/`
- Same form as create, pre-populated

### Invoice Delete
**URL:** `POST /invoices/<id>/delete/`
- Deletes the invoice, redirects to invoice list

### Invoice Status Actions
- **Mark Paid:**
  - If currently `unpaid` → changes to `in_quickbooks`
  - If currently `in_quickbooks` → changes to `paid`
- **Change Status** — direct status change to any value (unpaid/in_quickbooks/paid)

### Auto-Generated Invoice Numbers
- Format: based on the invoice's database ID
- Generated automatically on first save (in the model's `save()` method)

---

## 10. PDF Generation

### Technology
- **WeasyPrint** — server-side HTML-to-PDF rendering

### Work Order PDF
**URL:** `GET /workorders/<id>/pdf/`
- Opens inline in browser (for printing)
- Contains:
  - Work order ID, client name, description, estimated cost, status
  - All events (ordered by date): type, address, date, time
  - All notes (newest first)
  - All attachments (listed, excluding missing files)
- Uses template: `workorders/workorder_pdf.html`
- Print-optimized CSS (no navbar, clean layout)

### Invoice PDF
**URL:** `GET /invoices/<id>/pdf/`
- Opens inline in browser (for printing)
- Contains:
  - Invoice number, client name, amount, status, date created
  - Linked work order events (if applicable)
- Uses template: `invoices/invoice_pdf.html`
- Print-optimized CSS

---

## 11. UI/UX Patterns

### Layout
- **Navbar** (dark, sticky top) — main navigation links
- **Offcanvas sidebar** (mobile) — hamburger menu for mobile navigation
- **Footer** (dark) — bottom of every page
- **Toast notifications** — success/error/warning messages (fixed bottom-right, auto-dismiss)

### Responsive Design
- **Desktop:** data tables for lists
- **Mobile:** card-based layout for lists
- Both rendered server-side, separate templates for each
- Bootstrap 5 grid system throughout

### Form Patterns
- Bootstrap form styling (`form-control`, `form-select`)
- CSRF token on every POST form
- **Select2** for searchable dropdowns (clients, work orders)
- **Flatpickr** for date pickers
- Form validation errors displayed inline
- Multiple submit buttons on work order form (save / save+invoice / save+complete)

### List Patterns
- Collapsible sections with item counts in headers
- "Load More" progressive loading (5 items at a time, AJAX)
- Status badges (color-coded): green=completed, yellow=pending, blue=in_progress, etc.
- Separate desktop (table) and mobile (card) renderings

### Interactive Features
- **Drag-and-drop** event reordering (calendar day view, Sortable.js)
- **Inline editing** (notes via AJAX)
- **Toggle completion** (events via AJAX, no page reload)
- **Dynamic form elements** (add/remove events in formset)
- **Modal client creation** (from within work order form)

### CDN Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| Bootstrap | 5.2.3 | CSS framework + components |
| Bootstrap Icons | 1.10.5 | Icon set |
| jQuery | 3.6.0 | DOM manipulation, AJAX |
| FullCalendar | 5.11.3 | Calendar views |
| Flatpickr | latest | Date/time picker |
| Select2 | 4.1.0-rc.0 | Searchable dropdowns |
| Sortable.js | latest | Drag-and-drop lists |
| OpenDyslexic | - | Custom font (accessibility) |

---

## 12. Data Models & Relationships

```
CustomUser (accounts)
  │
  ├── WorkOrder.created_by (not currently tracked — all users see all work orders)
  │
  └── Invoice.created_by (not currently tracked)

Client
  ├── has many → WorkOrder (CASCADE delete)
  └── has many → Invoice (CASCADE delete)

WorkOrder
  ├── belongs to → Client
  ├── has many → Event (CASCADE delete)
  ├── has many → JobAttachment (CASCADE delete)
  ├── has many → JobNote (CASCADE delete)
  └── has many → Invoice (SET_NULL — invoice survives work order deletion)

Event
  └── belongs to → WorkOrder

JobAttachment
  └── belongs to → WorkOrder

JobNote
  └── belongs to → WorkOrder

Invoice
  ├── belongs to → Client
  └── optionally belongs to → WorkOrder (SET_NULL)
```

### Field Details

**Client:** name (required), email, phone, address (service), billing_address

**WorkOrder:** client (FK), job_description, estimated_cost, status (pending/in_progress/completed), completed_at, created_at, updated_at, invoiced (bool)

**Event:** work_order (FK), event_type (pickup/pickup_wrap/wrap/install/deliver_install/dropoff), address, date, scheduled_time, daily_order, completed, completed_at, completed_by

**JobAttachment:** work_order (FK), file, file_type (image/pdf/document/text), file_size, thumbnail, uploaded_at

**JobNote:** work_order (FK), note (text), created_at

**Invoice:** invoice_number (auto-generated, unique), client (FK), work_order (FK nullable), date_created, amount, status (unpaid/in_quickbooks/paid), notes

---

## 13. Business Rules & Status Flows

### Work Order Status Flow
```
pending ──→ in_progress ──→ completed
                              │
                              ├── invoiced=false (completed, not yet invoiced)
                              └── invoiced=true  (completed and invoiced)
```

- **pending:** no events have dates assigned
- **in_progress:** at least one event has a date (auto-updated by `update_status()`)
- **completed:** manually marked complete (sets `completed_at` timestamp)
- **invoiced:** separate boolean flag, set when an invoice is created for this work order

### Invoice Status Flow
```
unpaid ──→ in_quickbooks ──→ paid
```

- **"Mark Paid" button** advances one step (unpaid→in_quickbooks, in_quickbooks→paid)
- **"Change Status"** can set any status directly

### Event Completion
- Individual events can be marked complete independently of the work order
- Records: `completed=True`, `completed_at=now()`, `completed_by=username`
- Toggling off: clears all three fields
- Event completion does NOT automatically complete the work order

### Auto-Behaviors
- Work order status auto-updates when events gain/lose dates (`update_status()`)
- Invoice number auto-generated from database ID on first save
- File type auto-detected from extension on upload
- Image thumbnails auto-generated on upload
- Calendar event colors auto-assigned based on work order ID

---

## 14. API/AJAX Endpoints

These are the existing endpoints that return JSON (will become the basis for DRF API):

| Method | URL | Purpose | Response |
|--------|-----|---------|----------|
| GET | `/workorders/calendar-data/workorders/` | Calendar events | JSON array of events |
| GET | `/workorders/load-more/?status=X&offset=N` | Paginated work orders | `{desktop_html, mobile_html, count, has_more}` |
| POST | `/workorders/event/<id>/complete/` | Toggle event completion | `{success, completed, completed_at, completed_by}` |
| POST | `/workorders/detail/<id>/edit-note/<note_id>/` | Edit note inline | `{success, note}` |
| POST | `/workorders/detail/<id>/delete-note/<note_id>/` | Delete note | `{success}` |
| POST | `/clients/create-ajax/` | Create client from modal | `{success, client: {id, name}}` |
| GET | `/invoices/ajax/get_clients/?term=X` | Search clients | `[{id, text}, ...]` |
| GET | `/invoices/ajax_get_active_workorders/?client_id=X` | Work orders for client | `[{id, text}, ...]` |
| GET | `/invoices/load-more/?status=X&offset=N` | Paginated invoices | `{desktop_html, mobile_html, count, has_more}` |
| POST | `/calendar/day/<mm-dd-yy>/update-order/` | Reorder day's events | `{status: "ok"}` |

---

## Features to Improve in Next.js Rebuild

These are things the current app does but could be better:

1. **Real-time updates** — currently requires page reload for most actions
2. **Search** — only clients have search, work orders and invoices don't
3. **Filtering** — no date range filters, no multi-status filters
4. **Bulk actions** — can't mark multiple items complete/paid at once
5. **Dashboard analytics** — no revenue tracking, job counts, or charts
6. **Mobile UX** — responsive but not mobile-optimized (separate templates instead of true responsive components)
7. **Notifications** — no email or push notifications for upcoming events
8. **User assignment** — no way to assign work orders or events to specific users/crews
9. **Audit trail** — no history of who changed what and when
10. **Client portal** — clients can't view their own work order status

---

*This document was generated from the Django codebase on 2026-02-18. Reference this during the Next.js + DRF migration to ensure feature parity.*
