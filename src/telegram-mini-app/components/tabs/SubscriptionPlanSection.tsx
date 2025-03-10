
import React from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No subscription plans available for this community.</p>
      </div>
    );
  }

  return (
    <>
      <div id="subscription-plans" className="scroll-mt-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-6">
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
