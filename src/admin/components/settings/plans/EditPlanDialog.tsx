
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import { planFormSchema, PlanFormValues } from "./PlanFormSchema";
import { PlanBasicInfoSection } from "./form-sections/PlanBasicInfoSection";
import { PlanConfigSection } from "./form-sections/PlanConfigSection";
import { PlanLimitsSection } from "./form-sections/PlanLimitsSection";
import { PlanDescriptionSection } from "./form-sections/PlanDescriptionSection";
import { PlanFeaturesSection } from "./form-sections/PlanFeaturesSection";
import { PlanFormActions } from "./form-sections/PlanFormActions";

interface Props {
  plan: PlatformPlan;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlanDialog = ({ plan, isOpen, onOpenChange }: Props) => {
  const { updatePlan } = usePlatformPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      id: plan.id,
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      interval: plan.interval,
      features: plan.features ? plan.features.join('\n') : "", // Convert array to string for form
      is_active: plan.is_active,
      max_communities: plan.max_communities,
      max_members_per_community: plan.max_members_per_community === null 
        ? "" 
        : plan.max_members_per_community,
    },
  });

  // Reset form when plan changes
  useEffect(() => {
    if (plan && isOpen) {
      form.reset({
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        interval: plan.interval,
        features: plan.features ? plan.features.join('\n') : "", // Convert array to string for form
        is_active: plan.is_active,
        max_communities: plan.max_communities,
        max_members_per_community: plan.max_members_per_community === null 
          ? "" 
          : plan.max_members_per_community,
      });
    }
  }, [plan, isOpen, form]);

  const onSubmit = async (values: PlanFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePlan.mutateAsync({
        id: values.id as string, // Required field
        name: values.name,
        description: values.description,
        price: values.price,
        interval: values.interval,
        features: values.features, // Transformed to string[] by Zod
        is_active: values.is_active,
        max_communities: values.max_communities,
        max_members_per_community: values.max_members_per_community,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PencilIcon className="h-5 w-5 text-indigo-600" />
            Edit Platform Plan
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PlanBasicInfoSection form={form} />
            <PlanConfigSection form={form} />
            <PlanLimitsSection form={form} />
            <PlanDescriptionSection form={form} />
            <PlanFeaturesSection form={form} />
            <PlanFormActions 
              isSubmitting={isSubmitting} 
              onCancel={() => onOpenChange(false)} 
              submitText="Save Changes"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
