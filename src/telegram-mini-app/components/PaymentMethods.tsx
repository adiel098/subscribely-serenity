
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SuccessScreen } from "./SuccessScreen";
import { useStripeConfig } from "../hooks/useStripeConfig";
import { usePaymentProcessing } from "../hooks/usePaymentProcessing";
import { PaymentHeader } from "./payment/PaymentHeader";
import { PaymentOptions } from "./payment/PaymentOptions";
import { PaymentButton } from "./payment/PaymentButton";

// For development, set this to true to bypass real payment processing
const TEST_MODE = true;

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink?: string | null;
  showSuccess: boolean;
  telegramUserId?: string;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
  telegramUserId
}: PaymentMethodsProps) => {
  const stripeConfig = useStripeConfig(selectedPlan);
  const { processPayment, isLoading, isSuccess, error, resetState } = usePaymentProcessing({
    communityId: selectedPlan.community_id,
    planId: selectedPlan.id,
    communityInviteLink,
    telegramUserId,
    onSuccess: onCompletePurchase
  });

  const handlePayment = () => {
    if (selectedPaymentMethod) {
      processPayment(selectedPaymentMethod);
    }
  };

  if (showSuccess) {
    return <SuccessScreen communityInviteLink={communityInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12 w-full px-0 mx-0">
      <PaymentHeader />
      
      <PaymentOptions
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={onPaymentMethodSelect}
        stripeConfig={stripeConfig}
      />

      {selectedPaymentMethod && (
        <PaymentButton
          price={selectedPlan.price}
          isProcessing={isLoading}
          onClick={handlePayment}
        />
      )}
    </div>
  );
};
