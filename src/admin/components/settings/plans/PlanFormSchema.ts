
import * as z from "zod";

export const planFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  interval: z.enum(["monthly", "quarterly", "yearly", "half-yearly", "one-time", "lifetime"]),
  features: z.array(z.string()).default([]).or(
    z.string().transform(val => 
      val.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
    )
  ),
  is_active: z.boolean().default(true),
  max_communities: z.coerce.number().int().min(1, "Must allow at least 1 community"),
  max_members_per_community: z.union([
    z.coerce.number().int().min(1, "Must allow at least 1 member per community"),
    z.literal('').transform(() => null)
  ]),
  has_trial_period: z.boolean().default(false),
  trial_days: z.union([
    z.coerce.number().int().min(1, "Trial days must be at least 1"),
    z.literal('').transform(() => null)
  ]).optional(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;
