
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckIcon, Loader2, PencilIcon, SaveIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";

interface EditPlanDialogProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (planId: string, data: Partial<SubscriptionPlan>) => Promise<void>;
}

const planFormSchema = z.object({
  name: z.string().min(1, { message: "Plan name is required" }),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  interval: z.enum(["monthly", "quarterly", "half-yearly", "yearly", "one-time", "lifetime"]),
  features: z.string().optional(),
  has_trial_period: z.boolean().default(false),
  trial_days: z.coerce.number().min(0).optional(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export const EditPlanDialog = ({
  plan,
  isOpen,
  onOpenChange,
  onSubmit,
}: EditPlanDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      interval: "monthly",
      features: "",
      has_trial_period: false,
      trial_days: 0,
    },
  });

  const watchHasTrial = form.watch("has_trial_period");

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        interval: plan.interval,
        features: plan.features?.join("\n") || "",
        has_trial_period: plan.has_trial_period || false,
        trial_days: plan.trial_days || 0,
      });
    }
  }, [plan, form]);

  const handleSubmit = async (data: PlanFormValues) => {
    if (!plan) return;

    setIsSubmitting(true);
    try {
      // Convert features string to array
      const featuresArray = data.features
        ? data.features.split("\n").filter((feature) => feature.trim() !== "")
        : [];

      // Prepare data for submission, ensuring all fields are included
      const updatedPlan: Partial<SubscriptionPlan> = {
        id: plan.id, // Make sure to include the ID
        name: data.name,
        description: data.description,
        price: data.price,
        interval: data.interval,
        features: featuresArray,
        has_trial_period: data.has_trial_period,
        trial_days: data.has_trial_period ? data.trial_days : 0,
      };

      console.log("Submitting updated plan:", updatedPlan);
      await onSubmit(plan.id, updatedPlan);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="h-5 w-5 text-indigo-500" />
            Edit Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Update your subscription plan details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Access to all premium content and features"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                        <div className="absolute right-3 top-2.5 text-muted-foreground">
                          $
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one-time">One-Time</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full access to private content
Exclusive community benefits
Priority customer support"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter each feature on a new line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="has_trial_period"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Free Trial Period</FormLabel>
                    <FormDescription>
                      Offer a free trial period for this plan
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchHasTrial && (
              <FormField
                control={form.control}
                name="trial_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial Period (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="7"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days for the free trial period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
