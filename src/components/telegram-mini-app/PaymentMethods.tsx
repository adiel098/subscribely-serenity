import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";
import { Plan } from "@/pages/TelegramMiniApp";
import { SuccessScreen } from "./SuccessScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

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
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      if (!selectedPlan?.community_id) return;
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('community_id', selectedPlan.community_id)
        .eq('provider', 'stripe')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching Stripe config:', error);
        return;
      }

      if (data?.config) {
        setStripeConfig(data.config);
      }
    };

    fetchStripeConfig();
  }, [selectedPlan?.community_id]);

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
      if (selectedPaymentMethod === 'card' && stripeConfig) {
        // Load Stripe.js
        const stripe = await loadStripe(stripeConfig.public_key);
        
        // Create payment session using Edge Function
        const { data: session, error: sessionError } = await supabase.functions.invoke(
          'create-stripe-session',
          {
            body: { 
              planId: selectedPlan.id,
              amount: selectedPlan.price,
              communityId: selectedPlan.community_id,
              telegramUserId: window.Telegram?.WebApp.initDataUnsafe.user?.id?.toString()
            }
          }
        );

        if (sessionError) {
          throw sessionError;
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.id
        });

        if (result.error) {
          throw result.error;
        }

        return;
      }
      
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

      const telegramUserId = window.Telegram?.WebApp.initDataUnsafe.user?.id?.toString();
      console.log('Telegram User ID:', telegramUserId);
      console.log('Selected Plan:', selectedPlan);

      const paymentData = {
        plan_id: selectedPlan.id,
        community_id: selectedPlan.community_id,
        amount: selectedPlan.price,
        payment_method: selectedPaymentMethod,
        status: 'completed',
        invite_link: newInviteLink || null,
        telegram_user_id: telegramUserId
      };

      const { data: payment, error } = await supabase
        .from('subscription_payments')
        .insert([paymentData])
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
          disabled={!stripeConfig}
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
