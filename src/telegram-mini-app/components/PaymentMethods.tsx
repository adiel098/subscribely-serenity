
import React, { useEffect, useState } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SuccessScreen } from "./success-screen/SuccessScreen";
import { useStripeConfig } from "../hooks/useStripeConfig";
import { usePaymentProcessing } from "../hooks/payment-processing/usePaymentProcessing";
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
  telegramUsername?: string;
  firstName?: string;  
  lastName?: string;   
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName
}: PaymentMethodsProps) => {
  const stripeConfig = useStripeConfig(selectedPlan);
  const { processPayment, isLoading, isSuccess, error, inviteLink, resetState } = usePaymentProcessing({
    communityId: selectedPlan.community_id,
    planId: selectedPlan.id,
    planPrice: selectedPlan.price, 
    communityInviteLink,
    telegramUserId,
    telegramUsername,
    onSuccess: onCompletePurchase
  });

  // Log community invite link for debugging
  useEffect(() => {
    console.log('[PaymentMethods] Community invite link:', communityInviteLink);
    console.log('[PaymentMethods] Selected plan:', selectedPlan);
    console.log('[PaymentMethods] Selected plan price:', selectedPlan.price);
    console.log('[PaymentMethods] Telegram user ID:', telegramUserId);
    console.log('[PaymentMethods] Telegram username:', telegramUsername);
    console.log('[PaymentMethods] First name:', firstName);
    console.log('[PaymentMethods] Last name:', lastName);
  }, [communityInviteLink, selectedPlan, telegramUserId, telegramUsername, firstName, lastName]);

  // Show error toast if payment processing fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Payment Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handlePayment = () => {
    if (selectedPaymentMethod) {
      console.log('[PaymentMethods] Processing payment with method:', selectedPaymentMethod);
      console.log('[PaymentMethods] Community ID:', selectedPlan.community_id);
      console.log('[PaymentMethods] Plan ID:', selectedPlan.id);
      console.log('[PaymentMethods] Plan price:', selectedPlan.price);
      console.log('[PaymentMethods] Community invite link:', communityInviteLink);
      console.log('[PaymentMethods] Telegram username:', telegramUsername);
      console.log('[PaymentMethods] First name:', firstName);
      console.log('[PaymentMethods] Last name:', lastName);
      processPayment(selectedPaymentMethod);
    } else {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
      });
    }
  };

  const handlePaymentSuccess = () => {
    onCompletePurchase();
  };

  if (showSuccess) {
    console.log('[PaymentMethods] Showing success screen with invite link:', inviteLink || communityInviteLink);
    // Send both the original community invite link and the possibly updated one from the payment process
    return <SuccessScreen communityInviteLink={inviteLink || communityInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12">
      <PaymentHeader />
      
      <PaymentOptions
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={onPaymentMethodSelect}
        stripeConfig={stripeConfig}
        communityId={selectedPlan.community_id}
        price={selectedPlan.price}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {selectedPaymentMethod && selectedPaymentMethod !== 'stripe' && (
        <PaymentButton
          price={selectedPlan.price}
          isProcessing={isLoading}
          onClick={handlePayment}
        />
      )}
    </div>
  );
};
