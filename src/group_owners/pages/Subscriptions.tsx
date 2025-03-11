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
import { Loader2, Plus, SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

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
  const { selectedCommunityId } = useCommunityContext();
  const { plans, isLoading } = useSubscriptionPlans(selectedCommunityId || "");

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

  if (!plans || plans.length === 0) {
    return <EmptySubscriptionsState onCreatePlan={handleCreatePlan} />;
  }

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  return (
    <div className="space-y-6 py-6">
      <motion.div 
        className="flex justify-between items-center" 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your community subscription plans
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleCreatePlan} 
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-5 py-2.5 h-auto" 
            type="button"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Plan
          </Button>
        </motion.div>
      </motion.div>

      {plans.length === 0 ? (
        <EmptySubscriptionsState onCreatePlan={handleCreatePlan} />
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl"
        >
          {plans?.map(plan => (
            <motion.div key={plan.id} variants={itemVariants}>
              <SubscriptionPlanCard 
                plan={plan} 
                onEdit={handleEditPlan} 
                onDelete={handleDeletePlan} 
                intervalColors={intervalColors} 
                intervalLabels={intervalLabels} 
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreatePlanDialog isOpen={createDialogOpen} onOpenChange={setCreateDialogOpen} />

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
