"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, InvoicedBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClient, useDeleteClient } from "@/hooks/use-clients";
import { useWorkOrders } from "@/hooks/use-work-orders";
import {
  AlertCircle,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clientId = Number(id);
  const router = useRouter();
  const { data: client, isLoading, isError } = useClient(clientId);
  const { data: workOrdersData } = useWorkOrders({ client: clientId });
  const deleteClient = useDeleteClient();

  if (isLoading) return <DetailSkeleton />;
  if (isError || !client) return (
    <EmptyState
      icon={AlertCircle}
      title="Client not found"
      description="This client may have been deleted or you don't have access."
      action={<Button variant="outline" onClick={() => router.push("/clients")}>Back to Clients</Button>}
    />
  );

  const workOrders = workOrdersData?.results || [];

  function handleDelete() {
    deleteClient.mutate(clientId, {
      onSuccess: () => router.push("/clients"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        subtitle={`${client.work_order_count} work order${client.work_order_count !== 1 ? "s" : ""}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/clients/${clientId}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              }
              title="Delete Client"
              description={`This will permanently delete ${client.name} and all their work orders and invoices.`}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={handleDelete}
            />
          </div>
        }
      />

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="hover:underline">
                {client.email}
              </a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:underline">
                {client.phone}
              </a>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{client.address}</span>
            </div>
          )}
          {client.billing_address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground text-xs">Billing: </span>
                {client.billing_address}
              </div>
            </div>
          )}
          {!client.email && !client.phone && !client.address && (
            <p className="text-sm text-muted-foreground">
              No contact information on file.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No work orders"
              description="This client doesn't have any work orders yet."
            />
          ) : (
            <div className="space-y-3">
              {workOrders.map((wo) => (
                <Link
                  key={wo.id}
                  href={`/work-orders/${wo.id}`}
                  className="block rounded-md border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">WO #{wo.id}</p>
                      {wo.job_description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {wo.job_description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(wo.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={wo.status} type="workOrder" />
                      {wo.status === "completed" && (
                        <InvoicedBadge invoiced={wo.invoiced} />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
