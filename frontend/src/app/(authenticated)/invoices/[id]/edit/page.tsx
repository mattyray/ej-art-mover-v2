"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoiceId = Number(id);
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const updateInvoice = useUpdateInvoice();

  if (isLoading) return <DetailSkeleton />;
  if (!invoice) return null;

  async function handleSubmit(values: InvoiceFormValues) {
    await updateInvoice.mutateAsync({ id: invoiceId, ...values });
    router.push(`/invoices/${invoiceId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Invoice"
        subtitle={invoice.invoice_number || `Invoice #${invoiceId}`}
      />
      <Card>
        <CardContent className="pt-6">
          <InvoiceForm
            defaultValues={invoice}
            onSubmit={handleSubmit}
            isSubmitting={updateInvoice.isPending}
            onCancel={() => router.push(`/invoices/${invoiceId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
