
import { useState } from "react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunities } from "@/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, TrashIcon, CheckIcon, EditIcon, SparklesIcon, CrownIcon } from "lucide-react";
import { toast } from "sonner";
import { useCommunityContext } from "@/App";

type IntervalType = "monthly" | "yearly";

const Subscriptions = () => {
  const { data: communities } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as IntervalType,
    features: [] as string[]
  });

  const {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan
  } = useSubscriptionPlans(selectedCommunityId ?? "");

  const handleCreatePlan = async () => {
    if (!selectedCommunityId) {
      toast.error("Please select a community");
      return;
    }
    try {
      await createPlan.mutateAsync({
        community_id: selectedCommunityId,
        name: newPlan.name,
        description: newPlan.description,
        price: parseFloat(newPlan.price),
        interval: newPlan.interval,
        features: newPlan.features
      });
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: "",
        interval: "monthly",
        features: []
      });
      toast.success("Plan created successfully! ✨");
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await deletePlan.mutateAsync(planId);
        toast.success("Plan deleted successfully! 🗑️");
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error("Failed to delete plan");
      }
    }
  };

  const [newFeature, setNewFeature] = useState("");
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setNewPlan(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedCommunityId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-600">Select a community to view subscription plans</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CrownIcon className="h-8 w-8 text-yellow-500" />
            Subscription Plans
          </h1>
          <p className="mt-2 text-gray-600">Manage your community's subscription plans ✨</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div className="group cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-primary hover:bg-primary/5">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <PlusIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Create New Plan</p>
                  <p className="text-sm text-gray-500">Click to add a subscription plan</p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                Create New Subscription Plan
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Fill in the details below to create a new subscription plan for your community.
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Premium Plan" 
                  value={newPlan.name}
                  onChange={e => setNewPlan(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the benefits of this plan..." 
                  value={newPlan.description}
                  onChange={e => setNewPlan(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="0.00" 
                  value={newPlan.price}
                  onChange={e => setNewPlan(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <Select 
                  value={newPlan.interval}
                  onValueChange={(value: IntervalType) => setNewPlan(prev => ({
                    ...prev,
                    interval: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleAddFeature()}
                  />
                  <Button type="button" onClick={handleAddFeature}>Add</Button>
                </div>
                <ul className="mt-2 space-y-2">
                  {newPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="text-sm">{feature}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        className="h-6 w-6"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map(plan => (
          <Card
            key={plan.id}
            className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in group"
            style={{
              background: `linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)`
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary"></div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {plan.name}
                    {plan.interval === "yearly" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Yearly
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">
                      / {plan.interval === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <EditIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {plan.description && (
                <p className="mt-4 text-gray-600">{plan.description}</p>
              )}
              
              {plan.features && plan.features.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 animate-fade-in"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
