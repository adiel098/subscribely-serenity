
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, SparklesIcon, Zap } from "lucide-react";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { PlanFeatureList } from "./PlanFeatureList";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isGroupMode?: boolean;
}

export const CreatePlanDialog = ({ isOpen, onOpenChange, isGroupMode = false }: Props) => {
  const { selectedCommunityId, selectedGroupId } = useCommunityContext();
  const entityId = isGroupMode ? selectedGroupId : selectedCommunityId;
  const { createPlan } = useSubscriptionPlans(entityId || "");
  const isMobile = useIsMobile();

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
    if (!entityId) return;
    
    try {
      await createPlan.mutateAsync({
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
      <DialogContent className={`${isMobile ? 'max-w-[95%]' : 'sm:max-w-[525px]'} p-4 sm:p-6 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100 shadow-lg`}>
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 animate-pulse" />
            Create New Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Design a new subscription plan to offer exclusive benefits to your {isGroupMode ? "group" : "community"} members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none h-32 -mt-10" />
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm sm:text-base font-medium">Plan Name</Label>
            <Input 
              id="name" 
              placeholder='e.g. "Premium Plan"' 
              value={newPlan.name}
              onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
              className="text-base sm:text-lg border-indigo-100 focus:border-indigo-300 shadow-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm sm:text-base font-medium">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the exclusive benefits of this plan..." 
              value={newPlan.description}
              onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-indigo-100 focus:border-indigo-300 shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm sm:text-base font-medium">Price</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="0.00" 
                  value={newPlan.price}
                  onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                  className="text-base sm:text-lg pl-8 border-indigo-100 focus:border-indigo-300 shadow-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval" className="text-sm sm:text-base font-medium">Billing Interval</Label>
              <Select 
                value={newPlan.interval}
                onValueChange={(value: any) => setNewPlan({ ...newPlan, interval: value })}
              >
                <SelectTrigger id="interval" className="border-indigo-100 focus:border-indigo-300 shadow-sm">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-Time</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4">
            <Label className="text-sm sm:text-base font-medium">Features</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleAddFeature()}
                className="border-indigo-100 focus:border-indigo-300 shadow-sm"
              />
              <Button 
                onClick={handleAddFeature}
                className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {newPlan.features.length > 0 && (
              <PlanFeatureList 
                features={newPlan.features} 
                onRemoveFeature={handleRemoveFeature}
                isEditable={true}
              />
            )}
          </div>
        </div>
        <DialogFooter className={`gap-3 pt-6 ${isMobile ? 'flex-col' : ''}`}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
          >
            Cancel
          </Button>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={isMobile ? "w-full" : ""}
          >
            <Button 
              onClick={handleCreatePlan} 
              className={`gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md ${isMobile ? "w-full" : ""}`}
              disabled={!newPlan.name || !newPlan.price || createPlan.isPending || !entityId}
            >
              <Zap className="h-4 w-4" />
              {createPlan.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
