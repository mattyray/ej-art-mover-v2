"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { DollarSign, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Invoice } from "@/types";

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {invoice.invoice_number || `Invoice #${invoice.id}`}
            </span>
            <StatusBadge type="invoice" status={invoice.status} />
          </div>

          <p className="text-sm text-muted-foreground">{invoice.client_name}</p>

          {invoice.work_order_description && (
            <p className="text-sm text-muted-foreground truncate">
              {invoice.work_order_description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {invoice.amount}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(parseISO(invoice.date_created), "MMM d, yyyy")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
