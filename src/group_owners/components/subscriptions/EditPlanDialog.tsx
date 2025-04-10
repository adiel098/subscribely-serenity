
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubscriptionPlan, SubscriptionInterval } from "@/group_owners/hooks/types/subscription.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";

const subscriptionIntervals = {
  "monthly": "Monthly",
  "quarterly": "Quarterly", 
  "half_yearly": "Half Yearly",
  "yearly": "Yearly",
  "one-time": "One Time",
  "lifetime": "Lifetime"
} as const;

const editPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string(),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number"
  }),
  interval: z.enum(["monthly", "quarterly", "half_yearly", "yearly", "one-time", "lifetime"] as const),
  features: z.array(z.string()).default([])
});

type EditPlanFormValues = z.infer<typeof editPlanSchema>;

interface EditPlanDialogProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (planId: string, data: Partial<SubscriptionPlan>) => Promise<void>;
}

export const EditPlanDialog = ({ 
  plan, 
  isOpen, 
  onOpenChange, 
  onSubmit 
}: EditPlanDialogProps) => {
  const [newFeature, setNewFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    control, 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<EditPlanFormValues>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      interval: plan.interval,
      features: plan.features || []
    }
  });

  const features = watch("features");

  const addFeature = () => {
    if (newFeature.trim() !== "") {
      setValue("features", [...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setValue("features", updatedFeatures);
  };

  const handleFormSubmit = async (data: EditPlanFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(plan.id, {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        interval: data.interval,
        features: data.features
      });
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input 
              id="name" 
              {...register("name")} 
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              {...register("description")}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                {...register("price")}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Controller
                control={control}
                name="interval"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.interval && <p className="text-sm text-red-500">{errors.interval.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <div className="flex gap-2">
              <Input
                id="feature"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
              />
              <Button type="button" onClick={addFeature} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="pl-2">
                    {feature}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="h-5 w-5 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
                  Updating...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
