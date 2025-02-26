
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Plan } from "@/telegram-mini-app/pages/TelegramMiniApp";

interface PaymentState {
  isProcessing: boolean;
  paymentInviteLink: string | null;
}

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

  const createOrUpdateMember = async (telegramUserId: string, inviteLink: string) => {
    console.log('Creating/updating member:', {
      telegramUserId,
      communityId: selectedPlan.community_id,
      planId: selectedPlan.id
    });

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    
    if (selectedPlan.interval === 'monthly') {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    } else if (selectedPlan.interval === 'yearly') {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
    }

    const { data: existingMember } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('community_id', selectedPlan.community_id)
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (existingMember) {
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: true,
          subscription_status: true,
          subscription_start_date: subscriptionStartDate.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          subscription_plan_id: selectedPlan.id,
          last_active: new Date().toISOString()
        })
        .eq('id', existingMember.id);

      if (updateError) {
        console.error('Error updating member:', updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('telegram_chat_members')
        .insert([{
          community_id: selectedPlan.community_id,
          telegram_user_id: telegramUserId,
          is_active: true,
          subscription_status: true,
          subscription_start_date: subscriptionStartDate.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          subscription_plan_id: selectedPlan.id,
          last_active: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error creating member:', insertError);
        throw insertError;
      }
    }
  };

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

      const telegramUserId = window.Telegram?.WebApp.initDataUnsafe.user?.id?.toString();
      if (!telegramUserId) {
        throw new Error('Telegram user ID is missing');
      }

      const { data: inviteLinkData, error: inviteLinkError } = await supabase.functions.invoke(
        'create-invite-link',
        {
          body: { communityId: selectedPlan.community_id },
        }
      );

      if (inviteLinkError) {
        throw inviteLinkError;
      }

      const newInviteLink = inviteLinkData?.inviteLink;

      const paymentData = {
        plan_id: selectedPlan.id,
        community_id: selectedPlan.community_id,
        amount: selectedPlan.price,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        invite_link: newInviteLink,
        telegram_user_id: telegramUserId
      };

      const { data: payment, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      await createOrUpdateMember(telegramUserId, newInviteLink);

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
