
import * as z from "zod";

export const couponFormSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Code must be at least 3 characters" })
    .max(20, { message: "Code must be at most 20 characters" })
    .refine((val) => /^[A-Za-z0-9_-]+$/.test(val), {
      message: "Code must contain only letters, numbers, hyphens, and underscores",
    }),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_amount: z.coerce
    .number()
    .min(0, { message: "Discount amount must be positive" })
    .refine(
      (val) => val > 0,
      { message: "Discount amount must be greater than 0" }
    ),
  max_uses: z.union([
    z.coerce
      .number()
      .min(1, { message: "Must be at least 1" })
      .optional(),
    z.literal("").transform(() => undefined),
  ]),
  is_active: z.boolean().default(true),
  expires_at: z.union([
    z.date().optional(),
    z.string().optional(),
    z.literal("").transform(() => undefined),
  ]),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;
