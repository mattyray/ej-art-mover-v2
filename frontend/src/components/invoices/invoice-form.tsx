"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invoiceSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { ClientSelect } from "@/components/clients/client-select";
import { WorkOrderSelect } from "./work-order-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUSES } from "@/lib/constants";
import { format } from "date-fns";
import type { Invoice } from "@/types";

interface InvoiceFormProps {
  defaultValues?: Invoice;
  prefillClientId?: number;
  prefillWorkOrderId?: number;
  onSubmit: (values: InvoiceFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function InvoiceForm({
  defaultValues,
  prefillClientId,
  prefillWorkOrderId,
  onSubmit,
  isSubmitting,
  onCancel,
}: InvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client:
        defaultValues?.client ??
        prefillClientId ??
        (undefined as unknown as number),
      work_order:
        defaultValues?.work_order ?? prefillWorkOrderId ?? null,
      date_created:
        defaultValues?.date_created ?? format(new Date(), "yyyy-MM-dd"),
      amount: defaultValues?.amount ?? "",
      status: defaultValues?.status ?? "unpaid",
      notes: defaultValues?.notes ?? "",
    },
  });

  const clientId = form.watch("client");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  onSelect={(id) => {
                    field.onChange(id);
                    // Reset work order when client changes
                    form.setValue("work_order", null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Work Order */}
        <FormField
          control={form.control}
          name="work_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Order</FormLabel>
              <FormControl>
                <WorkOrderSelect
                  clientId={clientId}
                  value={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date_created"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
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

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.entries(INVOICE_STATUSES) as [
                      string,
                      { label: string },
                    ][]
                  ).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
