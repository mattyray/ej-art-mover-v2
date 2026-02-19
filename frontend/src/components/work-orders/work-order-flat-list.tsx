"use client";

import { useRouter } from "next/navigation";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { ListSkeleton } from "@/components/loading-skeleton";
import { StatusBadge, InvoicedBadge } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkOrderListActions } from "@/components/work-orders/work-order-list-actions";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { format } from "date-fns";

interface WorkOrderFlatListProps {
  filters: {
    status?: string;
    invoiced?: string;
    search?: string;
    ordering?: string;
    page?: number;
  };
  onPageChange: (page: number) => void;
}

export function WorkOrderFlatList({
  filters,
  onPageChange,
}: WorkOrderFlatListProps) {
  const router = useRouter();
  const { data, isLoading } = useWorkOrders(filters as Parameters<typeof useWorkOrders>[0]);

  if (isLoading) return <ListSkeleton count={5} />;

  const workOrders = data?.results || [];
  const totalCount = data?.count || 0;

  if (workOrders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No work orders found.
      </p>
    );
  }

  return (
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
                <TableCell className="font-medium">#{wo.id}</TableCell>
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

      <Pagination
        page={filters.page || 1}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </>
  );
}
