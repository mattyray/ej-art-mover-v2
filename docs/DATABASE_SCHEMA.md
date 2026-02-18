# EJ Art Mover — Database Schema

> Exact schema of the current PostgreSQL database. The new Next.js + DRF project
> MUST use these same table structures so the existing data can be loaded via `pg_dump` / `pg_restore`.

---

## Migration Strategy

```bash
# 1. Dump from current Heroku Postgres
heroku pg:backups:capture --app art-moving-buisness-0a734245a61f
heroku pg:backups:download --app art-moving-buisness-0a734245a61f

# 2. Restore into Railway Postgres
pg_restore --verbose --clean --no-acl --no-owner -h <RAILWAY_HOST> -U <USER> -d <DB_NAME> latest.dump
```

**Critical:** The new Django project must use the **same app names** (`accounts`, `clients`, `workorders`, `invoices`) and **same model names** so Django's migration system recognizes the existing tables. If app names change, you'll need to rename tables manually.

---

## Tables

### `accounts_customuser`

Extends Django's `AbstractUser`. Standard Django auth fields.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `password` | `varchar(128)` | NOT NULL | — |
| `last_login` | `timestamp with time zone` | NULL | NULL |
| `is_superuser` | `boolean` | NOT NULL | `false` |
| `username` | `varchar(150)` | NOT NULL, UNIQUE | — |
| `first_name` | `varchar(150)` | NOT NULL | `''` |
| `last_name` | `varchar(150)` | NOT NULL | `''` |
| `email` | `varchar(254)` | NOT NULL | `''` |
| `is_staff` | `boolean` | NOT NULL | `false` |
| `is_active` | `boolean` | NOT NULL | `true` |
| `date_joined` | `timestamp with time zone` | NOT NULL | `now()` |

**Related junction tables** (standard Django auth):
- `accounts_customuser_groups` (user_id → customuser, group_id → auth_group)
- `accounts_customuser_user_permissions` (user_id → customuser, permission_id → auth_permission)

---

### `clients_client`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `name` | `varchar(255)` | NOT NULL | — |
| `email` | `varchar(254)` | NULL | NULL |
| `phone` | `varchar(50)` | NULL | NULL |
| `address` | `varchar(255)` | NULL | NULL |
| `billing_address` | `varchar(255)` | NULL | NULL |

---

### `workorders_workorder`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `client_id` | `bigint` | NOT NULL, FK → `clients_client(id)` ON DELETE CASCADE | — |
| `job_description` | `text` | NULL | NULL |
| `estimated_cost` | `decimal(10,2)` | NULL | NULL |
| `status` | `varchar(20)` | NOT NULL | `'pending'` |
| `completed_at` | `timestamp with time zone` | NULL | NULL |
| `created_at` | `timestamp with time zone` | NOT NULL, auto on create | — |
| `updated_at` | `timestamp with time zone` | NOT NULL, auto on update | — |
| `invoiced` | `boolean` | NOT NULL | `false` |

**Status choices:** `'pending'`, `'in_progress'`, `'completed'`

**Indexes:** `client_id`, `status`

---

### `workorders_event`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `work_order_id` | `bigint` | NOT NULL, FK → `workorders_workorder(id)` ON DELETE CASCADE | — |
| `event_type` | `varchar(30)` | NOT NULL | — |
| `address` | `varchar(255)` | NOT NULL | `''` |
| `date` | `date` | NULL | NULL |
| `daily_order` | `integer` (positive) | NULL | NULL |
| `scheduled_time` | `time` | NULL | NULL |
| `completed` | `boolean` | NOT NULL | `false` |
| `completed_at` | `timestamp with time zone` | NULL | NULL |
| `completed_by` | `varchar(100)` | NOT NULL | `''` |

**Event type choices:** `'pickup'`, `'pickup_wrap'`, `'wrap'`, `'install'`, `'deliver_install'`, `'dropoff'`

**Ordering:** `date` → `daily_order` → `scheduled_time` → `id`

**Indexes:** `work_order_id`, `date`

---

### `workorders_jobattachment`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `work_order_id` | `bigint` | NOT NULL, FK → `workorders_workorder(id)` ON DELETE CASCADE | — |
| `file` | `varchar(100)` | NOT NULL | — |
| `file_type` | `varchar(20)` | NOT NULL | `''` |
| `file_size` | `integer` (positive) | NULL | NULL |
| `thumbnail` | `varchar(100)` | NULL | NULL |
| `uploaded_at` | `timestamp with time zone` | NOT NULL, auto on create | — |

**File type choices:** `'image'`, `'pdf'`, `'document'`, `'text'`

**Upload path:** `job_attachments/<work_order_id>/`

**Thumbnail path:** `job_attachments/thumbnails/`

---

### `workorders_jobnote`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `work_order_id` | `bigint` | NOT NULL, FK → `workorders_workorder(id)` ON DELETE CASCADE | — |
| `note` | `text` | NOT NULL | — |
| `created_at` | `timestamp with time zone` | NOT NULL, auto on create | — |

---

