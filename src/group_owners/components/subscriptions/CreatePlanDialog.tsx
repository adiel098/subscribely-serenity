import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { CreateSubscriptionPlanData } from "@/group_owners/hooks/types/subscription.types";
import { planFormSchema, PlanFormValues, featuresToArray } from "./plan-form/PlanFormSchema";
import { PlanBasicInfoSection } from "./form-sections/PlanBasicInfoSection";
import { PlanPricingSection } from "./form-sections/PlanPricingSection";
import { PlanFeaturesSection } from "./form-sections/PlanFeaturesSection";
import { PlanTrialSection } from "./form-sections/PlanTrialSection";
import { PlanFormActions } from "./form-sections/PlanFormActions";

interface CreatePlanDialogProps {
  communityId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSubscriptionPlanData) => Promise<void>;
}

export const CreatePlanDialog = ({
  communityId,
  isOpen,
  onOpenChange,
  onSubmit,
}: CreatePlanDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 9.99,
      interval: "monthly",
      features: "",
      has_trial_period: false,
      trial_days: undefined,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: PlanFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert features string to array
      const featuresArray = featuresToArray(data.features);

      // Prepare data for submission
      const planData: CreateSubscriptionPlanData = {
        community_id: communityId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        interval: data.interval,
        features: featuresArray,
        has_trial_period: data.has_trial_period,
        trial_days: data.has_trial_period ? (data.trial_days || 0) : 0,
      };

      console.log("Creating plan with data:", planData);
      await onSubmit(planData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        description: "",
        price: 9.99,
        interval: "monthly",
        features: "",
        has_trial_period: false,
        trial_days: undefined,
      });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5 text-indigo-500" />
            Create Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Create a new subscription plan for your community
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
