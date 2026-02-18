import { z } from "zod";

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Phone must be (XXX) XXX-XXXX")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  billing_address: z.string().optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
