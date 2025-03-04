
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LucideKeyRound } from "lucide-react";
import { planFormSchema, PlanFormValues } from "./PlanFormSchema";
import { PlanBasicInfoSection } from "./form-sections/PlanBasicInfoSection";
import { PlanConfigSection } from "./form-sections/PlanConfigSection";
import { PlanLimitsSection } from "./form-sections/PlanLimitsSection";
import { PlanDescriptionSection } from "./form-sections/PlanDescriptionSection";
import { PlanFeaturesSection } from "./form-sections/PlanFeaturesSection";
import { PlanFormActions } from "./form-sections/PlanFormActions";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange }: Props) => {
  const { createPlan } = usePlatformPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      interval: "monthly",
      features: [], // Initialize with empty array to match the expected type
      is_active: true,
      max_communities: 1,
      max_members_per_community: "",
    },
  });

  const onSubmit = async (values: PlanFormValues) => {
    setIsSubmitting(true);
    try {
      await createPlan.mutateAsync({
        name: values.name, // Required field
        description: values.description,
        price: values.price,
        interval: values.interval,
        features: values.features, // Transformed to string[] by Zod
        is_active: values.is_active,
        max_communities: values.max_communities,
        max_members_per_community: values.max_members_per_community,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LucideKeyRound className="h-5 w-5 text-indigo-600" />
            Create Platform Plan
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
              submitText="Create Plan"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
