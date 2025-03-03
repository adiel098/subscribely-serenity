
import React, { useEffect, useState } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SuccessScreen } from "./SuccessScreen";
import { useStripeConfig } from "../hooks/useStripeConfig";
import { usePaymentProcessing } from "../hooks/usePaymentProcessing";
import { PaymentHeader } from "./payment/PaymentHeader";
import { PaymentOptions } from "./payment/PaymentOptions";
import { PaymentButton } from "./payment/PaymentButton";
import { toast } from "@/components/ui/use-toast";

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
  const { processPayment, isLoading, isSuccess, error, inviteLink, resetState } = usePaymentProcessing({
    communityId: selectedPlan.community_id,
    planId: selectedPlan.id,
    communityInviteLink,
    telegramUserId,
    onSuccess: onCompletePurchase
  });

  // Enhanced logging
  useEffect(() => {
    console.log('🔄 PaymentMethods component (re)rendered');
    console.log('📌 Community invite link in PaymentMethods:', communityInviteLink);
    console.log('📌 Show success state:', showSuccess);
    console.log('📌 Invite link from payment processing:', inviteLink);
    console.log('📌 Telegram user ID:', telegramUserId);
    console.log('📌 Selected plan:', selectedPlan);
  }, [communityInviteLink, showSuccess, inviteLink, telegramUserId, selectedPlan]);

  // Show error toast if payment processing fails
  useEffect(() => {
    if (error) {
      console.error('❌ Payment error:', error);
      toast({
        title: "Payment Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handlePayment = () => {
    if (selectedPaymentMethod) {
      console.log('🔄 Processing payment...');
      console.log('📤 Payment method:', selectedPaymentMethod);
      console.log('📤 Community ID:', selectedPlan.community_id);
      console.log('📤 Plan ID:', selectedPlan.id);
      console.log('📤 Community invite link:', communityInviteLink);
      processPayment(selectedPaymentMethod);
    } else {
      console.warn('⚠️ No payment method selected');
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
      });
    }
  };

  // Determine which invite link to use - prioritize the one from payment processing
  const effectiveInviteLink = inviteLink || communityInviteLink;
  
  useEffect(() => {
    console.log('🔗 Effective invite link in PaymentMethods:', effectiveInviteLink);
  }, [effectiveInviteLink]);

  if (showSuccess) {
    console.log('🎉 Showing success screen with invite link:', effectiveInviteLink);
    // Send both the original community invite link and the possibly updated one from the payment process
    return <SuccessScreen communityInviteLink={effectiveInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12">
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
