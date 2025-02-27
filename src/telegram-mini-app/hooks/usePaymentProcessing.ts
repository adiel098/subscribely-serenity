
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { PaymentState } from "../types/payment.types";
import { createOrUpdateMember } from "../services/memberService";
import { createPayment, createInviteLink } from "../services/paymentService";

export const usePaymentProcessing = (
  selectedPlan: Plan,
  selectedPaymentMethod: string | null,
  onCompletePurchase: () => void,
  telegramUserId?: string
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInviteLink, setPaymentInviteLink] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a payment method"
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Create invite link first
      const newInviteLink = await createInviteLink(selectedPlan.community_id);

      // Create payment data with Telegram user ID if available
      const paymentData = {
        plan_id: selectedPlan.id,
        community_id: selectedPlan.community_id,
        amount: selectedPlan.price,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        invite_link: newInviteLink,
        telegram_user_id: telegramUserId // Add Telegram user ID
      };

      const payment = await createPayment(paymentData);

      // Register member with Telegram ID if available
      if (telegramUserId) {
        try {
          await createOrUpdateMember({
            community_id: selectedPlan.community_id,
            telegram_id: telegramUserId,
            subscription_plan_id: selectedPlan.id,
            status: 'active',
            payment_id: payment?.id
          });
          
          console.log(`Member created/updated with Telegram ID: ${telegramUserId}`);
        } catch (memberError) {
          console.error('Error creating/updating member:', memberError);
          // Continue with payment flow even if member creation fails
        }
      }

      if (payment?.invite_link) {
        setPaymentInviteLink(payment.invite_link);
      }

      toast({
        title: "Payment Successful! ",
        description: "You can now join the community.",
      });
      
      onCompletePurchase();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Error processing payment",
        description: error.message || "Please try again or contact support."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    paymentInviteLink,
    handlePayment
  };
};
