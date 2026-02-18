"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useInvoice,
  useAdvanceInvoiceStatus,
  useChangeInvoiceStatus,
  useDeleteInvoice,
} from "@/hooks/use-invoices";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  DollarSign,
  Calendar,
  User,
  ClipboardList,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoiceId = Number(id);
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const advanceStatus = useAdvanceInvoiceStatus();
  const changeStatus = useChangeInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  if (isLoading) return <DetailSkeleton />;
  if (!invoice) return null;

  function handleAdvanceStatus() {
    advanceStatus.mutate(invoiceId);
  }

  function handleDelete() {
    deleteInvoice.mutate(invoiceId, {
      onSuccess: () => router.push("/invoices"),
    });
  }

  const nextStatus =
    invoice.status === "unpaid"
      ? "In QuickBooks"
      : invoice.status === "in_quickbooks"
        ? "Paid"
        : null;

  const actions = (
    <>
      <Link href={`/invoices/${invoiceId}/edit`}>
        <Button variant="ghost" className="w-full justify-start gap-3 py-3">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </Link>
      {nextStatus && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 py-3"
          onClick={handleAdvanceStatus}
        >
          <ArrowRight className="h-4 w-4" />
          Mark as {nextStatus}
        </Button>
      )}
      {invoice.status !== "unpaid" && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 py-3"
          onClick={() =>
            changeStatus.mutate({ id: invoiceId, status: "unpaid" })
          }
        >
          <ArrowRight className="h-4 w-4" />
          Reset to Unpaid
        </Button>
      )}
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 py-3 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        }
        title="Delete Invoice"
        description={`This will permanently delete invoice ${invoice.invoice_number || `#${invoiceId}`}.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_number || `Invoice #${invoiceId}`}
        subtitle={invoice.client_name}
        actions={
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Actions
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/invoices/${invoiceId}/edit`}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  {nextStatus && (
                    <DropdownMenuItem
                      onClick={handleAdvanceStatus}
                      className="gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Mark as {nextStatus}
                    </DropdownMenuItem>
                  )}
                  {invoice.status !== "unpaid" && (
                    <DropdownMenuItem
                      onClick={() =>
                        changeStatus.mutate({
                          id: invoiceId,
                          status: "unpaid",
                        })
                      }
                      className="gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Reset to Unpaid
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <ConfirmDialog
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    }
                    title="Delete Invoice"
                    description={`This will permanently delete invoice ${invoice.invoice_number || `#${invoiceId}`}.`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={handleDelete}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Invoice Actions</DrawerTitle>
                  </DrawerHeader>
                  <div className="space-y-1 px-4 pb-8">{actions}</div>
                </DrawerContent>
              </Drawer>
            </div>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <Link
                  href={`/clients/${invoice.client}`}
                  className="font-medium hover:underline"
                >
                  {invoice.client_name}
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">${invoice.amount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date Created</p>
                <p className="font-medium">
                  {format(parseISO(invoice.date_created), "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <StatusBadge type="invoice" status={invoice.status} />
            </div>

            {invoice.work_order && (
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Work Order</p>
                  <Link
                    href={`/work-orders/${invoice.work_order}`}
                    className="font-medium hover:underline"
                  >
                    WO #{invoice.work_order}
                    {invoice.work_order_description &&
                      ` — ${invoice.work_order_description}`}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {invoice.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
