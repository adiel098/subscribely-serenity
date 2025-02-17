
import { useState, useEffect } from "react";
import { SparklesIcon, CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/features/community/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/features/community/components/ui/dialog";
import { Input } from "@/features/community/components/ui/input";
import { Label } from "@/features/community/components/ui/label";
import { Textarea } from "@/features/community/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/community/components/ui/select";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";
import { useCommunities } from "@/hooks/community/useCommunities";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editPlanData: {
    id: string;
    name: string;
    description: string;
    price: string;
    interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
    features: string[];
  };
}

export const EditPlanDialog = ({ isOpen, onOpenChange, editPlanData }: Props) => {
  const { data: communities } = useCommunities();
  const community = communities?.[0];
  const { updatePlan } = useSubscriptionPlans(community?.id || "");

  const [planData, setPlanData] = useState(editPlanData);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    setPlanData(editPlanData);
  }, [editPlanData]);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setPlanData({
        ...planData,
        features: [...planData.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setPlanData({
      ...planData,
      features: planData.features.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePlan = async () => {
    if (!community?.id) return;
    
    try {
      await updatePlan.mutateAsync({
        id: editPlanData.id,
        name: planData.name,
        description: planData.description,
        price: Number(planData.price),
        interval: planData.interval,
        features: planData.features
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] p-6 bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
            Edit Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Modify the subscription plan details and features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none h-32 -mt-10" />
          <div className="grid gap-2">
            <Label htmlFor="edit-name" className="text-base">Plan Name</Label>
            <Input 
              id="edit-name" 
              value={planData.name}
              onChange={e => setPlanData({ ...planData, name: e.target.value })}
              className="text-lg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description" className="text-base">Description</Label>
            <Textarea 
              id="edit-description" 
              value={planData.description}
              onChange={e => setPlanData({ ...planData, description: e.target.value })}
              className="min-h-[100px] text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-price" className="text-base">Price</Label>
              <Input 
                id="edit-price" 
                type="number" 
                value={planData.price}
                onChange={e => setPlanData({ ...planData, price: e.target.value })}
                className="text-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-interval" className="text-base">Billing Interval</Label>
              <Select 
                value={planData.interval}
                onValueChange={(value: any) => setPlanData({ ...planData, interval: value })}
              >
                <SelectTrigger id="edit-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4">
            <Label className="text-base">Features</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleAddFeature()}
              />
              <Button onClick={handleAddFeature}>Add</Button>
            </div>
            <ul className="space-y-2">
              {planData.features.map((feature, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:bg-red-50 hover:text-red-500"
                  >
                    <PlusIcon className="h-4 w-4 rotate-45" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePlan}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90"
            disabled={!planData.name || !planData.price || updatePlan.isPending}
          >
            <SparklesIcon className="h-4 w-4" />
            {updatePlan.isPending ? "Updating..." : "Update Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
