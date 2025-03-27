import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logMembershipChange } from './utils/logHelper.ts';
import { createOrUpdateMember } from './utils/dbLogger.ts';
import { updateCommunityMemberCount } from './services/communityCountService.ts';
import { 
  processNewMember, 
  processPaymentBasedMembership,
  processMemberLeft
} from './services/memberSubscriptionService.ts';
import { getTelegramUserInfo } from '../utils/telegram/userInfo.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleChatMemberUpdate = async (supabase: ReturnType<typeof createClient>, update: any) => {
  console.log('[CHAT-MEMBER] 📥 Processing chat member update:', update);

  if (!update.chat?.id || !update.new_chat_member?.user?.id) {
    console.error('[CHAT-MEMBER] ❌ Missing required chat member data:', { update });
    return new Response(JSON.stringify({ error: 'Invalid chat member data' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }

  try {
    // Get community ID from the chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', update.chat.id.toString())
      .single();

    if (communityError || !community) {
      console.error('[CHAT-MEMBER] ❌ Error finding community:', communityError);
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log(`[CHAT-MEMBER] ✅ Found community: ${community.id}`);

    const telegramUserId = update.new_chat_member.user.id.toString();
    const username = update.new_chat_member.user.username;
    const status = update.new_chat_member.status;

    // Get the bot token for user info retrieval
    const { data: tokenData, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !tokenData?.bot_token) {
      console.error('[CHAT-MEMBER] ❌ Error fetching bot token:', tokenError);
    }

    // If user joins the chat
    if (['member', 'administrator', 'creator'].includes(status)) {
      await handleMemberJoined(supabase, update, telegramUserId, username, community.id, status, tokenData?.bot_token);
    }
    // If user leaves chat
    else if (status === 'left' || status === 'kicked') {
      await handleMemberLeft(supabase, update, telegramUserId, username, community.id, status);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[CHAT-MEMBER] ❌ Error in chat member handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

/**
 * Handle when a member joins the chat
 */
async function handleMemberJoined(
  supabase: ReturnType<typeof createClient>,
  update: any,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  status: string,
  botToken?: string
) {
  console.log(`[CHAT-MEMBER] 👋 User joined chat: ${telegramUserId} with status: ${status}`);

  // Get additional user information from Telegram if bot token is available
  let firstName: string | undefined = update.new_chat_member.user.first_name;
  let lastName: string | undefined = update.new_chat_member.user.last_name;
  
  // Try to get more user information if not already available in the update
  if (botToken && (!firstName || !lastName)) {
    try {
      console.log(`[CHAT-MEMBER] 🔍 Fetching additional user info for ${telegramUserId}`);
      const userInfo = await getTelegramUserInfo(botToken, telegramUserId);
      
      if (userInfo.success) {
        firstName = userInfo.first_name || firstName;
        lastName = userInfo.last_name || lastName;
        username = userInfo.username || username;
        
        console.log(`[CHAT-MEMBER] ✅ Retrieved user info: ${firstName} ${lastName} @${username}`);
      }
    } catch (error) {
      console.error(`[CHAT-MEMBER] ⚠️ Error fetching user info (continuing anyway):`, error);
    }
  }

  // Check if there's an existing member record
  const { data: existingMember, error: memberCheckError } = await supabase
    .from('community_subscribers')
    .select('id, subscription_status, subscription_plan_id, subscription_end_date, first_name, last_name')
    .eq('telegram_user_id', telegramUserId)
    .eq('community_id', communityId)
    .maybeSingle();
  
  console.log('[CHAT-MEMBER] 🔍 Existing member check:', { 
    found: !!existingMember, 
    data: existingMember, 
    error: memberCheckError 
  });
  
  // Handle member record creation or update
  if (!existingMember) {
    // No existing record, process as new member and include first/last name
    await processNewMemberWithUserInfo(
      supabase, 
      telegramUserId, 
      username, 
      communityId, 
      firstName, 
      lastName
    );
  } else {
    // Update existing member record as active and update name if needed
    console.log('[CHAT-MEMBER] 🔄 Updating existing member record as active');
    await createOrUpdateMember(supabase, {
      telegram_user_id: telegramUserId,
      telegram_username: username,
      community_id: communityId,
      is_active: true,
      first_name: firstName || existingMember.first_name,
      last_name: lastName || existingMember.last_name,
      // Keep existing subscription data
      subscription_status: existingMember.subscription_status,
      subscription_plan_id: existingMember.subscription_plan_id,
      subscription_end_date: existingMember.subscription_end_date
    });
  }
  
  // Log the membership change
  await logMembershipChange(
    supabase,
    update.chat.id.toString(),
    telegramUserId,
    username,
    'added',
    `User added to group with status: ${status}`,
    update
  );
  
  // Update the community member count
  await updateCommunityMemberCount(supabase, communityId);
}

/**
 * Process a new member with user info (first/last name)
 */
async function processNewMemberWithUserInfo(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  firstName?: string,
  lastName?: string
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
      await processPaymentBasedMembershipWithUserInfo(
        supabase, 
        telegramUserId, 
        username, 
        communityId, 
        payments[0], 
        firstName, 
        lastName
      );
    } else {
      // No payment found, just create a basic member record with user info
      console.log('[MEMBER-SERVICE] ℹ️ No payment found, creating basic member record');
      await createOrUpdateMember(supabase, {
        telegram_user_id: telegramUserId,
        telegram_username: username,
        community_id: communityId,
        is_active: true,
        subscription_status: 'inactive',
        first_name: firstName,
        last_name: lastName
      });
    }
  } catch (error) {
    console.error('[MEMBER-SERVICE] ❌ Error in processNewMemberWithUserInfo:', error);
  }
}

/**
 * Process a member with an existing payment record and user info
 */
async function processPaymentBasedMembershipWithUserInfo(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  payment: any,
  firstName?: string,
  lastName?: string
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
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else if (plan.interval === 'half-yearly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        } else if (plan.interval === 'quarterly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        } else if (plan.interval === 'one-time' || plan.interval === 'lifetime') {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
        } else {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
      } else {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      }
    } else {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    }

    // Create member record with subscription info and user info
    await createOrUpdateMember(supabase, {
      telegram_user_id: telegramUserId,
      telegram_username: username,
      community_id: communityId,
      is_active: true,
      subscription_status: 'active',
      subscription_plan_id: payment.plan_id,
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
      first_name: firstName,
      last_name: lastName
    });
    
    console.log(`[MEMBER-SERVICE] ✅ Subscription processed successfully for user ${telegramUserId}`);
  } catch (error) {
    console.error('[MEMBER-SERVICE] ❌ Error in processPaymentBasedMembershipWithUserInfo:', error);
  }
}

/**
 * Handle member updates when the user left or was kicked from the chat
 */
async function handleMemberLeft(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  status: string
): Promise<void> {
  console.log(`[CHAT-MEMBER] 👋 User left/kicked from chat: ${telegramUserId}`);

  // Update member record as inactive
  await processMemberLeft(supabase, telegramUserId, username, communityId);
  
  // Log the membership change
  await logMembershipChange(
    supabase,
    update.chat.id.toString(),
    telegramUserId,
    username,
    'removed',
    `User ${status} from group`,
    update
  );
  
  // Update the community member count
  await updateCommunityMemberCount(supabase, communityId);
}
