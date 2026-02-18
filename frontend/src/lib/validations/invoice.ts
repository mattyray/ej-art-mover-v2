import { z } from "zod";

export const invoiceSchema = z.object({
  client: z.number({ error: "Client is required" }),
  work_order: z.number().nullable(),
  date_created: z.string(),
  amount: z.string().min(1, "Amount is required"),
  status: z.enum(["unpaid", "in_quickbooks", "paid"]),
  notes: z.string(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
