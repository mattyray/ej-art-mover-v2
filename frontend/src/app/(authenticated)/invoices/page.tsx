"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceCard } from "@/components/invoices/invoice-card";
import { ListSkeleton } from "@/components/loading-skeleton";
import { Fab } from "@/components/fab";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/status-badge";
import { useInvoices } from "@/hooks/use-invoices";
import { ChevronDown, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { InvoiceStatus, Invoice } from "@/types";

const SECTIONS: { status: InvoiceStatus; label: string }[] = [
  { status: "unpaid", label: "Unpaid" },
  { status: "in_quickbooks", label: "In QuickBooks" },
  { status: "paid", label: "Paid" },
];

function InvoiceSection({
  status,
  label,
}: {
  status: InvoiceStatus;
  label: string;
}) {
  const { data, isLoading } = useInvoices({ status });
  const invoices: Invoice[] = data?.results ?? [];

  if (isLoading) return <ListSkeleton count={3} />;
  if (invoices.length === 0) return null;

  return (
    <Collapsible defaultOpen={status !== "paid"}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 font-medium hover:bg-accent/50">
        <span>
          {label} ({invoices.length})
        </span>
        <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {/* Mobile: Cards */}
        <div className="space-y-2 md:hidden">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium hover:underline"
                    >
                      {invoice.invoice_number || `#${invoice.id}`}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>
                    {format(parseISO(invoice.date_created), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="invoice" status={invoice.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        actions={
          <Button asChild className="hidden md:inline-flex">
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-1" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <InvoiceSection key={s.status} status={s.status} label={s.label} />
        ))}
      </div>

      <Fab href="/invoices/new" />
    </div>
  );
}
