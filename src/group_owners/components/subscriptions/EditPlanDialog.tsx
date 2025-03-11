
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
import { PlanFeatureList } from "./PlanFeatureList";
import { motion } from "framer-motion";

interface EditPlanData {
  id: string;
  name: string;
  description: string;
  price: string;
  interval: string;
  features: string[];
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editPlanData: EditPlanData;
  isGroupMode?: boolean;
}

export const EditPlanDialog = ({ isOpen, onOpenChange, editPlanData, isGroupMode = false }: Props) => {
  const { selectedCommunityId, selectedGroupId } = useCommunityContext();
  const entityId = isGroupMode ? selectedGroupId : selectedCommunityId;
  const { updatePlan } = useSubscriptionPlans(entityId || "");

  const [editedPlan, setEditedPlan] = useState<EditPlanData>(editPlanData);
  const [newFeature, setNewFeature] = useState("");

  // Update local state when editPlanData changes
  if (editPlanData.id !== editedPlan.id && isOpen) {
    setEditedPlan(editPlanData);
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setEditedPlan({
        ...editedPlan,
        features: [...editedPlan.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setEditedPlan({
      ...editedPlan,
      features: editedPlan.features.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePlan = async () => {
    if (!entityId) return;
    
    try {
      await updatePlan.mutateAsync({
        id: editedPlan.id,
        name: editedPlan.name,
        description: editedPlan.description,
        price: Number(editedPlan.price),
        interval: editedPlan.interval,
        features: editedPlan.features
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] p-6 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            Edit Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            Update your {isGroupMode ? "group" : "community"} subscription plan details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-base font-medium">Plan Name</Label>
            <Input 
              id="name" 
              value={editedPlan.name}
              onChange={e => setEditedPlan({ ...editedPlan, name: e.target.value })}
              className="text-lg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-base font-medium">Description</Label>
            <Textarea 
              id="description" 
              value={editedPlan.description}
              onChange={e => setEditedPlan({ ...editedPlan, description: e.target.value })}
              className="min-h-[100px] text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-base font-medium">Price</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                <Input 
                  id="price" 
                  type="number" 
                  value={editedPlan.price}
                  onChange={e => setEditedPlan({ ...editedPlan, price: e.target.value })}
                  className="text-lg pl-8"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval" className="text-base font-medium">Billing Interval</Label>
              <Select 
                value={editedPlan.interval}
                onValueChange={(value) => setEditedPlan({ ...editedPlan, interval: value })}
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
                  <SelectItem value="lifetime">Lifetime</SelectItem>
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
              />
              <Button 
                onClick={handleAddFeature}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {editedPlan.features.length > 0 && (
              <PlanFeatureList 
                features={editedPlan.features} 
                onRemoveFeature={handleRemoveFeature}
                isEditable={true}
              />
            )}
          </div>
        </div>
        <DialogFooter className="gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePlan} 
            className="gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md"
            disabled={!editedPlan.name || !editedPlan.price || updatePlan.isPending}
          >
            <CheckIcon className="h-4 w-4" />
            {updatePlan.isPending ? "Updating..." : "Update Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
