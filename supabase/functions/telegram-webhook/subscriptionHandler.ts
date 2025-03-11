
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleSubscription(supabase: ReturnType<typeof createClient>, inviteLink: string | undefined) {
  if (!inviteLink) return null;

  const { data: payment, error: paymentError } = await supabase
    .from('subscription_payments')
    .select(`
      id,
      plan_id,
      subscription_plans:plan_id (
        interval
      )
    `)
    .eq('invite_link', inviteLink)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (paymentError) {
    console.error('Error checking payment:', paymentError);
    throw paymentError;
  }

  if (!payment) return null;

  console.log('Found payment:', payment);
  const subscriptionStartDate = new Date();
  let subscriptionEndDate = new Date(subscriptionStartDate);

  if (payment.subscription_plans?.interval) {
    switch (payment.subscription_plans.interval) {
      case 'monthly':
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        break;
      case 'quarterly':
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        break;
      case 'half-yearly':
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        break;
      case 'yearly':
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        break;
      case 'one-time':
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
        break;
      case 'lifetime':
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
        break;
    }
  }

  return {
    subscriptionStartDate,
    subscriptionEndDate,
    subscriptionPlanId: payment.plan_id
  };
}
