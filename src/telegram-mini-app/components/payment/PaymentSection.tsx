
import React from "react";
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
  if (!selectedPlan) return null;
  
  return (
    <motion.div 
      id="payment-methods" 
      className="scroll-mt-4 bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg w-full mx-4"
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
