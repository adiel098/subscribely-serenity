import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string().min(1, { message: "Plan name is required" }),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  interval: z.enum(["monthly", "quarterly", "half-yearly", "yearly", "one-time", "lifetime"]),
  features: z.string().optional(),
  has_trial_period: z.boolean().default(false),
  trial_days: z.coerce
    .number()
    .min(1, { message: "Trial period must be at least 1 day" })
    .optional(),
}).refine((data) => {
  // If trial period is enabled, trial_days must be set and >= 1
  if (data.has_trial_period) {
    return data.trial_days !== undefined && data.trial_days >= 1;
  }
  // Otherwise no additional validation needed
  return true;
}, {
  message: "Trial days are required when trial period is enabled",
  path: ["trial_days"], // This specifies which field the error should be associated with
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

// Helper function to transform features string to array
export const featuresToArray = (featuresStr?: string): string[] => {
  if (!featuresStr) return [];
  return featuresStr.split('\n').filter(feature => feature.trim() !== '');
};

// Helper function to transform features array to string
export const featuresToString = (features?: string[]): string => {
  if (!features || !Array.isArray(features)) return '';
  return features.join('\n');
};
