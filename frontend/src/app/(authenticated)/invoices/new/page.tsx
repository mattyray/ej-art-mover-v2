"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateInvoice } from "@/hooks/use-invoices";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createInvoice = useCreateInvoice();

  const prefillWorkOrderId = searchParams.get("work_order")
    ? Number(searchParams.get("work_order"))
    : undefined;

  async function handleSubmit(values: InvoiceFormValues) {
    const data = await createInvoice.mutateAsync(values);
    router.push(`/invoices/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Invoice" />
      <Card>
        <CardContent className="pt-6">
          <InvoiceForm
            prefillWorkOrderId={prefillWorkOrderId}
            onSubmit={handleSubmit}
            isSubmitting={createInvoice.isPending}
            onCancel={() => router.push("/invoices")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
