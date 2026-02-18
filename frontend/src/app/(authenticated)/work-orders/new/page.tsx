"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateWorkOrder,
  useMarkCompleted,
  useCompleteAndInvoice,
} from "@/hooks/use-work-orders";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const createWorkOrder = useCreateWorkOrder();
  const markCompleted = useMarkCompleted();
  const completeAndInvoice = useCompleteAndInvoice();

  async function handleSubmit(
    values: WorkOrderFormValues,
    action: "save" | "save_complete" | "save_invoice"
  ) {
    const data = await createWorkOrder.mutateAsync(values);

    if (action === "save_complete") {
      await markCompleted.mutateAsync(data.id);
      router.push(`/work-orders/${data.id}`);
    } else if (action === "save_invoice") {
      await completeAndInvoice.mutateAsync(data.id);
      router.push(`/invoices/new?work_order=${data.id}`);
    } else {
      router.push(`/work-orders/${data.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Work Order" />
      <Card>
        <CardContent className="pt-6">
          <WorkOrderForm
            onSubmit={handleSubmit}
            isSubmitting={
              createWorkOrder.isPending ||
              markCompleted.isPending ||
              completeAndInvoice.isPending
            }
            onCancel={() => router.push("/work-orders")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
