import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/group_owners/components/subscriptions/EditPlanDialog";
import { DeletePlanDialog } from "@/group_owners/components/subscriptions/DeletePlanDialog";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { EmptySubscriptionsState } from "@/group_owners/components/subscriptions/EmptySubscriptionsState";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { motion } from "framer-motion";
import { Loader2, Plus, SparklesIcon, Sparkles } from "lucide-react";

const intervalColors = {
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-green-100 text-green-700",
  "half-yearly": "bg-purple-100 text-purple-700",
  yearly: "bg-orange-100 text-orange-700",
  "one-time": "bg-gray-100 text-gray-700",
  "lifetime": "bg-amber-100 text-amber-700"
};

const intervalLabels = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-yearly": "Half Yearly",
  yearly: "Yearly",
  "one-time": "One Time",
  "lifetime": "Lifetime"
};

const Subscriptions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  
  const entityId = isGroupSelected ? selectedGroupId : selectedCommunityId;
  const { plans, isLoading, createPlan, updatePlan } = useSubscriptionPlans(entityId || "");

  const handleCreatePlan = () => {
    setCreateDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    setEditDialogOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    setSelectedPlanId(planId);
    setDeleteDialogOpen(true);
  };

  const handleSubmitPlan = async (data: any) => {
    await createPlan.mutateAsync({
      ...data,
      community_id: entityId || ""
    });
    setCreateDialogOpen(false);
    toast({
      title: "Plan created",
      description: "Your subscription plan was created successfully."
    });
  };

  const handleUpdatePlan = async (planId: string, data: any) => {
    console.log("[Subscriptions] Updating plan with ID:", planId);
    console.log("[Subscriptions] Update data:", data);
    console.log("[Subscriptions] Current entity ID:", entityId);
    
    try {
      const updateData = {
        ...data,
        id: planId,
        community_id: entityId
      };
      
      await updatePlan.mutateAsync(updateData);
      setEditDialogOpen(false);
      toast({
        title: "Plan updated",
        description: "Your subscription plan was updated successfully."
      });
    } catch (error) {
      console.error("[Subscriptions] Error updating plan:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: `Could not update plan: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container px-0 py-4 max-w-full">
      <div className="space-y-6 px-2 sm:px-6 py-0 my-[6px]">
        <motion.div className="flex items-center justify-between" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg sm:rounded-xl">
              <SparklesIcon className="h-5 w-5 sm:h-8 sm:w-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Subscription Plans <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 inline text-amber-400" />
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your {isGroupSelected ? "group" : "community"} subscription plans
              </p>
            </div>
          </div>
          
          {plans && plans.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleCreatePlan} 
                className="w-8 h-8 sm:w-auto sm:h-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 p-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md" 
                type="button"
              >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Create Plan</span>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {!plans || plans.length === 0 ? (
          <EmptySubscriptionsState onCreatePlan={handleCreatePlan} />
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="grid gap-2 sm:gap-6 lg:gap-8 grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl auto-rows-fr mt-6 sm:mt-16 lg:mt-82 px-1 sm:px-6"
          >
            {plans?.map(plan => (
              <motion.div key={plan.id} variants={itemVariants}>
                <SubscriptionPlanCard 
                  plan={plan} 
                  onEdit={handleEditPlan} 
                  onDelete={handleDeletePlan}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CreatePlanDialog 
        isOpen={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        communityId={entityId || ""}
        onSubmit={handleSubmitPlan}
      />

      {selectedPlanId && (
        <>
          <EditPlanDialog 
            isOpen={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
            plan={plans?.find(p => p.id === selectedPlanId) || null}
            onSubmit={(planId, data) => handleUpdatePlan(planId, data)}
          />
          
          <DeletePlanDialog 
            isOpen={deleteDialogOpen} 
            onOpenChange={setDeleteDialogOpen} 
            planId={selectedPlanId} 
          />
        </>
      )}
    </div>
  );
};

export default Subscriptions;
