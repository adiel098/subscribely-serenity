
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, SparklesIcon, CheckIcon } from "lucide-react";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange }: Props) => {
  const { selectedCommunityId } = useCommunityContext();
  const { createPlan } = useSubscriptionPlans(selectedCommunityId || "");

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as const,
    features: [] as string[]
  });
  
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setNewPlan({
        ...newPlan,
        features: [...newPlan.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan({
      ...newPlan,
      features: newPlan.features.filter((_, i) => i !== index)
    });
  };

  const handleCreatePlan = async () => {
    if (!selectedCommunityId) return;
    
    try {
      await createPlan.mutateAsync({
        community_id: selectedCommunityId,
        name: newPlan.name,
        description: newPlan.description,
        price: Number(newPlan.price),
        interval: newPlan.interval,
        features: newPlan.features
      });
      
      onOpenChange(false);
      setNewPlan({
        name: "",
        description: "",
        price: "",
        interval: "monthly",
        features: []
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] p-6 bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
            Create New Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Design a new subscription plan to offer exclusive benefits to your community members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none h-32 -mt-10" />
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-base">Plan Name</Label>
            <Input 
              id="name" 
              placeholder='e.g. "Premium Plan"' 
              value={newPlan.name}
              onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
              className="text-lg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-base">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the exclusive benefits of this plan..." 
              value={newPlan.description}
              onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
              className="min-h-[100px] text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-base">Price</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0.00" 
                value={newPlan.price}
                onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                className="text-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval" className="text-base">Billing Interval</Label>
              <Select 
                value={newPlan.interval}
                onValueChange={(value: any) => setNewPlan({ ...newPlan, interval: value })}
              >
                <SelectTrigger id="interval">
                  <SelectValue placeholder="Select interval" />
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
              {newPlan.features.map((feature, index) => (
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
            onClick={handleCreatePlan} 
            className="gap-2 bg-gradient-to-r from-primary to-primary/90"
            disabled={!newPlan.name || !newPlan.price || createPlan.isPending || !selectedCommunityId}
          >
            <SparklesIcon className="h-4 w-4" />
            {createPlan.isPending ? "Creating..." : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
