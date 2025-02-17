
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CreatePlanDialog } from "@/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/components/subscriptions/EditPlanDialog";
import { DeletePlanDialog } from "@/components/subscriptions/DeletePlanDialog";
import { SubscriptionPlanCard } from "@/components/subscriptions/SubscriptionPlanCard";
import { useSubscriptionPlans } from "@/hooks/community/useSubscriptionPlans";
import { useCommunityContext } from '@/features/community/providers/CommunityContext';
import { Loader2, Plus } from "lucide-react";

const intervalColors = {
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-green-100 text-green-700",
  "half-yearly": "bg-purple-100 text-purple-700",
  yearly: "bg-orange-100 text-orange-700",
  "one-time": "bg-gray-100 text-gray-700",
};

const intervalLabels = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-yearly": "Half Yearly",
  yearly: "Yearly",
  "one-time": "One Time",
};

const Subscriptions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();

  const {
    plans,
    isLoading,
  } = useSubscriptionPlans(selectedCommunityId || "");

  const handleCreatePlan = () => {
    setCreateDialogOpen(true);
  };

  const handleEditPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setEditDialogOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    setSelectedPlanId(planId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (!plans) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">No plans found</p>
      </div>
    );
  }

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your community subscription plans
          </p>
        </div>
        <div>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => handleEditPlan(plan.id)}
            onDelete={handleDeletePlan}
            intervalColors={intervalColors}
            intervalLabels={intervalLabels}
          />
        ))}
      </div>

      <CreatePlanDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedPlan && (
        <EditPlanDialog
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editPlanData={{
            id: selectedPlan.id,
            name: selectedPlan.name,
            description: selectedPlan.description || "",
            price: selectedPlan.price.toString(),
            interval: selectedPlan.interval,
            features: selectedPlan.features
          }}
        />
      )}
      
      {selectedPlanId && (
        <DeletePlanDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          planId={selectedPlanId}
        />
      )}
    </div>
  );
};

export default Subscriptions;
