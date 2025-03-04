
import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange }: Props) => {
  const { createPlan } = usePlatformPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Add effect to properly track dialog open state
  useEffect(() => {
    console.log("CreatePlanDialog received isOpen change:", isOpen);
  }, [isOpen]);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      interval: "monthly",
      features: [], 
      is_active: true,
      max_communities: 1,
      max_members_per_community: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog is open, resetting form");
      form.reset({
        name: "",
        description: "",
        price: 0,
        interval: "monthly",
        features: [],
        is_active: true,
        max_communities: 1,
        max_members_per_community: "",
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (values: PlanFormValues) => {
    console.log("Submitting form with values:", values);
    setIsSubmitting(true);
    try {
      await createPlan.mutateAsync({
        name: values.name,
        description: values.description,
        price: values.price,
        interval: values.interval,
        features: values.features,
        is_active: values.is_active,
        max_communities: values.max_communities,
        max_members_per_community: values.max_members_per_community,
      });
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log when the component renders
  console.log("CreatePlanDialog rendered, isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
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
}
