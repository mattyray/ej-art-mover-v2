"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateClient } from "@/hooks/use-clients";
import type { ClientFormValues } from "@/lib/validations/client";

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useCreateClient();

  function handleSubmit(values: ClientFormValues) {
    createClient.mutate(values, {
      onSuccess: (data) => router.push(`/clients/${data.id}`),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Client" />
      <Card>
        <CardContent className="pt-6">
          <ClientForm
            onSubmit={handleSubmit}
            isSubmitting={createClient.isPending}
            onCancel={() => router.push("/clients")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
