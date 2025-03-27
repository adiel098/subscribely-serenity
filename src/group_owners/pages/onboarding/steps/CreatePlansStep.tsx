
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusIcon, SparklesIcon, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { DeletePlanDialog } from "@/group_owners/components/subscriptions/DeletePlanDialog";
import { EditPlanDialog } from "@/group_owners/components/subscriptions/EditPlanDialog";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { EmptySubscriptionsState } from "@/group_owners/components/subscriptions/EmptySubscriptionsState";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";

// Define interval colors and labels - same as Subscriptions page
const intervalColors = {
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-green-100 text-green-700",
  "half-yearly": "bg-purple-100 text-purple-700",
  yearly: "bg-orange-100 text-amber-800",
  "one-time": "bg-gray-100 text-gray-800",
  "lifetime": "bg-indigo-100 text-indigo-800",
};

const intervalLabels = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-yearly": "Half Yearly",
  yearly: "Yearly",
  "one-time": "One Time",
  "lifetime": "Lifetime"
};

interface CreatePlansStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  saveCurrentStep: (step: string) => void;
}

const CreatePlansStep: React.FC<CreatePlansStepProps> = ({ 
  goToNextStep, 
  goToPreviousStep,
  saveCurrentStep
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch the last created community ID
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setCommunityId(data.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching community:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community information"
        });
        setIsLoading(false);
      }
    };
    
    fetchCommunity();
  }, [user]);

  // Use the subscription plans hook when we have a community ID
  const { plans, isLoading: plansLoading } = useSubscriptionPlans(communityId || "");
  
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

  const handleContinue = async () => {
    // Save current step and proceed to next step
    saveCurrentStep("connect-telegram");
    goToNextStep();
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

  return (
    <OnboardingLayout 
      currentStep="connect-telegram"
      title="Create Subscription Plans"
      description="Define subscription plans for members of your new community"
      icon={<SparklesIcon size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <div className="space-y-6">
        <motion.div 
          className="flex justify-between items-center" 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p className="text-sm text-muted-foreground">
              Create plans to offer to your community members. You can add more plans later.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleCreatePlan}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-5 py-2.5 h-auto" 
              type="button"
              disabled={!communityId || isLoading}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Plan
            </Button>
          </motion.div>
        </motion.div>

        {(isLoading || plansLoading) ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : !plans || plans.length === 0 ? (
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
        
        <div className="pt-6 flex justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              onClick={handleContinue}
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading || plansLoading}
            >
              Continue to Next Step
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </div>

      {communityId && (
        <>
          <CreatePlanDialog 
            isOpen={createDialogOpen} 
            onOpenChange={setCreateDialogOpen} 
          />

          {selectedPlanId && (
            <>
              <EditPlanDialog 
                isOpen={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
                planId={selectedPlanId}
              />
              
              <DeletePlanDialog 
                isOpen={deleteDialogOpen} 
                onOpenChange={setDeleteDialogOpen} 
                planId={selectedPlanId} 
              />
            </>
          )}
        </>
      )}
    </OnboardingLayout>
  );
};

export default CreatePlansStep;
