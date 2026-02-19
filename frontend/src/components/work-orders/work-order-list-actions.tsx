"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  CheckCircle,
  FileText,
  Pencil,
  Trash2,
  Undo2,
  DollarSign,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import {
  useMarkCompleted,
  useMarkPaid,
  useChangeWorkOrderStatus,
  useResetInvoiced,
  useDeleteWorkOrder,
} from "@/hooks/use-work-orders";
import type { WorkOrderListItem } from "@/types";

interface WorkOrderListActionsProps {
  workOrder: WorkOrderListItem;
}

export function WorkOrderListActions({ workOrder }: WorkOrderListActionsProps) {
  const router = useRouter();
  const markCompleted = useMarkCompleted();
  const markPaid = useMarkPaid();
  const changeStatus = useChangeWorkOrderStatus();
  const resetInvoiced = useResetInvoiced();
  const deleteWorkOrder = useDeleteWorkOrder();

  const { id, status, invoiced, client } = workOrder;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={stop}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Pending */}
        {status === "pending" && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                changeStatus.mutate({ id, status: "in_progress" });
              }}
            >
              <CalendarCheck className="h-4 w-4" />
              Mark Scheduled
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                markCompleted.mutate(id);
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Completed
            </DropdownMenuItem>
          </>
        )}

        {/* Scheduled (in_progress) */}
        {status === "in_progress" && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                markCompleted.mutate(id);
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                changeStatus.mutate({ id, status: "pending" });
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Revert to Pending
            </DropdownMenuItem>
          </>
        )}

        {/* Completed, not invoiced */}
        {status === "completed" && !invoiced && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                router.push(`/invoices/new?work_order=${id}`);
              }}
            >
              <FileText className="h-4 w-4" />
              Create Invoice
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                markPaid.mutate(id);
              }}
            >
              <DollarSign className="h-4 w-4" />
              Mark Invoiced
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                changeStatus.mutate({ id, status: "in_progress" });
              }}
            >
              <Undo2 className="h-4 w-4" />
              Revert to In Progress
            </DropdownMenuItem>
          </>
        )}

        {/* Completed and invoiced */}
        {status === "completed" && invoiced && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                resetInvoiced.mutate(id);
              }}
            >
              <Undo2 className="h-4 w-4" />
              Reset Invoiced
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                stop(e);
                changeStatus.mutate({ id, status: "in_progress" });
              }}
            >
              <Undo2 className="h-4 w-4" />
              Revert to In Progress
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            stop(e);
            router.push(`/work-orders/${id}/edit`);
          }}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            stop(e);
            if (confirm(`Delete work order #${id}?`)) {
              deleteWorkOrder.mutate(id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
