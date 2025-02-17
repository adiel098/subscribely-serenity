
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";

type Interval = "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time";

interface CreatePlanFormData {
  name: string;
  description?: string;
  price: string;
  interval: Interval;
  features: string[];
}

interface CreatePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange }: CreatePlanDialogProps) => {
  const { selectedCommunityId } = useCommunityContext();
  const { createPlan } = useSubscriptionPlans(selectedCommunityId || "");
  const { register, handleSubmit, reset } = useForm<CreatePlanFormData>();
  const [selectedInterval, setSelectedInterval] = useState<Interval>("monthly");

  const onSubmit = async (data: CreatePlanFormData) => {
    if (!selectedCommunityId) return;

    try {
      await createPlan.mutateAsync({
        community_id: selectedCommunityId,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        interval: selectedInterval,
        features: []
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subscription Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input 
              id="price" 
              type="number" 
              step="0.01" 
              {...register("price", { required: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Billing Interval</Label>
            <Select value={selectedInterval} onValueChange={(value: Interval) => setSelectedInterval(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="half-yearly">Half Yearly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
