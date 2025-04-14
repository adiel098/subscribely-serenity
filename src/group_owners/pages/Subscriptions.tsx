import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTitle } from "@/components/ui/alert-title";
import { useToast } from "@/components/ui/use-toast";
import { useProjectContext } from "@/contexts/ProjectContext";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/group_owners/components/subscriptions/EditPlanDialog";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectContext();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    plans,
    isLoading,
    isError,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  } = useSubscriptionPlans(selectedProjectId || undefined);

  useEffect(() => {
    if (!selectedProjectId) {
      navigate("/dashboard");
    }
  }, [selectedProjectId, navigate]);

  const handleCreatePlan = async (data: any) => {
    if (!selectedProjectId) return;
    await createPlan.mutateAsync({
      ...data,
      project_id: selectedProjectId,
      community_id: selectedProjectId, 
    });
    toast({
      title: "Success",
      description: "Subscription plan created successfully.",
    });
    setShowCreateDialog(false);
  };

  const handleUpdatePlan = async (planId: string, data: Partial<SubscriptionPlan>) => {
    await updatePlan.mutateAsync({ 
      id: planId, 
      updates: data 
    });
    toast({
      title: "Success",
      description: "Subscription plan updated successfully.",
    });
    setShowEditDialog(false);
    setEditPlan(null);
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlan.mutateAsync(planId);
    toast({
      title: "Success",
      description: "Subscription plan deleted successfully.",
    });
  };

  const handleToggleStatus = async (planId: string, is_active: boolean) => {
    await togglePlanStatus.mutateAsync({ 
      id: planId, 
      is_active: !is_active 
    });
    toast({
      title: "Success",
      description: "Subscription plan status updated successfully.",
    });
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Subscription Plans</h1>
        <div className="text-muted-foreground mb-4">Loading subscription plans...</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-48" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load subscription plans. {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan as any} // Using any temporarily to fix type mismatch
              onUpdate={handleEditPlan}
              onDelete={handleDeletePlan}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No subscription plans yet"
          description="Create subscription plans to monetize your community"
        />
      )}

      {showCreateDialog && (
        <CreatePlanDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={selectedProjectId || ''}
          onSubmit={handleCreatePlan}
        />
      )}

      {editPlan && (
        <EditPlanDialog
          plan={editPlan}
          isOpen={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleUpdatePlan}
        />
      )}
    </div>
  );
};

export default Subscriptions;
