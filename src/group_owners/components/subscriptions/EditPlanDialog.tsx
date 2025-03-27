
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { planFormSchema, PlanFormValues } from "./plan-form/PlanFormSchema";
import { PlanBasicInfoSection } from "./form-sections/PlanBasicInfoSection";
import { PlanPricingSection } from "./form-sections/PlanPricingSection";
import { PlanFeaturesSection } from "./form-sections/PlanFeaturesSection";
import { PlanTrialSection } from "./form-sections/PlanTrialSection";
import { PlanFormActions } from "./form-sections/PlanFormActions";

interface EditPlanDialogProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (planId: string, data: Partial<SubscriptionPlan>) => Promise<void>;
}

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
        id: plan.id,
        name: data.name,
        description: data.description,
        price: data.price,
        interval: data.interval,
        features: featuresArray,
        has_trial_period: data.has_trial_period,
        trial_days: data.has_trial_period ? data.trial_days : 0,
        community_id: plan.community_id, // Ensure community_id is passed
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
            <PlanBasicInfoSection form={form} />
            <PlanPricingSection form={form} />
            <PlanFeaturesSection form={form} />
            <PlanTrialSection form={form} />
            <PlanFormActions 
              isSubmitting={isSubmitting} 
              onCancel={() => onOpenChange(false)}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
