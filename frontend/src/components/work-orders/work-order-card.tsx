"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, InvoicedBadge } from "@/components/status-badge";
import { CalendarDays, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import type { WorkOrderListItem } from "@/types";

interface WorkOrderCardProps {
  workOrder: WorkOrderListItem;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <Link href={`/work-orders/${workOrder.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">WO #{workOrder.id}</span>
                <span className="text-sm text-muted-foreground">
                  {workOrder.client_name}
                </span>
              </div>
              {workOrder.job_description && (
                <p className="text-sm text-muted-foreground truncate">
                  {workOrder.job_description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(workOrder.created_at), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" />
                  {workOrder.event_count} event{workOrder.event_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={workOrder.status} type="workOrder" />
              {workOrder.status === "completed" && (
                <InvoicedBadge invoiced={workOrder.invoiced} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
