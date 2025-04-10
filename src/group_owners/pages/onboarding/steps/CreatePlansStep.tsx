
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle, Check, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useProjectContext } from "@/contexts/ProjectContext";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";

const CreatePlansStep = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  
  const { 
    plans, 
    isLoading, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    togglePlanStatus 
  } = useSubscriptionPlans(selectedProjectId);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleCreatePlan = async (data: any) => {
    setIsSaving(true);
    try {
      if (!selectedProjectId) {
        throw new Error("No community selected");
      }
      
      await createPlan.mutateAsync({
        ...data,
        project_id: selectedProjectId,
      });
      
      toast({
        title: "Plan created",
        description: "Your subscription plan has been created successfully",
      });
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create subscription plan",
      });
    } finally {
      setIsSaving(false);
      setShowCreateDialog(false);
    }
  };
  
  const handleUpdatePlan = async (planId: string, updatedPlan: Partial<SubscriptionPlan>) => {
    setIsSaving(true);
    try {
      await updatePlan.mutateAsync({
        id: planId,
        updates: updatedPlan,
      });
      
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update subscription plan",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeletePlan = async (planId: string) => {
    setIsSaving(true);
    try {
      await deletePlan.mutateAsync(planId);
      
      toast({
        title: "Plan deleted",
        description: "Your subscription plan has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete subscription plan",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTogglePlanStatus = async (planId: string, is_active: boolean) => {
    setIsSaving(true);
    try {
      await togglePlanStatus.mutateAsync({ 
        id: planId, 
        is_active: !is_active 
      });
      
      toast({
        title: "Plan status updated",
        description: `Subscription plan status has been updated successfully`,
      });
    } catch (error: any) {
      console.error("Error toggling plan status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to toggle subscription plan status",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleContinue = () => {
    navigate("/onboarding/payment-methods");
  };
  
  const hasPlans = plans && plans.length > 0;

  // Create an adapter for the handleUpdatePlan to match SubscriptionPlanCard's expected format
  const handleEditPlan = (plan: SubscriptionPlan) => {
    // This function will be passed to SubscriptionPlanCard's onUpdate prop
    // It will receive the plan object, but we need to adapt it to our handleUpdatePlan
    // which expects a planId and updates object
    return (updatedPlan: Partial<SubscriptionPlan>) => {
      handleUpdatePlan(plan.id, updatedPlan);
    };
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-4xl mx-auto py-12 px-4"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-3 px-4 py-1.5 bg-indigo-50 rounded-full">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-indigo-600">Step 3</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Create Subscription Plans
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Define subscription plans for your community members. You can create
          multiple plans with different features and pricing.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan as any} // Using any temporarily to fix type mismatch
                  onUpdate={(updatedPlan) => handleUpdatePlan(plan.id, updatedPlan)}
                  onDelete={handleDeletePlan}
                  onToggleStatus={handleTogglePlanStatus}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-10 w-10 text-indigo-500" />
                <CardTitle className="text-xl font-semibold">
                  No Subscription Plans Yet
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Get started by creating your first subscription plan.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding/community-details")}
          disabled={isSaving}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => setShowCreateDialog(true)}
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!hasPlans || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                Next
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {showCreateDialog && (
        <CreatePlanDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={selectedProjectId || ''}
          onSubmit={handleCreatePlan}
        />
      )}
    </motion.div>
  );
};

export default CreatePlansStep;
