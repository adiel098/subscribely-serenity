
import React from "react";
import { ChevronDown } from "lucide-react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SubscriptionPlans } from "@/telegram-mini-app/components/SubscriptionPlans";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";

interface SubscribeTabContentProps {
  communityInviteLink?: string | null;
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  showSuccess: boolean;
  onCompletePurchase: () => void;
  telegramUserId?: string;
}

export const SubscribeTabContent: React.FC<SubscribeTabContentProps> = ({
  communityInviteLink,
  plans,
  selectedPlan,
  onPlanSelect,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  showSuccess,
  onCompletePurchase,
  telegramUserId
}) => {
  return (
    <div className="space-y-8 mt-0">
      <div id="subscription-plans" className="scroll-mt-4">
        <SubscriptionPlans
          plans={plans}
          selectedPlan={selectedPlan}
          onPlanSelect={onPlanSelect}
        />
      </div>

      {selectedPlan && (
        <div id="payment-methods" className="scroll-mt-4">
          <PaymentMethods
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={onPaymentMethodSelect}
            onCompletePurchase={onCompletePurchase}
            communityInviteLink={communityInviteLink}
            showSuccess={showSuccess}
            telegramUserId={telegramUserId}
          />
        </div>
      )}

      {!selectedPlan && (
        <div className="flex justify-center py-8 animate-bounce">
          <ChevronDown className="h-6 w-6 text-primary/50" />
        </div>
      )}
    </div>
  );
};
