
import { supabase } from "@/integrations/supabase/client";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

export const processPayment = async (
  selectedPlan: PlatformPlan, 
  paymentMethod: string
) => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    throw new Error("Authentication required");
  }

  // Calculate subscription end date based on interval
  const endDate = calculateEndDate(selectedPlan.interval);

  // Create subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from('platform_subscriptions')
    .insert({
      owner_id: session.session.user.id,
      plan_id: selectedPlan.id,
      subscription_start_date: new Date(),
      subscription_end_date: endDate,
      auto_renew: true,
      is_active: true,
      status: 'active'
    })
    .select()
    .single();

  if (subscriptionError) {
    throw subscriptionError;
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('platform_payments')
    .insert({
      owner_id: session.session.user.id,
      plan_id: selectedPlan.id,
      subscription_id: subscription.id,
      amount: selectedPlan.price,
      payment_method: paymentMethod,
      payment_status: 'completed',
      transaction_id: `${paymentMethod}-${Date.now()}`
    });

  if (paymentError) {
    throw paymentError;
  }

  return subscription;
};

// Helper function to calculate end date based on interval
const calculateEndDate = (interval: string) => {
  const now = new Date();
  switch (interval) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'lifetime':
      return new Date(now.setFullYear(now.getFullYear() + 99)); // Effectively lifetime
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
};
