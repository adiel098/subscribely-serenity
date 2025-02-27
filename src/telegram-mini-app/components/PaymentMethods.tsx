
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PaymentHeader } from "@/telegram-mini-app/components/payment/PaymentHeader";
import { PaymentOptions } from "@/telegram-mini-app/components/payment/PaymentOptions";
import { SuccessScreen } from "@/telegram-mini-app/components/SuccessScreen";
import { usePaymentProcessing } from "@/telegram-mini-app/hooks/usePaymentProcessing";
import { createMember } from "@/telegram-mini-app/services/memberService";
import { createPayment } from "@/telegram-mini-app/services/paymentService";
import { Plan } from "@/telegram-mini-app/types/community.types";

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink: string | null | undefined;
  showSuccess: boolean;
  telegramUserId?: string;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
  telegramUserId
}) => {
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { processPayment, paymentState } = usePaymentProcessing();

  const handleCompletePurchase = async () => {
    if (!selectedPaymentMethod) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select a payment method to continue.",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);

      console.log("💰 Processing payment with method:", selectedPaymentMethod);
      console.log("💰 Plan:", selectedPlan);
      console.log("💰 Telegram User ID:", telegramUserId || "Not available");

      // Create payment record
      const paymentData = {
        plan_id: selectedPlan.id,
        community_id: selectedPlan.community_id,
        amount: selectedPlan.price,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        invite_link: communityInviteLink || '',
        telegram_user_id: telegramUserId  // Include Telegram user ID in payment data
      };

      const paymentResult = await createPayment(paymentData);
      console.log("💰 Payment created:", paymentResult);

      // If the telegramUserId is available, create a member record
      if (telegramUserId) {
        const memberData = {
          telegram_id: telegramUserId,
          community_id: selectedPlan.community_id,
          subscription_plan_id: selectedPlan.id,
          status: 'active'
        };

        const memberResult = await createMember(memberData);
        console.log("👤 Member created:", memberResult);
      } else {
        console.warn("⚠️ No telegramUserId available, skipping member creation");
      }

      // Process the payment
      await processPayment({
        amount: selectedPlan.price,
        paymentMethod: selectedPaymentMethod,
      });

      onCompletePurchase();
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        inviteLink={paymentState.paymentInviteLink || communityInviteLink}
      />
    );
  }

  return (
    <div className="space-y-6" id="payment-methods">
      <PaymentHeader selectedPlan={selectedPlan} />
      
      <PaymentOptions
        selectedMethod={selectedPaymentMethod}
        onMethodSelect={onPaymentMethodSelect}
      />
      
      <Button
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-6 rounded-lg font-medium"
        onClick={handleCompletePurchase}
        disabled={!selectedPaymentMethod || isProcessingPayment}
      >
        {isProcessingPayment ? 'Processing...' : 'Complete Purchase'}
      </Button>
    </div>
  );
};
