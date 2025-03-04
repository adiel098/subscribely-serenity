
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

  console.log(`Processing ${paymentMethod} payment for plan: ${selectedPlan.name}`);
  
  // Check for existing active subscriptions
  const { data: existingSubscriptions, error: checkError } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('owner_id', session.session.user.id)
    .eq('status', 'active');

  if (checkError) {
    console.error("Error checking existing subscriptions:", checkError);
    throw checkError;
  }

  // Calculate subscription end date based on interval
  const endDate = calculateEndDate(selectedPlan.interval);
  
  let subscription;

  // If there's an existing subscription, update it instead of creating a new one
  if (existingSubscriptions && existingSubscriptions.length > 0) {
    console.log("Found existing subscription(s). Updating instead of creating new one.");
    
    // Get the first active subscription to update
    const existingSubscription = existingSubscriptions[0];
    
    // Update the existing subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('platform_subscriptions')
      .update({
        plan_id: selectedPlan.id,
        subscription_start_date: new Date(),
        subscription_end_date: endDate,
        auto_renew: true,
        status: 'active'
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }
    
    subscription = updatedSubscription;
    
    // Deactivate any other active subscriptions if multiple exist
    if (existingSubscriptions.length > 1) {
      console.log("Multiple active subscriptions found. Deactivating extras.");
      const otherSubscriptionIds = existingSubscriptions
        .filter(sub => sub.id !== existingSubscription.id)
        .map(sub => sub.id);
        
      if (otherSubscriptionIds.length > 0) {
        const { error: deactivateError } = await supabase
          .from('platform_subscriptions')
          .update({ status: 'inactive' })
          .in('id', otherSubscriptionIds);
          
        if (deactivateError) {
          console.error("Error deactivating extra subscriptions:", deactivateError);
          // Continue despite this error
        }
      }
    }
  } else {
    // No existing subscription, create a new one
    const { data: newSubscription, error: subscriptionError } = await supabase
      .from('platform_subscriptions')
      .insert({
        owner_id: session.session.user.id,
        plan_id: selectedPlan.id,
        subscription_start_date: new Date(),
        subscription_end_date: endDate,
        auto_renew: true,
        status: 'active'
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      throw subscriptionError;
    }
    
    subscription = newSubscription;
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
    console.error("Payment record creation error:", paymentError);
    throw paymentError;
  }

  console.log("Payment processed successfully!");
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
