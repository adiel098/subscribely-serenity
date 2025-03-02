
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "../SubscriptionPlans";
import { PaymentMethods } from "../PaymentMethods";

interface SubscriptionPlanSectionProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  showPaymentMethods: boolean;
}

export const SubscriptionPlanSection: React.FC<SubscriptionPlanSectionProps> = ({
  plans,
  selectedPlan,
  onPlanSelect,
  showPaymentMethods,
}) => {
  return (
    <div className="bg-white rounded-lg border border-primary/10 shadow-sm p-4 md:p-6 w-full">
      {!showPaymentMethods ? (
        <SubscriptionPlans
          plans={plans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
        />
      ) : (
        <PaymentMethods plan={selectedPlan!} />
      )}
    </div>
  );
};
