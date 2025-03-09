
import React, { useState, useEffect } from "react";
import { PaymentMethods } from "./PaymentMethods";
import { Plan } from "../types/community.types";
import { useTelegramUser } from "../hooks/useTelegramUser";

interface SubscriptionCheckoutProps {
  selectedPlan: Plan;
  onCompletePurchase: () => void;
  onCancel: () => void;
  communityInviteLink?: string | null;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  selectedPlan,
  onCompletePurchase,
  onCancel,
  communityInviteLink,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const telegramUser = useTelegramUser();

  useEffect(() => {
    console.log("SubscriptionCheckout - Selected plan:", selectedPlan);
    console.log("SubscriptionCheckout - Community invite link:", communityInviteLink);
    console.log("SubscriptionCheckout - Telegram user:", telegramUser);
  }, [selectedPlan, communityInviteLink, telegramUser]);

  const handlePaymentMethodSelect = (method: string) => {
    console.log("Selected payment method:", method);
    setSelectedPaymentMethod(method);
  };

  const handleCompletePurchase = () => {
    console.log("Purchase completed!");
    setShowSuccess(true);
    onCompletePurchase();
  };

  if (!selectedPlan) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground h-full w-full pb-20">
      <PaymentMethods
        selectedPlan={selectedPlan}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        onCompletePurchase={handleCompletePurchase}
        communityInviteLink={communityInviteLink}
        showSuccess={showSuccess}
        telegramUserId={telegramUser?.id}
        telegramUsername={telegramUser?.username}
        firstName={telegramUser?.firstName}
        lastName={telegramUser?.lastName}
      />
    </div>
  );
};
