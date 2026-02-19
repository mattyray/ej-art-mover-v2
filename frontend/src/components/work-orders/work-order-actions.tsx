"use client";

import Link from "next/link";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useMarkCompleted,
  useMarkPaid,
  useCompleteAndInvoice,
  useChangeWorkOrderStatus,
  useResetInvoiced,
  useDeleteWorkOrder,
} from "@/hooks/use-work-orders";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Receipt,
  RotateCcw,
  Undo2,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import type { WorkOrderDetail } from "@/types";

interface WorkOrderActionsProps {
  workOrder: WorkOrderDetail;
}

export function WorkOrderActions({ workOrder }: WorkOrderActionsProps) {
  const router = useRouter();
  const markCompleted = useMarkCompleted();
  const markPaid = useMarkPaid();
  const completeAndInvoice = useCompleteAndInvoice();
  const changeStatus = useChangeWorkOrderStatus();
  const resetInvoiced = useResetInvoiced();
  const deleteWorkOrder = useDeleteWorkOrder();

  const { id, status, invoiced } = workOrder;

  function handleMarkCompleted() {
    markCompleted.mutate(id, {
      onSuccess: () => router.refresh(),
    });
  }

  function handleCompleteAndInvoice() {
    completeAndInvoice.mutate(id, {
      onSuccess: () => router.push(`/invoices/new?work_order=${id}`),
    });
  }

  function handleMarkPaid() {
    markPaid.mutate(id);
  }

  function handleMarkScheduled() {
    changeStatus.mutate({ id, status: "in_progress" });
  }

  function handleRevertToPending() {
    changeStatus.mutate({ id, status: "pending" });
  }

  function handleRevertToInProgress() {
    changeStatus.mutate({ id, status: "in_progress" });
  }

  function handleResetInvoiced() {
    resetInvoiced.mutate(id);
  }

  function handleDelete() {
    deleteWorkOrder.mutate(id, {
      onSuccess: () => router.push("/work-orders"),
    });
  }

  // Build action list — next lifecycle step always first
  const actions: {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    href?: string;
    separator?: boolean;
  }[] = [];

  if (status === "pending") {
    actions.push({
      label: "Mark Scheduled",
      icon: <CalendarCheck className="h-4 w-4" />,
      onClick: handleMarkScheduled,
    });
    actions.push({
      label: "Mark Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleMarkCompleted,
    });
    actions.push({
      label: "Complete & Invoice",
      icon: <Receipt className="h-4 w-4" />,
      onClick: handleCompleteAndInvoice,
    });
  }

  if (status === "in_progress") {
    actions.push({
      label: "Mark Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleMarkCompleted,
    });
    actions.push({
      label: "Complete & Invoice",
      icon: <Receipt className="h-4 w-4" />,
      onClick: handleCompleteAndInvoice,
    });
    actions.push({
      separator: true,
      label: "",
      icon: null,
    });
    actions.push({
      label: "Revert to Pending",
      icon: <ArrowLeft className="h-4 w-4" />,
      onClick: handleRevertToPending,
    });
  }

  if (status === "completed" && !invoiced) {
    actions.push({
      label: "Create Invoice",
      icon: <Receipt className="h-4 w-4" />,
      href: `/invoices/new?work_order=${id}`,
    });
    actions.push({
      label: "Mark Invoiced",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleMarkPaid,
    });
    actions.push({
      separator: true,
      label: "",
      icon: null,
    });
    actions.push({
      label: "Revert to In Progress",
      icon: <Undo2 className="h-4 w-4" />,
      onClick: handleRevertToInProgress,
    });
  }

  if (status === "completed" && invoiced) {
    actions.push({
      label: "Reset Invoiced",
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: handleResetInvoiced,
    });
    actions.push({
      separator: true,
      label: "",
      icon: null,
    });
    actions.push({
      label: "Revert to In Progress",
      icon: <Undo2 className="h-4 w-4" />,
      onClick: handleRevertToInProgress,
    });
  }

  actions.push({
    separator: true,
    label: "",
    icon: null,
  });
  actions.push({
    label: "Edit",
    icon: <Pencil className="h-4 w-4" />,
    href: `/work-orders/${id}/edit`,
  });

  const deleteAction = {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive" as const,
    confirm: {
      title: "Delete Work Order",
      description: `This will permanently delete Work Order #${id} including all events, attachments, and notes.`,
    },
  };

  return (
    <>
      {/* Desktop: Dropdown */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Actions
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action, i) =>
              action.separator ? (
                <DropdownMenuSeparator key={`sep-${i}`} />
              ) : action.href ? (
                <DropdownMenuItem key={action.label} asChild>
                  <Link href={action.href} className="gap-2">
                    {action.icon}
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={action.label}
                  onClick={action.onClick}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              )
            )}
            <ConfirmDialog
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  {deleteAction.icon}
                  {deleteAction.label}
                </DropdownMenuItem>
              }
              title={deleteAction.confirm.title}
              description={deleteAction.confirm.description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={handleDelete}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Drawer */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Work Order Actions</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-1 px-4 pb-8">
              {actions.map((action, i) =>
                action.separator ? (
                  <div key={`sep-${i}`} className="border-t my-1" />
                ) : action.href ? (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 py-3"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start gap-3 py-3"
                    onClick={action.onClick}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                )
              )}
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 py-3 text-destructive hover:text-destructive"
                  >
                    {deleteAction.icon}
                    {deleteAction.label}
                  </Button>
                }
                title={deleteAction.confirm.title}
                description={deleteAction.confirm.description}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
