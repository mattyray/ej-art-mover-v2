import type { EventType, WorkOrderStatus, InvoiceStatus } from "@/types";

// ============================================================
// API
// ============================================================

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const PAGE_SIZE = 20;

// ============================================================
// Event Types
// ============================================================

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "pickup", label: "Pickup" },
  { value: "pickup_wrap", label: "Pickup & Wrap" },
  { value: "wrap", label: "Wrap" },
  { value: "install", label: "Install" },
  { value: "deliver_install", label: "Deliver & Install" },
  { value: "dropoff", label: "Dropoff" },
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  pickup: "Pickup",
  pickup_wrap: "Pickup & Wrap",
  wrap: "Wrap",
  install: "Install",
  deliver_install: "Deliver & Install",
  dropoff: "Dropoff",
};

// ============================================================
// Work Order Statuses
// ============================================================

export const WORK_ORDER_STATUSES: Record<
  WorkOrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
};

// ============================================================
// Invoice Statuses
// ============================================================

export const INVOICE_STATUSES: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  unpaid: { label: "Unpaid", color: "bg-red-100 text-red-800" },
  in_quickbooks: {
    label: "In QuickBooks",
    color: "bg-yellow-100 text-yellow-800",
  },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
};

// ============================================================
// Calendar Colors
// ============================================================

export const CALENDAR_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#bcbd22",
  "#17becf",
];

export const COMPLETED_COLOR = "#6c757d";

// ============================================================
// File Upload
// ============================================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
];
