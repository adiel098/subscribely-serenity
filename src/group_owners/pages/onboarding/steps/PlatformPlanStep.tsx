
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/ui/button";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Zap, ArrowRight, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { OnboardingStep } from "@/group_owners/hooks/useOnboarding";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { PlatformSubscriptionDialog } from "@/group_owners/components/platform-subscription/PlatformSubscriptionDialog";

interface PlatformPlanStepProps {
  goToNextStep: () => void;
  hasPlatformPlan: boolean;
  saveCurrentStep: (step: OnboardingStep) => Promise<void>;
}

export const PlatformPlanStep: React.FC<PlatformPlanStepProps> = ({
  goToNextStep,
  hasPlatformPlan,
  saveCurrentStep
}) => {
  const { plans, isLoading } = usePlatformPlans();
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  
  // Auto check for plan changes after subscription dialog closes
  useEffect(() => {
    if (!isSubscriptionDialogOpen) {
      saveCurrentStep('platform-plan');
    }
  }, [isSubscriptionDialogOpen, saveCurrentStep]);
  
  const formatInterval = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      case 'lifetime': return 'lifetime';
      default: return interval;
    }
  };
  
  return (
    <OnboardingLayout
      currentStep="platform-plan"
      title="Choose Your Platform Plan"
      description="Select a subscription plan that fits your needs"
      icon={<Zap className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : hasPlatformPlan ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 text-green-700">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Platform Plan Selected!</h3>
                <p>You've successfully subscribed to a Membify plan</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-amber-800">
              <p className="font-medium flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Select a plan to unlock all Membify features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.slice(0, 2).map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="border rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 bg-white relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-gray-600 ml-1">/{formatInterval(plan.interval)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsSubscriptionDialogOpen(true);
                    }}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Select Plan
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {hasPlatformPlan ? (
            <Button 
              onClick={goToNextStep}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={() => setIsSubscriptionDialogOpen(true)}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              View All Plans <Zap className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <PlatformSubscriptionDialog
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
      />
    </OnboardingLayout>
  );
};
