
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SparklesIcon, Zap } from "lucide-react";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { PlanFeatureList } from "./PlanFeatureList";
import { motion } from "framer-motion";

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
  const { selectedCommunityId } = useCommunityContext();
  const { updatePlan } = useSubscriptionPlans(selectedCommunityId || "");

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
    if (!selectedCommunityId) return;
    
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
      <DialogContent className="sm:max-w-[525px] p-6 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100 shadow-lg">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
            Edit Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            Modify the subscription plan details and features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none h-32 -mt-10" />
          <div className="grid gap-2">
            <Label htmlFor="edit-name" className="text-base font-medium">Plan Name</Label>
            <Input 
              id="edit-name" 
              value={planData.name}
              onChange={e => setPlanData({ ...planData, name: e.target.value })}
              className="text-lg border-indigo-100 focus:border-indigo-300 shadow-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description" className="text-base font-medium">Description</Label>
            <Textarea 
              id="edit-description" 
              value={planData.description}
              onChange={e => setPlanData({ ...planData, description: e.target.value })}
              className="min-h-[100px] text-base border-indigo-100 focus:border-indigo-300 shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-price" className="text-base font-medium">Price</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={planData.price}
                  onChange={e => setPlanData({ ...planData, price: e.target.value })}
                  className="text-lg pl-8 border-indigo-100 focus:border-indigo-300 shadow-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-interval" className="text-base font-medium">Billing Interval</Label>
              <Select 
                value={planData.interval}
                onValueChange={(value: any) => setPlanData({ ...planData, interval: value })}
              >
                <SelectTrigger id="edit-interval" className="border-indigo-100 focus:border-indigo-300 shadow-sm">
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
            <Label className="text-base font-medium">Features</Label>
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
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <span className="mr-1">+</span> Add
              </Button>
            </div>
            
            <PlanFeatureList 
              features={planData.features} 
              onRemoveFeature={handleRemoveFeature}
              isEditable={true}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={handleUpdatePlan}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md"
              disabled={!planData.name || !planData.price || updatePlan.isPending}
            >
              <Zap className="h-4 w-4" />
              {updatePlan.isPending ? "Updating..." : "Update Plan"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
