
import React from "react";
import { PaymentSection } from "./PaymentSection";
import { SubscriptionDuration } from "../subscriptions/SubscriptionDuration";
import { Subscription } from "../../services/memberService";
import { Plan } from "../../types/community.types";

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

  // Don't render anything if no plan selected
  if (!selectedPlan) return null;

  const handlePaymentMethodSelect = (method) => {
    console.log(`[PaymentWrapper] Setting payment method to: ${method}`);
    setSelectedPaymentMethod(method);
  };

  // Log Telegram user data for debugging
  console.log('[PaymentWrapper] Telegram user data:', telegramUser);

  return (
    <>
      {showPaymentMethods && selectedPlan && !showSuccess && (
        <div id="payment-methods">
          <SubscriptionDuration 
            selectedPlan={selectedPlan} 
            activeSubscription={activeSubscription}
          />
        </div>
      )}
      
      {(showPaymentMethods || showSuccess) && selectedPlan && (
        <PaymentSection
          selectedPlan={selectedPlan}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onCompletePurchase={onCompletePurchase}
          communityInviteLink={communityInviteLink}
          showSuccess={showSuccess}
          telegramUserId={telegramUser.id}
          telegramUsername={telegramUser.username}
          firstName={telegramUser.first_name}
          lastName={telegramUser.last_name}
          activeSubscription={activeSubscription}
        />
      )}
    </>
  );
};
