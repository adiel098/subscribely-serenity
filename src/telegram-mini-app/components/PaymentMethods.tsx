
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import { Plan } from "@/telegram-mini-app/pages/TelegramMiniApp";
import { SuccessScreen } from "./SuccessScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

// For development, set this to true to bypass real payment processing
const TEST_MODE = true;

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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const createOrUpdateMember = async (telegramUserId: string, inviteLink: string) => {
    console.log('Creating/updating member:', {
      telegramUserId,
      communityId: selectedPlan.community_id,
      planId: selectedPlan.id
    });

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    
    // Add 30 days for monthly plans, 365 for yearly
    if (selectedPlan.interval === 'monthly') {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    } else if (selectedPlan.interval === 'yearly') {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
    }

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('community_id', selectedPlan.community_id)
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (existingMember) {
      // Update existing member
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
      // Create new member
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
      setIsProcessing(true);

      if (TEST_MODE) {
        console.log('Test mode: Simulating successful payment');
        
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
        const telegramUserId = window.Telegram?.WebApp.initDataUnsafe.user?.id?.toString();

        if (!telegramUserId) {
          throw new Error('Telegram user ID is missing');
        }

        const paymentData = {
          plan_id: selectedPlan.id,
          community_id: selectedPlan.community_id,
          amount: selectedPlan.price,
          payment_method: selectedPaymentMethod,
          status: 'completed',
          invite_link: newInviteLink,
          telegram_user_id: telegramUserId
        };

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('subscription_payments')
          .insert([paymentData])
          .select()
          .single();

        if (paymentError) {
          throw paymentError;
        }

        // Create or update member record
        await createOrUpdateMember(telegramUserId, newInviteLink);

        if (payment?.invite_link) {
          setPaymentInviteLink(payment.invite_link);
        }

        toast({
          title: "Test Payment Successful! 🎉",
          description: "You can now join the community.",
        });
        
        onCompletePurchase();
        return;
      }

      // Original payment processing logic for non-test mode
      if (selectedPaymentMethod === 'card' && stripeConfig) {
        const stripe = await loadStripe(stripeConfig.public_key);
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        const telegramUserId = window.Telegram?.WebApp.initDataUnsafe.user?.id?.toString();
        if (!telegramUserId) {
          throw new Error('Telegram user ID is missing');
        }

        console.log('Creating Stripe session...', {
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          communityId: selectedPlan.community_id,
          telegramUserId
        });

        // Create payment session using Edge Function
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
          'create-stripe-session',
          {
            body: { 
              planId: selectedPlan.id,
              amount: selectedPlan.price,
              communityId: selectedPlan.community_id,
              telegramUserId
            }
          }
        );

        console.log('Session creation response:', sessionData);

        if (sessionError || !sessionData?.sessionId) {
          throw sessionError || new Error('Failed to create payment session');
        }

        // Redirect to Stripe Checkout using the URL from the session
        if (sessionData.url) {
          window.location.href = sessionData.url;
          return;
        }

        // Fallback to redirectToCheckout if no URL is provided
        const result = await stripe.redirectToCheckout({
          sessionId: sessionData.sessionId
        });

        if (result?.error) {
          throw result.error;
        }

        return;
      }
      
      // Handle other payment methods
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
        console.error('Error creating invite link:', inviteLinkError);
        toast({
          variant: 'destructive',
          title: 'Error creating invite link',
          description: 'Please try again or contact support.',
        });
        return;
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

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // Create or update member record
      await createOrUpdateMember(telegramUserId, newInviteLink);

      if (payment?.invite_link) {
        setPaymentInviteLink(payment.invite_link);
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
      setIsProcessing(false);
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
            disabled={isProcessing}
          >
            <Heart className="h-5 w-5" />
            {isProcessing ? 'Processing...' : `Pay $${selectedPlan.price}`}
          </Button>
          <p className="text-sm text-muted-foreground pb-8">
            Click the button above to complete your payment
          </p>
        </div>
      )}
    </div>
  );
};