### `invoices_invoice`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `bigint` | PRIMARY KEY, auto-increment | — |
| `invoice_number` | `varchar(50)` | NOT NULL, UNIQUE (blank on creation, auto-generated from id) | `''` |
| `client_id` | `bigint` | NOT NULL, FK → `clients_client(id)` ON DELETE CASCADE | — |
| `work_order_id` | `bigint` | NULL, FK → `workorders_workorder(id)` ON DELETE SET NULL | NULL |
| `date_created` | `date` | NOT NULL | `today()` |
| `amount` | `decimal(10,2)` | NOT NULL | — |
| `status` | `varchar(20)` | NOT NULL | `'unpaid'` |
| `notes` | `text` | NULL | NULL |

**Status choices:** `'unpaid'`, `'in_quickbooks'`, `'paid'`

**Indexes:** `client_id`, `work_order_id`, `status`

---

## Entity Relationship Diagram

```
┌──────────────┐
│  CustomUser  │
│──────────────│
│ id (PK)      │
│ username     │     ┌──────────────┐
│ email        │     │    Client    │
│ password     │     │──────────────│
│ ...          │     │ id (PK)      │
└──────────────┘     │ name         │
                     │ email        │
                     │ phone        │
                     │ address      │
                     │ billing_addr │
                     └──────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
     ┌──────────────────┐    ┌─────────────────┐
     │    WorkOrder     │    │     Invoice      │
     │──────────────────│    │─────────────────│
     │ id (PK)          │◄───│ work_order_id   │
     │ client_id (FK)   │    │ (FK, SET_NULL)  │
     │ job_description  │    │ id (PK)         │
     │ estimated_cost   │    │ client_id (FK)  │
     │ status           │    │ invoice_number  │
     │ completed_at     │    │ amount          │
     │ created_at       │    │ status          │
     │ updated_at       │    │ date_created    │
     │ invoiced         │    │ notes           │
     └───────┬──────────┘    └─────────────────┘
             │
     ┌───────┼───────────────┐
     │       │               │
     ▼       ▼               ▼
┌─────────┐ ┌────────────┐ ┌─────────┐
│  Event  │ │ Attachment │ │  Note   │
│─────────│ │────────────│ │─────────│
│ id (PK) │ │ id (PK)    │ │ id (PK) │
│ wo_id   │ │ wo_id (FK) │ │ wo_id   │
│ type    │ │ file       │ │ note    │
│ address │ │ file_type  │ │ created │
│ date    │ │ file_size  │ └─────────┘
│ time    │ │ thumbnail  │
│ order   │ │ uploaded   │
│ done    │ └────────────┘
│ done_at │
│ done_by │
└─────────┘
```

---

## Cascade Delete Behavior

| When you delete... | These are also deleted... | These are preserved... |
|---|---|---|
| **Client** | All WorkOrders (cascade) → all Events, Attachments, Notes; All Invoices (cascade) | — |
| **WorkOrder** | All Events, Attachments, Notes (cascade) | Invoices (work_order_id set to NULL) |
| **Invoice** | — | Client, WorkOrder unchanged |
| **Event** | — | WorkOrder, other Events unchanged |

---

## Django Migration History

Migrations must be applied in this order for the schema to match:

### accounts
1. `0001_initial.py` — CustomUser model

### clients
1. `0001_initial.py` — Client model (name, email, phone, address)
2. `0002_client_billing_address.py` — Added billing_address

### workorders
1. `0001_initial.py` — WorkOrder, Event, JobAttachment, JobNote (base fields)
2. `0002_alter_event_options_event_daily_order_and_more.py` — Added Event.daily_order, scheduled_time, ordering
3. `0003_jobattachment_file_size_jobattachment_file_type_and_more.py` — Added file_type, file_size, thumbnail to JobAttachment
4. `0004_event_completed_event_completed_at_and_more.py` — Added Event.completed, completed_at, completed_by

### invoices
1. `0001_initial.py` — Invoice model (with due_date)
2. `0002_remove_invoice_due_date_alter_invoice_status.py` — Removed due_date, updated status choices

---

## Loading Data Into New Project

### Option A: pg_dump / pg_restore (Recommended)

Keep the same Django app names and model names. Django will see the existing tables and migration records (`django_migrations` table) and know the schema is up to date.

```bash
# Dump everything
pg_dump -Fc -h <OLD_HOST> -U <USER> <OLD_DB> > ejartmover.dump

# Restore into Railway
pg_restore --verbose --clean --no-acl --no-owner \
  -h <RAILWAY_HOST> -p <PORT> -U <USER> -d <DB_NAME> \
  ejartmover.dump

# Verify in new project
python manage.py showmigrations  # should show all applied
python manage.py check            # should pass
```

### Option B: Django dumpdata / loaddata (Fallback)

If table names change in the new project:

```bash
# From old project
python manage.py dumpdata --natural-foreign --natural-primary -o full_backup.json

# In new project (after migrations)
python manage.py loaddata full_backup.json
```

**Note:** This doesn't preserve auto-increment sequences. After loading, you'd need to reset PostgreSQL sequences manually.

---

*Generated from the Django codebase on 2026-02-18.*
