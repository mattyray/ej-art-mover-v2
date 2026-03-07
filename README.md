# EJ Art Mover v2

Job management app for an art moving business. Handles clients, work orders, scheduling, invoicing, and calendar views.

This is a full rebuild of the original app, which was a Django monolith with server-rendered Bootstrap templates deployed on Heroku. V2 splits it into a REST API backend and a modern React frontend.

## Tech Stack

- **Backend:** Django + Django REST Framework (API only, no templates)
- **Frontend:** Next.js + React + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (same schema as original for direct data migration)
- **Auth:** JWT (SimpleJWT)
- **File Storage:** Cloudinary
- **PDF Generation:** WeasyPrint

## Features

- Client management (CRUD, address autocomplete via Google Places)
- Work orders with nested events, file attachments, and notes
- Work order lifecycle: pending → in_progress → completed → invoiced
- Invoice management with status tracking (unpaid → in_quickbooks → paid)
- Calendar with month/week/day views (FullCalendar) and drag-and-drop reordering
- PDF generation for work orders and invoices
- Mobile-responsive (card layout on mobile, tables on desktop)

## Deployment

- **Backend:** Railway (`api.ejartmover.net`)
- **Frontend:** Netlify (`app.ejartmover.net`)
- **DNS:** Squarespace (`ejartmover.net`)
