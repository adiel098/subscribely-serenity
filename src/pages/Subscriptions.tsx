
import { useState } from "react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { PlusIcon, CrownIcon, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useCommunityContext } from "@/App";
import { SubscriptionPlanCard } from "@/components/subscriptions/SubscriptionPlanCard";
import { CreatePlanDialog } from "@/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/components/subscriptions/EditPlanDialog";
import { DeletePlanDialog } from "@/components/subscriptions/DeletePlanDialog";

type IntervalType = "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time";

const intervalColors = {
  monthly: "from-blue-50 to-blue-100 border-blue-200",
  quarterly: "from-green-50 to-green-100 border-green-200",
  "half-yearly": "from-purple-50 to-purple-100 border-purple-200",
  yearly: "from-orange-50 to-orange-100 border-orange-200",
  "one-time": "from-pink-50 to-pink-100 border-pink-200"
};

const intervalLabels = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-yearly": "Half-Yearly",
  yearly: "Yearly",
  "one-time": "One-Time"
};

const Subscriptions = () => {
  const { selectedCommunityId } = useCommunityContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPlanData, setEditPlanData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as IntervalType,
    features: [] as string[]
  });
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly" as IntervalType,
    features: [] as string[]
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [editFeature, setEditFeature] = useState("");

  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useSubscriptionPlans(selectedCommunityId ?? "");

  const handleEditClick = (plan: any) => {
    setEditingPlan(plan.id);
    setEditPlanData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      interval: plan.interval,
      features: plan.features || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !selectedCommunityId) return;

    try {
      await updatePlan.mutateAsync({
        id: editingPlan,
        name: editPlanData.name,
        description: editPlanData.description,
        price: parseFloat(editPlanData.price),
        interval: editPlanData.interval,
        features: editPlanData.features
      });

      setIsEditDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleAddEditFeature = () => {
    if (editFeature.trim()) {
      setEditPlanData(prev => ({
        ...prev,
        features: [...prev.features, editFeature.trim()]
      }));
      setEditFeature("");
    }
  };

  const handleRemoveEditFeature = (index: number) => {
    setEditPlanData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

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
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      try {
        await deletePlan.mutateAsync(planToDelete);
        setIsDeleteDialogOpen(false);
        setPlanToDelete(null);
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

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

  const copyMiniAppLink = async () => {
    if (!selectedCommunityId) return;
    
    // עדכון ללינק הישיר של המיני אפליקציה במקום לשלוח קוד
    const miniAppUrl = `https://t.me/MembifyBot/app?startapp=${selectedCommunityId}`;
    try {
      await navigator.clipboard.writeText(miniAppUrl);
      toast.success("Mini App link copied to clipboard! 🔗");
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error("Failed to copy link");
    }
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
        <div className="text-center space-y-4">
          <CrownIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Select a community to view subscription plans</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl p-8 space-y-12 bg-white min-h-screen mx-0 px-[15px]">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <CrownIcon className="h-10 w-10 text-yellow-500" />
            Subscription Plans
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create and manage subscription plans for your community members ✨
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={copyMiniAppLink}
          >
            <Link2 className="h-4 w-4" />
            Copy Mini App Link
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Plan
              </Button>
            </DialogTrigger>
            <CreatePlanDialog 
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              newPlan={newPlan}
              setNewPlan={setNewPlan}
              newFeature={newFeature}
              setNewFeature={setNewFeature}
              handleAddFeature={handleAddFeature}
              handleRemoveFeature={handleRemoveFeature}
              handleCreatePlan={handleCreatePlan}
            />
          </Dialog>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {plans?.map((plan, index) => (
          <AlertDialog key={plan.id} open={isDeleteDialogOpen && planToDelete === plan.id}>
            <SubscriptionPlanCard
              plan={plan}
              intervalColors={intervalColors}
              intervalLabels={intervalLabels}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
            <DeletePlanDialog
              isOpen={isDeleteDialogOpen && planToDelete === plan.id}
              onOpenChange={setIsDeleteDialogOpen}
              onConfirm={handleConfirmDelete}
            />
          </AlertDialog>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <EditPlanDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editPlanData={editPlanData}
          setEditPlanData={setEditPlanData}
          editFeature={editFeature}
          setEditFeature={setEditFeature}
          handleAddEditFeature={handleAddEditFeature}
          handleRemoveEditFeature={handleRemoveEditFeature}
          handleUpdatePlan={handleUpdatePlan}
        />
      </Dialog>
    </div>
  );
};

export default Subscriptions;
