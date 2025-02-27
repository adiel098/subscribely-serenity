
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "../types/app.types";
import { PaymentState } from "../types/payment.types";
import { createOrUpdateMember } from "../services/memberService";
import { createPayment, createInviteLink } from "../services/paymentService";

export const usePaymentProcessing = (
  selectedPlan: Plan,
  selectedPaymentMethod: string | null,
  onCompletePurchase: () => void
) => {
  const { toast } = useToast();
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    paymentInviteLink: null,
  });

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
      setState(prev => ({ ...prev, isProcessing: true }));

      // Create invite link first
      const newInviteLink = await createInviteLink(selectedPlan.community_id);

      const paymentData = {
        plan_id: selectedPlan.id,
        community_id: selectedPlan.community_id,
        amount: selectedPlan.price,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        invite_link: newInviteLink,
      };

      const payment = await createPayment(paymentData);

      if (payment?.invite_link) {
        setState(prev => ({ ...prev, paymentInviteLink: payment.invite_link }));
      }

      toast({
        title: "Payment Successful! 🎉",
        description: "You can now join the community.",
      });
      
      onCompletePurchase();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Error processing payment",
        description: error.message || "Please try again or contact support."
      });
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return {
    ...state,
    handlePayment,
  };
};
