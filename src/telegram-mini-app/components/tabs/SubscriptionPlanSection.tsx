
import React from "react";
import { ChevronDown, Sparkles, AlertTriangle } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionPlanSectionProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  showPaymentMethods: boolean;
  userSubscriptions?: Subscription[];
}

export const SubscriptionPlanSection: React.FC<SubscriptionPlanSectionProps> = ({
  plans,
  selectedPlan,
  onPlanSelect,
  showPaymentMethods,
  userSubscriptions = []
}) => {
  // Safe guard against undefined or non-array plans
  const validPlans = Array.isArray(plans) ? plans : [];
  
  if (validPlans.length === 0) {
    return (
      <div className="text-center p-6 max-w-sm mx-auto">
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-800 font-semibold">No subscription plans available</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            This community doesn't have any active subscription plans at the moment. 
            Please check back later or contact the community owner.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div id="subscription-plans" className="scroll-mt-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl mb-5 max-w-sm mx-auto">
          <motion.div 
            className="text-center space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="px-4 py-1.5 text-base font-medium bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
              <Sparkles className="h-4 w-4 mr-1.5 text-purple-500" />
              Choose Your Plan ✨
            </Badge>
            <p className="text-xs text-gray-600">Select the perfect plan for your needs 🚀</p>
          </motion.div>
        </div>
        
        <SubscriptionPlans
          plans={validPlans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
          userSubscriptions={userSubscriptions}
        />
      </div>

      {!selectedPlan && !showPaymentMethods && (
        <div className="flex justify-center py-6 animate-bounce">
          <ChevronDown className="h-5 w-5 text-primary/50" />
        </div>
      )}
    </>
  );
};
