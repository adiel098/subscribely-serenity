
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";

interface PaymentSectionProps {
  selectedPlan: Plan | null;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink: string | null;
  showSuccess: boolean;
  telegramUserId?: string;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
  telegramUserId
}) => {
  if (!selectedPlan) return null;
  
  return (
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
  );
};
