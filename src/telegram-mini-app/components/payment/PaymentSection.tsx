
import React, { useEffect } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentMethods } from "@/telegram-mini-app/components/PaymentMethods";
import { motion } from "framer-motion";
import { Subscription } from "@/telegram-mini-app/services/memberService";

interface PaymentSectionProps {
  selectedPlan: Plan | null;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  isProcessing?: boolean;
  communityInviteLink: string | null;
  communityId: string;
  showSuccess: boolean;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  activeSubscription?: Subscription | null;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  onPaymentStart,
  onPaymentError,
  isProcessing = false,
  communityInviteLink,
  communityId,
  showSuccess,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  activeSubscription
}) => {
  // Enhanced logging for debugging
  useEffect(() => {
    console.log('[PaymentSection] Rendering with props:');
    console.log('[PaymentSection] Selected payment method:', selectedPaymentMethod);
    console.log('[PaymentSection] Community invite link:', communityInviteLink);
    console.log('[PaymentSection] Community ID:', communityId);
    console.log('[PaymentSection] Selected plan:', selectedPlan);
    if (selectedPlan) {
      console.log('[PaymentSection] Selected plan price:', selectedPlan.price);
      console.log('[PaymentSection] Selected plan interval:', selectedPlan.interval);
    }
    console.log('[PaymentSection] Show success:', showSuccess);
    console.log('[PaymentSection] Telegram user ID:', telegramUserId);
    console.log('[PaymentSection] Telegram username:', telegramUsername);
    console.log('[PaymentSection] First name:', firstName);
    console.log('[PaymentSection] Last name:', lastName);
    console.log('[PaymentSection] Active subscription:', activeSubscription);
    console.log('[PaymentSection] Processing state:', isProcessing);
  }, [communityInviteLink, selectedPlan, showSuccess, telegramUserId, telegramUsername, firstName, lastName, activeSubscription, isProcessing, communityId]);
  
  if (!selectedPlan) return null;
  
  const handlePaymentMethodSelect = (method: string) => {
    console.log(`[PaymentSection] Payment method selected: ${method}`);
    onPaymentMethodSelect(method);
  };
  
  return (
    <motion.div 
      id="payment-methods" 
      className="scroll-mt-4 mt-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PaymentMethods
        selectedPlan={selectedPlan}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        onCompletePurchase={onCompletePurchase}
        onPaymentStart={onPaymentStart}
        onPaymentError={onPaymentError}
        isProcessing={isProcessing}
        communityInviteLink={communityInviteLink}
        communityId={communityId}
        showSuccess={showSuccess}
        telegramUserId={telegramUserId}
        telegramUsername={telegramUsername}
        firstName={firstName}
        lastName={lastName}
        activeSubscription={activeSubscription}
      />
    </motion.div>
  );
};
