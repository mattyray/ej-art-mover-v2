// ============================================================
// API Response Wrappers
// ============================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================
// Auth
// ============================================================

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ============================================================
// Clients
// ============================================================

export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  billing_address: string | null;
  work_order_count: number;
}

export interface ClientListItem {
  id: number;
  name: string;
}

export type ClientInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_address?: string;
};

// ============================================================
// Work Orders
// ============================================================

export type WorkOrderStatus = "pending" | "in_progress" | "completed";

export interface WorkOrderListItem {
  id: number;
  client: number;
  client_name: string;
  job_description: string | null;
  estimated_cost: string | null;
  status: WorkOrderStatus;
  invoiced: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  event_count: number;
}

export interface WorkOrderDetail {
  id: number;
  client: number;
  client_name: string;
  job_description: string | null;
  estimated_cost: string | null;
  status: WorkOrderStatus;
  invoiced: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  events: Event[];
  attachments: Attachment[];
  notes: Note[];
}

export type WorkOrderInput = {
  client: number;
  job_description?: string;
  estimated_cost?: string;
  status?: WorkOrderStatus;
  invoiced?: boolean;
  events?: EventInput[];
};

// ============================================================
// Events
// ============================================================

export type EventType =
  | "pickup"
  | "pickup_wrap"
  | "wrap"
  | "install"
  | "deliver_install"
  | "dropoff";

export interface Event {
  id: number;
  work_order: number;
  event_type: EventType;
  event_type_display: string;
  address: string;
  date: string | null;
  daily_order: number | null;
  scheduled_time: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string;
}

export type EventInput = {
  id?: number;
  event_type: EventType;
  address?: string;
  date?: string | null;
  daily_order?: number | null;
  scheduled_time?: string | null;
  completed?: boolean;
};

// ============================================================
// Attachments
// ============================================================

export type FileType = "image" | "pdf" | "document" | "text";

export interface Attachment {
  id: number;
  work_order: number;
  file: string;
  file_type: FileType;
  file_size: number | null;
  file_url: string | null;
  thumbnail_url: string | null;
  file_icon: string;
  uploaded_at: string;
}

// ============================================================
// Notes
// ============================================================

export interface Note {
  id: number;
  work_order: number;
  note: string;
  created_at: string;
}

export type NoteInput = {
  work_order: number;
  note: string;
};

// ============================================================
// Invoices
// ============================================================

export type InvoiceStatus = "unpaid" | "in_quickbooks" | "paid";

export interface Invoice {
  id: number;
  invoice_number: string;
  client: number;
  client_name: string;
  work_order: number | null;
  work_order_description: string | null;
  date_created: string;
  amount: string;
  status: InvoiceStatus;
  notes: string | null;
}

export type InvoiceInput = {
  client: number;
  work_order?: number | null;
  date_created?: string;
  amount: string;
  status?: InvoiceStatus;
  notes?: string;
};

// ============================================================
// Calendar
// ============================================================

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  color: string;
  workOrderId: number;
  dailyOrder: number | null;
  isEventCompleted: boolean;
  isWorkOrderCompleted: boolean;
  isCompleted: boolean;
}
