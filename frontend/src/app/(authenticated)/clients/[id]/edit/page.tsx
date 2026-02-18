"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useClient, useUpdateClient } from "@/hooks/use-clients";
import type { ClientFormValues } from "@/lib/validations/client";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clientId = Number(id);
  const router = useRouter();
  const { data: client, isLoading } = useClient(clientId);
  const updateClient = useUpdateClient();

  if (isLoading) return <DetailSkeleton />;
  if (!client) return null;

  function handleSubmit(values: ClientFormValues) {
    updateClient.mutate(
      { id: clientId, ...values },
      { onSuccess: () => router.push(`/clients/${clientId}`) }
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Client" subtitle={client.name} />
      <Card>
        <CardContent className="pt-6">
          <ClientForm
            defaultValues={client}
            onSubmit={handleSubmit}
            isSubmitting={updateClient.isPending}
            onCancel={() => router.push(`/clients/${clientId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
