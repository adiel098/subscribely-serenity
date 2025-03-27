
import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string().min(1, { message: "Plan name is required" }),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  interval: z.enum(["monthly", "quarterly", "half-yearly", "yearly", "one-time", "lifetime"]),
  features: z.string().optional(),
  has_trial_period: z.boolean().default(false),
  trial_days: z.coerce.number().min(0).optional(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;
