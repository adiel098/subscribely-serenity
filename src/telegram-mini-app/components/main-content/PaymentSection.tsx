
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentSection as PaymentSectionComponent } from "@/telegram-mini-app/components/payment/PaymentSection";

interface PaymentSectionWrapperProps {
  selectedPlan: Plan | null;
  selectedPaymentMethod: string | null;
  showSuccess: boolean;
  communityInviteLink: string | null;
  telegramUserId?: string;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
}

export const PaymentSectionWrapper = ({
  selectedPlan,
  selectedPaymentMethod,
  showSuccess,
  communityInviteLink,
  telegramUserId,
  onPaymentMethodSelect,
  onCompletePurchase
}: PaymentSectionWrapperProps) => {
  return (
    <AnimatePresence>
      {selectedPlan && (
        <motion.div
          key="payment-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PaymentSectionComponent
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={onPaymentMethodSelect}
            onCompletePurchase={onCompletePurchase}
            communityInviteLink={communityInviteLink}
            showSuccess={showSuccess}
            telegramUserId={telegramUserId}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
