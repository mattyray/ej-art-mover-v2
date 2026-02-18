import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  billing_address: z.string().optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
