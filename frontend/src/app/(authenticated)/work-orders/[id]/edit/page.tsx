"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  useWorkOrder,
  useUpdateWorkOrder,
  useMarkCompleted,
  useCompleteAndInvoice,
} from "@/hooks/use-work-orders";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

export default function EditWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workOrderId = Number(id);
  const router = useRouter();
  const { data: workOrder, isLoading } = useWorkOrder(workOrderId);
  const updateWorkOrder = useUpdateWorkOrder();
  const markCompleted = useMarkCompleted();
  const completeAndInvoice = useCompleteAndInvoice();

  if (isLoading) return <DetailSkeleton />;
  if (!workOrder) return null;

  async function handleSubmit(
    values: WorkOrderFormValues,
    action: "save" | "save_complete" | "save_invoice"
  ) {
    await updateWorkOrder.mutateAsync({ id: workOrderId, ...values });

    if (action === "save_complete") {
      await markCompleted.mutateAsync(workOrderId);
      router.push(`/work-orders/${workOrderId}`);
    } else if (action === "save_invoice") {
      await completeAndInvoice.mutateAsync(workOrderId);
      router.push(`/invoices/new?work_order=${workOrderId}`);
    } else {
      router.push(`/work-orders/${workOrderId}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Work Order"
        subtitle={`WO #${workOrderId} — ${workOrder.client_name}`}
      />
      <Card>
        <CardContent className="pt-6">
          <WorkOrderForm
            defaultValues={workOrder}
            onSubmit={handleSubmit}
            isSubmitting={
              updateWorkOrder.isPending ||
              markCompleted.isPending ||
              completeAndInvoice.isPending
            }
            onCancel={() => router.push(`/work-orders/${workOrderId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
