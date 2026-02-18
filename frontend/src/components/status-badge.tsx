import { Badge } from "@/components/ui/badge";
import { WORK_ORDER_STATUSES, INVOICE_STATUSES } from "@/lib/constants";
import type { WorkOrderStatus, InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: WorkOrderStatus | InvoiceStatus;
  type: "workOrder" | "invoice";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config =
    type === "workOrder"
      ? WORK_ORDER_STATUSES[status as WorkOrderStatus]
      : INVOICE_STATUSES[status as InvoiceStatus];

  if (!config) return null;

  return (
    <Badge variant="secondary" className={cn(config.color, className)}>
      {config.label}
    </Badge>
  );
}

export function InvoicedBadge({
  invoiced,
  className,
}: {
  invoiced: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        invoiced
          ? "bg-purple-100 text-purple-800"
          : "bg-gray-100 text-gray-600",
        className
      )}
    >
      {invoiced ? "Invoiced" : "Not Invoiced"}
    </Badge>
  );
}
