import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useProjectContext } from "@/contexts/ProjectContext";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/group_owners/components/subscriptions/EditPlanDialog";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { useSubscriptionPlans } from "@/group_owners/hooks/subscription/useSubscriptionPlans";
import { useCreateSubscriptionPlan } from "@/group_owners/hooks/subscription/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "@/group_owners/hooks/subscription/useUpdateSubscriptionPlan";
import { useDeleteSubscriptionPlan } from "@/group_owners/hooks/subscription/useDeleteSubscriptionPlan";
import { useToggleSubscriptionPlanStatus } from "@/group_owners/hooks/subscription/useToggleSubscriptionPlanStatus";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    data: plans,
    isLoading,
    isError,
    error,
  } = useSubscriptionPlans(selectedProjectId || undefined);

  const createPlanMutation = useCreateSubscriptionPlan({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan created successfully.",
      });
      setShowCreateDialog(false);
    },
  });

  const updatePlanMutation = useUpdateSubscriptionPlan({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully.",
      });
      setShowEditDialog(false);
      setEditPlan(null);
    },
  });

  const deletePlanMutation = useDeleteSubscriptionPlan({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully.",
      });
    },
  });

  const toggleStatusMutation = useToggleSubscriptionPlanStatus({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan status updated successfully.",
      });
    },
  });

  useEffect(() => {
    if (!selectedProjectId) {
      navigate("/dashboard");
    }
  }, [selectedProjectId, navigate]);

  const handleCreatePlan = async (data: any) => {
    if (!selectedProjectId) return;
    await createPlanMutation.mutateAsync({
      ...data,
      project_id: selectedProjectId,
    });
  };

  const handleUpdatePlan = async (planId: string, data: Partial<SubscriptionPlan>) => {
    await updatePlanMutation.mutateAsync({
      id: planId,
      updates: data,
    });
  };

  const handleDeletePlan = async (planId: string) => {
    await deletePlanMutation.mutateAsync(planId);
  };

  const handleToggleStatus = async (planId: string, is_active: boolean) => {
    await toggleStatusMutation.mutateAsync({
      id: planId,
      is_active: !is_active,
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
        <p className="text-muted-foreground">Loading subscription plans...</p>
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
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
            Failed to load subscription plans. {error?.message}
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
              plan={plan}
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
          communityId={selectedProjectId || ''}
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
