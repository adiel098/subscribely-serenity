import React, { useEffect, useState } from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { SuccessScreen } from "./success-screen/SuccessScreen";
import { useStripeConfig } from "../hooks/useStripeConfig";
import { usePaymentProcessing } from "../hooks/payment-processing/usePaymentProcessing";
import { PaymentHeader } from "./payment/PaymentHeader";
import { PaymentOptions } from "./payment/PaymentOptions";
import { toast } from "@/components/ui/use-toast";
import { Subscription } from "../services/memberService";

const TEST_MODE = true;

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  isProcessing?: boolean;
  communityInviteLink?: string | null;
  showSuccess: boolean;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;  
  lastName?: string;
  activeSubscription?: Subscription | null;
  communityId?: string;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  onPaymentStart,
  onPaymentError,
  isProcessing,
  communityInviteLink,
  showSuccess,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  activeSubscription,
  communityId
}: PaymentMethodsProps) => {
  const stripeConfig = useStripeConfig(selectedPlan);
  const { processPayment, isLoading, isSuccess, error, inviteLink, resetState } = usePaymentProcessing({
    communityId: communityId || selectedPlan.community_id,
    planId: selectedPlan.id,
    planPrice: selectedPlan.price,
    planInterval: selectedPlan.interval,
    communityInviteLink,
    telegramUserId,
    telegramUsername,
    firstName,
    lastName,
    onSuccess: onCompletePurchase,
    activeSubscription,
    onStart: onPaymentStart,
    onError: onPaymentError
  });

  useEffect(() => {
    console.log('[PaymentMethods] Payment Method Selected:', selectedPaymentMethod);
    console.log('[PaymentMethods] Community invite link:', communityInviteLink);
    console.log('[PaymentMethods] Selected plan:', selectedPlan);
    console.log('[PaymentMethods] Selected plan price:', selectedPlan.price);
    console.log('[PaymentMethods] Selected plan interval:', selectedPlan.interval);
    console.log('[PaymentMethods] Telegram user ID:', telegramUserId);
    console.log('[PaymentMethods] Telegram username:', telegramUsername);
    console.log('[PaymentMethods] First name:', firstName);
    console.log('[PaymentMethods] Last name:', lastName);
    console.log('[PaymentMethods] Active subscription:', activeSubscription);
  }, [communityInviteLink, selectedPlan, telegramUserId, telegramUsername, firstName, lastName, selectedPaymentMethod, activeSubscription]);

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
      console.log('[PaymentMethods] Plan interval:', selectedPlan.interval);
      console.log('[PaymentMethods] Community invite link:', communityInviteLink);
      console.log('[PaymentMethods] Telegram username:', telegramUsername);
      console.log('[PaymentMethods] First name:', firstName);
      console.log('[PaymentMethods] Last name:', lastName);
      
      if (onPaymentStart) {
        onPaymentStart();
      }
      
      processPayment(selectedPaymentMethod).catch(err => {
        if (onPaymentError) {
          onPaymentError(err.message || 'Payment processing failed');
        }
      });
    } else {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
      });
    }
  };

  const handlePaymentSuccess = () => {
    console.log('[PaymentMethods] Payment success callback triggered');
    onCompletePurchase();
  };

  if (showSuccess) {
    console.log('[PaymentMethods] Showing success screen with invite link:', inviteLink || communityInviteLink);
    return <SuccessScreen communityInviteLink={inviteLink || communityInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
        <PaymentHeader>
          <PaymentOptions
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={(method) => {
              console.log(`[PaymentMethods] Payment method selected: ${method}`);
              onPaymentMethodSelect(method);
            }}
            stripeConfig={stripeConfig}
            communityId={selectedPlan.community_id}
            price={selectedPlan.price}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </PaymentHeader>
      </div>

      {selectedPaymentMethod && selectedPaymentMethod !== 'stripe' && (
        <div className="mt-8">
          {/* Removed PaymentButton */}
        </div>
      )}
    </div>
  );
};
