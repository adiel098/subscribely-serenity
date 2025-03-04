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
  
  const { data: existingSubscriptions, error: checkError } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('owner_id', session.session.user.id)
    .eq('status', 'active');

  if (checkError) {
    console.error("Error checking existing subscriptions:", checkError);
    throw checkError;
  }

  const endDate = calculateEndDate(selectedPlan.interval);
  
  let subscription;

  if (existingSubscriptions && existingSubscriptions.length > 0) {
    console.log("Found existing subscription(s). Updating instead of creating new one.");
    
    const existingSubscription = existingSubscriptions[0];
    
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

/**
 * Safely delete a platform subscription by first removing related payment records
 * @param subscriptionId The ID of the subscription to delete
 * @returns True if the deletion was successful, false otherwise
 */
export const deleteSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user?.id) {
      throw new Error("Authentication required");
    }
    
    console.log(`Attempting to delete subscription: ${subscriptionId}`);
    
    const { error: paymentDeleteError } = await supabase
      .from('platform_payments')
      .delete()
      .eq('subscription_id', subscriptionId);
      
    if (paymentDeleteError) {
      console.error("Error deleting related payment records:", paymentDeleteError);
      throw paymentDeleteError;
    }
    
    console.log("Successfully deleted related payment records");
    
    const { error: subscriptionDeleteError } = await supabase
      .from('platform_subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('owner_id', session.session.user.id); // Ensure the user owns this subscription
      
    if (subscriptionDeleteError) {
      console.error("Error deleting subscription:", subscriptionDeleteError);
      throw subscriptionDeleteError;
    }
    
    console.log("Successfully deleted subscription");
    return true;
  } catch (error) {
    console.error("Error in deleteSubscription function:", error);
    return false;
  }
};

/**
 * Alternative approach: Deactivate a subscription instead of deleting it
 * This preserves the payment history
 * @param subscriptionId The ID of the subscription to deactivate
 * @returns True if the deactivation was successful, false otherwise
 */
export const deactivateSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user?.id) {
      throw new Error("Authentication required");
    }
    
    console.log(`Deactivating subscription: ${subscriptionId}`);
    
    const { error } = await supabase
      .from('platform_subscriptions')
      .update({ status: 'inactive' })
      .eq('id', subscriptionId)
      .eq('owner_id', session.session.user.id); // Ensure the user owns this subscription
      
    if (error) {
      console.error("Error deactivating subscription:", error);
      throw error;
    }
    
    console.log("Successfully deactivated subscription");
    return true;
  } catch (error) {
    console.error("Error in deactivateSubscription function:", error);
    return false;
  }
};
