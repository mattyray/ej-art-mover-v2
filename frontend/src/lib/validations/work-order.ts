import { z } from "zod";

export const eventFormSchema = z.object({
  id: z.number().optional(),
  event_type: z.enum([
    "pickup",
    "pickup_wrap",
    "wrap",
    "install",
    "deliver_install",
    "dropoff",
  ]),
  address: z.string(),
  date: z.string().nullable(),
  scheduled_time: z.string().nullable(),
});

export const workOrderFormSchema = z.object({
  client: z.number({ error: "Client is required" }),
  job_description: z.string(),
  estimated_cost: z.string(),
  events: z.array(eventFormSchema),
});

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;
export type EventFormValues = z.infer<typeof eventFormSchema>;
