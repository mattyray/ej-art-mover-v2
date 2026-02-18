"use client";

import { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workOrderFormSchema,
  type WorkOrderFormValues,
} from "@/lib/validations/work-order";
import { ClientSelect } from "@/components/clients/client-select";
import { ClientCreateDialog } from "@/components/clients/client-create-dialog";
import { EventFormRow } from "./event-form-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus } from "lucide-react";
import type { WorkOrderDetail } from "@/types";

type SubmitAction = "save" | "save_complete" | "save_invoice";

interface WorkOrderFormProps {
  defaultValues?: WorkOrderDetail;
  onSubmit: (values: WorkOrderFormValues, action: SubmitAction) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function WorkOrderForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: WorkOrderFormProps) {
  const [showClientDialog, setShowClientDialog] = useState(false);

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      client: defaultValues?.client ?? (undefined as unknown as number),
      job_description: defaultValues?.job_description ?? "",
      estimated_cost: defaultValues?.estimated_cost ?? "",
      events:
        defaultValues?.events.map((e) => ({
          id: e.id,
          event_type: e.event_type,
          address: e.address ?? "",
          date: e.date ?? null,
          scheduled_time: e.scheduled_time?.slice(0, 5) ?? null,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events",
  });

  function handleSubmit(action: SubmitAction) {
    form.handleSubmit((values) => onSubmit(values, action))();
  }

  return (
    <FormProvider {...form}>
      <form className="space-y-6">
        {/* Client */}
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client *</FormLabel>
              <FormControl>
                <ClientSelect
                  value={field.value}
                  onSelect={field.onChange}
                  onCreateNew={() => setShowClientDialog(true)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="job_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the job..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Cost */}
        <FormField
          control={form.control}
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Events</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                append({
                  event_type: "pickup",
                  address: "",
                  date: null,
                  scheduled_time: null,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add Event
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
              No events yet. Add events to schedule this work order.
            </p>
          )}

          {fields.map((field, index) => (
            <EventFormRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleSubmit("save")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit("save_complete")}
            disabled={isSubmitting}
          >
            Save & Complete
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit("save_invoice")}
            disabled={isSubmitting}
          >
            Save & Invoice
          </Button>
        </div>
      </form>

      <ClientCreateDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onCreated={(clientId) => form.setValue("client", clientId)}
      />
    </FormProvider>
  );
}
