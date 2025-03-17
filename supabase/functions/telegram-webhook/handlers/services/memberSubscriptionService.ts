
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createOrUpdateMember } from '../utils/dbLogger.ts';

/**
 * Process a member that joined without an existing subscription
 */
export async function processNewMember(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string
): Promise<void> {
  try {
    console.log('[MEMBER-SERVICE] 🔍 Checking for payments for new member:', telegramUserId);
    
    // Find the most recent payment for this user
    const { data: payments, error: paymentsError } = await supabase
      .from('subscription_payments')
      .select('*')
      .eq('community_id', communityId)
      .eq('status', 'successful')
      .or(`telegram_user_id.eq.${telegramUserId},telegram_username.eq.${username || ''}`)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('[MEMBER-SERVICE] 🔍 Payment search result:', {
      found: payments?.length > 0,
      payments,
      error: paymentsError
    });

    if (payments?.length > 0) {
      await processPaymentBasedMembership(supabase, telegramUserId, username, communityId, payments[0]);
    } else {
      // No payment found, just create a basic member record
      console.log('[MEMBER-SERVICE] ℹ️ No payment found, creating basic member record');
      await createOrUpdateMember(supabase, {
        telegram_user_id: telegramUserId,
        telegram_username: username,
        community_id: communityId,
        is_active: true,
        subscription_status: 'inactive'
      });
    }
  } catch (error) {
    console.error('[MEMBER-SERVICE] ❌ Error in processNewMember:', error);
  }
}

/**
 * Process a member with an existing payment record
 */
export async function processPaymentBasedMembership(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  payment: any
): Promise<void> {
  try {
    console.log(`[MEMBER-SERVICE] 💰 Processing payment-based membership for user ${telegramUserId}`);
    
    // Update payment with telegram_user_id if it's not set
    if (!payment.telegram_user_id) {
      console.log(`[MEMBER-SERVICE] 🔄 Updating payment ${payment.id} with telegram_user_id ${telegramUserId}`);
      await supabase
        .from('subscription_payments')
        .update({ telegram_user_id: telegramUserId })
        .eq('id', payment.id);
    }

    // Calculate subscription dates based on the plan
    const subscriptionStartDate = new Date();
    let subscriptionEndDate = new Date(subscriptionStartDate);
    
    if (payment.plan_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', payment.plan_id)
        .single();

      console.log('[MEMBER-SERVICE] 📅 Found plan for payment:', plan);

      if (plan) {
        if (plan.interval === 'monthly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else if (plan.interval === 'yearly') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // Proper handling for yearly plans
        } else if (plan.interval === 'half-yearly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        } else if (plan.interval === 'quarterly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        } else if (plan.interval === 'one-time' || plan.interval === 'lifetime') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100); // Set to far future for lifetime/one-time
        } else {
          // Default to 30 days
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
      } else {
        // Default to 30 days if no plan is found
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      }
    } else {
      // Default to 30 days if no plan ID
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    }

    // Create member record with subscription info
    await createOrUpdateMember(supabase, {
      telegram_user_id: telegramUserId,
      telegram_username: username,
      community_id: communityId,
      is_active: true,
      subscription_status: 'active',
      subscription_plan_id: payment.plan_id,
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
    });
    
    console.log(`[MEMBER-SERVICE] ✅ Subscription processed successfully for user ${telegramUserId}`);
  } catch (error) {
    console.error('[MEMBER-SERVICE] ❌ Error in processPaymentBasedMembership:', error);
  }
}

/**
 * Handle member updates when the user left or was kicked from the chat
 */
export async function processMemberLeft(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string
): Promise<void> {
  try {
    console.log(`[MEMBER-SERVICE] 👋 Processing member left event for user ${telegramUserId}`);

    // Update member record as inactive
    await createOrUpdateMember(supabase, {
      telegram_user_id: telegramUserId,
      telegram_username: username,
      community_id: communityId,
      is_active: false,
      subscription_status: 'inactive'
    });
    
    console.log(`[MEMBER-SERVICE] ✅ Member record updated for left/kicked user ${telegramUserId}`);
  } catch (error) {
    console.error('[MEMBER-SERVICE] ❌ Error in processMemberLeft:', error);
  }
}
