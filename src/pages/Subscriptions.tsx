
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePlanDialog } from "@/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/components/subscriptions/EditPlanDialog";
import { DeletePlanDialog } from "@/components/subscriptions/DeletePlanDialog";
import { SubscriptionPlanCard } from "@/components/subscriptions/SubscriptionPlanCard";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunities } from "@/hooks/useCommunities";
import { Loader2, Plus, Copy } from "lucide-react";

const Subscriptions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    subscriptionPlans,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useSubscriptionPlans();

  const {
    communities,
    isLoading: isLoadingCommunities,
    error: communitiesError,
  } = useCommunities();

  const community = communities?.[0];

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

  const copyMiniAppLink = () => {
    if (community) {
      // שימוש ב-start במקום startapp כדי שהבוט יקבל את ההודעה
      const miniAppUrl = `https://t.me/membifybot?start=${community.id}`;
      navigator.clipboard.writeText(miniAppUrl);
      toast({
        title: "Link Copied!",
        description: "The mini app link has been copied to your clipboard.",
      });
    }
  };

  if (isLoadingPlans || isLoadingCommunities) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (plansError || communitiesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading data</p>
      </div>
    );
  }

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
        <div className="flex gap-2">
          <Button onClick={copyMiniAppLink} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Mini App Link
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Display subscription plans */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptionPlans?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => handleEditPlan(plan.id)}
            onDelete={() => handleDeletePlan(plan.id)}
          />
        ))}
      </div>

      {/* Dialogs */}
      <CreatePlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedPlanId && (
        <>
          <EditPlanDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            planId={selectedPlanId}
          />
          <DeletePlanDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            planId={selectedPlanId}
          />
        </>
      )}
    </div>
  );
};

export default Subscriptions;

