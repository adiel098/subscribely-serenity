
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
  // These are dummy handlers since we're not actually using them in this component
  // but they're required by the PaymentMethods component
  const handlePaymentMethodSelect = (method: string) => {
    console.log("Payment method selected:", method);
  };

  const handleCompletePurchase = () => {
    console.log("Purchase completed");
  };

  return (
    <div className="w-full">
      {!showPaymentMethods ? (
        <SubscriptionPlans
          plans={plans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
        />
      ) : (
        <PaymentMethods
          selectedPlan={selectedPlan!}
          selectedPaymentMethod={null}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onCompletePurchase={handleCompletePurchase}
          showSuccess={false}
        />
      )}
    </div>
  );
};
