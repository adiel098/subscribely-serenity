
import React from "react";
import { ChevronDown } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { Subscription } from "@/telegram-mini-app/services/memberService";

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
