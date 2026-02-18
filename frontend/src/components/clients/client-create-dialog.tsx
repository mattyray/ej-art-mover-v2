"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";
import { useCreateClient } from "@/hooks/use-clients";
import type { ClientFormValues } from "@/lib/validations/client";

interface ClientCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (clientId: number) => void;
}

export function ClientCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ClientCreateDialogProps) {
  const createClient = useCreateClient();

  function handleSubmit(values: ClientFormValues) {
    createClient.mutate(values, {
      onSuccess: (data) => {
        onOpenChange(false);
        onCreated(data.id);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
        </DialogHeader>
        <ClientForm
          onSubmit={handleSubmit}
          isSubmitting={createClient.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
