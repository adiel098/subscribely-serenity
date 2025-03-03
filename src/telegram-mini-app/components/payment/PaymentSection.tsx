
import React, { useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";
import { motion } from "framer-motion";

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
  // Enhanced logging for debugging
  useEffect(() => {
    console.log('Community invite link in PaymentSection:', communityInviteLink);
    console.log('Selected plan in PaymentSection:', selectedPlan);
    console.log('Show success in PaymentSection:', showSuccess);
    console.log('Telegram user ID in PaymentSection:', telegramUserId);
  }, [communityInviteLink, selectedPlan, showSuccess, telegramUserId]);
  
  if (!selectedPlan) return null;
  
  return (
    <motion.div 
      id="payment-methods" 
      className="scroll-mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PaymentMethods
        selectedPlan={selectedPlan}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={onPaymentMethodSelect}
        onCompletePurchase={onCompletePurchase}
        communityInviteLink={communityInviteLink}
        showSuccess={showSuccess}
        telegramUserId={telegramUserId}
      />
    </motion.div>
  );
};
