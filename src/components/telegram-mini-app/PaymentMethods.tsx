
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";
import { Plan } from "@/pages/TelegramMiniApp";
import { SuccessScreen } from "./SuccessScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAnalyticsEvent } from "@/hooks/useAnalytics";

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink?: string | null;
  showSuccess: boolean;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess
}: PaymentMethodsProps) => {
  const { toast } = useToast();
  const [paymentInviteLink, setPaymentInviteLink] = useState<string | null>(null);

  const handlePaymentComplete = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a payment method"
      });
      return;
    }

    try {
      // קבלת נתוני המשתמש מ-Telegram WebApp
      const webApp = (window as any).Telegram?.WebApp;
      if (!webApp) {
        throw new Error('Telegram WebApp is not available');
      }

      const initData = webApp.initData;
      const initDataUnsafe = webApp.initDataUnsafe;
      const userId = initDataUnsafe?.user?.id;

      if (!userId) {
        throw new Error('Could not get Telegram user ID');
      }

      console.log('Creating payment for user:', {
        userId,
        planId: selectedPlan.id,
        communityId: selectedPlan.community_id
      });

      // Create a new invite link
      console.log('Creating new invite link for community:', selectedPlan.community_id);
      const { data: inviteLinkData, error: inviteLinkError } = await supabase.functions.invoke(
        'create-invite-link',
        {
          body: { communityId: selectedPlan.community_id }
        }
      );

      if (inviteLinkError) {
        console.error('Error creating invite link:', inviteLinkError);
        toast({
          variant: "destructive",
          title: "Error creating invite link",
          description: "Please try again or contact support."
        });
        return;
      }

      const newInviteLink = inviteLinkData?.inviteLink;

      // עדכון סטטוס המנוי של המשתמש
      const { data: existingMember, error: memberError } = await supabase
        .from('telegram_chat_members')
        .select('id')
        .eq('community_id', selectedPlan.community_id)
        .eq('telegram_user_id', userId.toString())
        .single();

      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error checking existing member:', memberError);
        throw memberError;
      }

      if (existingMember) {
        // עדכון חבר קיים
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update({
            subscription_status: true,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: selectedPlan.interval === 'one-time' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plan_id: selectedPlan.id,
            is_active: true
          })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('Error updating member:', updateError);
          throw updateError;
        }
      } else {
        // יצירת חבר חדש
        const { error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert({
            community_id: selectedPlan.community_id,
            telegram_user_id: userId.toString(),
            telegram_username: initDataUnsafe?.user?.username || null,
            subscription_status: true,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: selectedPlan.interval === 'one-time' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plan_id: selectedPlan.id,
            is_active: true
          });

        if (insertError) {
          console.error('Error creating new member:', insertError);
          throw insertError;
        }
      }

      // Create the payment record
      const { data: payment, error } = await supabase
        .from('subscription_payments')
        .insert([{
          plan_id: selectedPlan.id,
          community_id: selectedPlan.community_id,
          amount: selectedPlan.price,
          payment_method: selectedPaymentMethod,
          status: 'completed',
          invite_link: newInviteLink || null,
          telegram_user_id: userId.toString()
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Payment error:', error);
        toast({
          variant: "destructive",
          title: "Error processing payment",
          description: "Please try again or contact support."
        });
        return;
      }

      if (payment?.invite_link) {
        setPaymentInviteLink(payment.invite_link);
      }

      // Log the payment event
      await logAnalyticsEvent(
        selectedPlan.community_id,
        'payment_received',
        userId.toString(),
        {
          plan_id: selectedPlan.id,
          payment_method: selectedPaymentMethod,
          invite_link: newInviteLink
        },
        selectedPlan.price
      );

      toast({
        title: "Payment Successful! 🎉",
        description: "You can now join the community.",
      });
      
      onCompletePurchase();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Error processing payment",
        description: "Please try again or contact support."
      });
    }
  };

  if (showSuccess) {
    return <SuccessScreen communityInviteLink={paymentInviteLink || communityInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="px-4 py-1.5">
          <Gift className="h-4 w-4 mr-2" />
          Final Step
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900">
          Choose Payment Method
        </h2>
        <p className="text-gray-600">
          Select your preferred way to pay for the {selectedPlan.name} plan
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <TelegramPaymentOption
          icon="/lovable-uploads/214f6259-adad-480f-81ba-77390e675f8b.png"
          title="PayPal"
          isSelected={selectedPaymentMethod === 'paypal'}
          onSelect={() => onPaymentMethodSelect('paypal')}
        />
        <TelegramPaymentOption
          icon="/lovable-uploads/0f9dcb59-a015-47ed-91ed-0f57d6e2c751.png"
          title="Card"
          isSelected={selectedPaymentMethod === 'card'}
          onSelect={() => onPaymentMethodSelect('card')}
        />
        <TelegramPaymentOption
          icon="/lovable-uploads/c00577e9-67bf-4dcb-b6c9-c821640fcea2.png"
          title="Bank Transfer"
          isSelected={selectedPaymentMethod === 'bank'}
          onSelect={() => onPaymentMethodSelect('bank')}
        />
      </div>

      {selectedPaymentMethod && (
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold gap-2 w-full max-w-sm"
            onClick={handlePaymentComplete}
          >
            <Heart className="h-5 w-5" />
            I Paid ${selectedPlan.price}
          </Button>
          <p className="text-sm text-muted-foreground pb-8">
            Click the button above after completing your payment
          </p>
        </div>
      )}
    </div>
  );
};
