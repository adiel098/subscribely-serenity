
import React from "react";
import { PaymentSection } from "./PaymentSection";
import { Subscription } from "../../services/memberService";
import { Plan } from "../../types/community.types";
import { toast } from "sonner";

interface PaymentWrapperProps {
  selectedPlan: Plan | null;
  showPaymentMethods: boolean;
  showSuccess: boolean;
  telegramUser: any;
  communityId: string;
  activeSubscription?: Subscription | null;
  communityInviteLink?: string | null;
  onCompletePurchase: () => void;
}

export const PaymentWrapper: React.FC<PaymentWrapperProps> = ({
  selectedPlan,
  showPaymentMethods,
  showSuccess,
  telegramUser,
  communityId,
  activeSubscription,
  communityInviteLink,
  onCompletePurchase
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Don't render anything if no plan selected
  if (!selectedPlan) return null;

  const handlePaymentMethodSelect = (method) => {
    console.log(`[PaymentWrapper] Setting payment method to: ${method}`);
    setSelectedPaymentMethod(method);
  };

  const handlePaymentComplete = () => {
    console.log('[PaymentWrapper] Payment completed successfully');
    toast.success('Payment processed successfully! Your subscription is now active.');
    setIsProcessing(false);
    onCompletePurchase();
  };

  const handlePaymentStart = () => {
    console.log('[PaymentWrapper] Payment process starting');
    setIsProcessing(true);
  };

  const handlePaymentError = (errorMessage) => {
    console.error('[PaymentWrapper] Payment error:', errorMessage);
    toast.error(`Payment failed: ${errorMessage}`);
    setIsProcessing(false);
  };

  // Log Telegram user data for debugging
  console.log('[PaymentWrapper] Telegram user data:', telegramUser);

  return (
    <>
      {(showPaymentMethods || showSuccess) && selectedPlan && (
        <PaymentSection
          selectedPlan={selectedPlan}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onCompletePurchase={handlePaymentComplete}
          onPaymentStart={handlePaymentStart}
          onPaymentError={handlePaymentError}
          isProcessing={isProcessing}
          communityInviteLink={communityInviteLink}
          showSuccess={showSuccess}
          telegramUserId={telegramUser.id}
          telegramUsername={telegramUser.username}
          firstName={telegramUser.first_name}
          lastName={telegramUser.last_name}
          activeSubscription={activeSubscription}
          communityId={communityId}
        />
      )}
    </>
  );
};
