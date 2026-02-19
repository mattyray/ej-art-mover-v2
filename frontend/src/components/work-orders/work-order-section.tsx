"use client";

import { useRouter } from "next/navigation";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { ListSkeleton } from "@/components/loading-skeleton";
import { StatusBadge, InvoicedBadge } from "@/components/status-badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkOrderListActions } from "@/components/work-orders/work-order-list-actions";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import type { WorkOrderListItem } from "@/types";

export function WorkOrderSection({
  title,
  workOrders,
  totalCount,
  isLoading,
  defaultOpen = true,
}: {
  title: string;
  workOrders: WorkOrderListItem[];
  totalCount?: number;
  isLoading: boolean;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  if (isLoading) return <ListSkeleton count={2} />;

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <span className="font-semibold">
          {title}{" "}
          <span className="text-muted-foreground font-normal">
            ({totalCount ?? workOrders.length})
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>svg&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        {workOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No {title.toLowerCase()} work orders.
          </p>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="space-y-2 md:hidden">
              {workOrders.map((wo) => (
                <WorkOrderCard key={wo.id} workOrder={wo} />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow
                      key={wo.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-medium">
                        #{wo.id}
                      </TableCell>
                      <TableCell>{wo.client_name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {wo.job_description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={wo.status} type="workOrder" />
                          {wo.status === "completed" && (
                            <InvoicedBadge invoiced={wo.invoiced} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(wo.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <WorkOrderListActions workOrder={wo} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
