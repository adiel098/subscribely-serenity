
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../cors.ts';

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('👤 [JOIN-REQUEST] Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
  
  if (!update.chat_join_request) {
    console.error('[JOIN-REQUEST] ❌ Invalid chat join request data');
    return new Response(JSON.stringify({ error: 'Invalid request data' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }

  try {
    // Extract relevant information from the join request
    const chatId = update.chat_join_request.chat.id.toString();
    const userId = update.chat_join_request.from.id.toString();
    const username = update.chat_join_request.from.username;
    
    console.log(`[JOIN-REQUEST] 📝 Processing join request: User ${userId} (${username || 'no username'}) requested to join chat ${chatId}`);
    
    // Get bot token from settings
    console.log('[JOIN-REQUEST] 🔑 Fetching bot token');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error("[JOIN-REQUEST] ❌ Error fetching bot token:", settingsError);
      throw new Error('Bot token not found in settings');
    }

    console.log('[JOIN-REQUEST] ✅ Bot token retrieved successfully');
    const botToken = settings.bot_token;
    
    // Get community ID from the chat ID
    console.log(`[JOIN-REQUEST] 🔍 Finding community for chat ID: ${chatId}`);
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (communityError || !community) {
      console.error('[JOIN-REQUEST] ❌ Error finding community:', communityError);
      console.error('[JOIN-REQUEST] Community search params:', { telegram_chat_id: chatId });
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const communityId = community.id;
    console.log(`[JOIN-REQUEST] ✅ Found community ID: ${communityId} for chat ID: ${chatId}`);

    // Check if user has an active subscription for this community
    console.log(`[JOIN-REQUEST] 🔍 Looking for existing member record with telegram_user_id: ${userId} and community_id: ${communityId}`);
    const { data: memberData, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select('id, subscription_status, subscription_end_date')
      .eq('community_id', communityId)
      .eq('telegram_user_id', userId)
      .single();

    // Log the query result
    console.log(`[JOIN-REQUEST] Member query result:`, {
      memberFound: !!memberData,
      memberData,
      memberError
    });

    // If no subscription record, check if there's a payment without a user ID
    if (memberError || !memberData) {
      console.log(`[JOIN-REQUEST] 🔍 No member record found, checking for unlinked payments for user ${userId}`);
      
      let paymentQuery = supabase
        .from('subscription_payments')
        .select('*')
        .eq('community_id', communityId)
        .eq('status', 'successful');
      
      // Build OR condition for user ID or username
      let orConditions = [];
      if (userId) {
        orConditions.push(`telegram_user_id.eq.${userId}`);
      }
      if (username) {
        orConditions.push(`telegram_username.eq.${username}`);
      }
      
      if (orConditions.length > 0) {
        paymentQuery = paymentQuery.or(orConditions.join(','));
      }
      
      // Log the query we're about to run
      console.log(`[JOIN-REQUEST] 🔍 Running payment query with OR conditions: ${orConditions.join(',')}`);
      
      const { data: paymentData, error: paymentError } = await paymentQuery
        .order('created_at', { ascending: false })
        .limit(1);

      console.log(`[JOIN-REQUEST] Payment query result:`, {
        paymentsFound: paymentData?.length || 0,
        paymentData,
        paymentError
      });

      if (paymentError || !paymentData || paymentData.length === 0) {
        console.log(`[JOIN-REQUEST] ❌ No payment found for user ${userId}, rejecting join request`);
        // No payment found, reject the join request
        const rejectResult = await rejectJoinRequest(botToken, chatId, userId);
        console.log(`[JOIN-REQUEST] 🚫 Reject result:`, rejectResult);
        return new Response(JSON.stringify({ success: true, message: 'Join request rejected - no payment found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Payment found, approve the join request
      console.log(`[JOIN-REQUEST] ✅ Payment found for user ${userId}, approving join request`);
      const approveResult = await approveJoinRequest(botToken, chatId, userId);
      console.log(`[JOIN-REQUEST] ✓ Approve result:`, approveResult);
      
      // Create member record if it doesn't exist
      console.log(`[JOIN-REQUEST] 📝 Creating member record for user ${userId} in community ${communityId}`);
      const memberResult = await createMemberRecord(supabase, userId, username, communityId, paymentData[0].plan_id);
      console.log(`[JOIN-REQUEST] Member record creation result:`, memberResult);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request approved based on payment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Member record exists, check if subscription is active
    console.log(`[JOIN-REQUEST] 🔍 Checking subscription status:`, {
      status: memberData.subscription_status,
      endDate: memberData.subscription_end_date,
      isActive: memberData.subscription_status && 
        memberData.subscription_end_date && 
        new Date(memberData.subscription_end_date) > new Date()
    });
    
    if (memberData.subscription_status && 
        memberData.subscription_end_date && 
        new Date(memberData.subscription_end_date) > new Date()) {
      // Active subscription, approve the join request
      console.log(`[JOIN-REQUEST] ✅ Active subscription found for user ${userId}, approving join request`);
      const approveResult = await approveJoinRequest(botToken, chatId, userId);
      console.log(`[JOIN-REQUEST] ✓ Approve result:`, approveResult);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request approved based on subscription' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // No active subscription, reject the join request
      console.log(`[JOIN-REQUEST] ❌ No active subscription for user ${userId}, rejecting join request`);
      const rejectResult = await rejectJoinRequest(botToken, chatId, userId);
      console.log(`[JOIN-REQUEST] 🚫 Reject result:`, rejectResult);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request rejected - subscription not active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[JOIN-REQUEST] ❌ Error handling chat join request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Helper function to approve join request
async function approveJoinRequest(botToken: string, chatId: string, userId: string) {
  try {
    console.log(`[JOIN-REQUEST] 🔄 Approving join request for user ${userId} in chat ${chatId}`);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    const result = await response.json();
    console.log('[JOIN-REQUEST] Approve join request raw response:', result);
    
    if (!result.ok) {
      console.error(`[JOIN-REQUEST] ❌ Telegram API error when approving join request:`, result);
    }
    
    return result;
  } catch (error) {
    console.error('[JOIN-REQUEST] ❌ Error approving join request:', error);
    throw error;
  }
}

// Helper function to reject join request
async function rejectJoinRequest(botToken: string, chatId: string, userId: string) {
  try {
    console.log(`[JOIN-REQUEST] 🔄 Rejecting join request for user ${userId} in chat ${chatId}`);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/declineChatJoinRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    const result = await response.json();
    console.log('[JOIN-REQUEST] Reject join request raw response:', result);
    
    if (!result.ok) {
      console.error(`[JOIN-REQUEST] ❌ Telegram API error when rejecting join request:`, result);
    }
    
    return result;
  } catch (error) {
    console.error('[JOIN-REQUEST] ❌ Error rejecting join request:', error);
    throw error;
  }
}

// Helper function to create member record
async function createMemberRecord(
  supabase: ReturnType<typeof createClient>, 
  userId: string, 
  username: string | undefined, 
  communityId: string, 
  planId: string | undefined
) {
  try {
    console.log(`[JOIN-REQUEST] 📝 Creating member record with params:`, {
      userId,
      username,
      communityId,
      planId
    });
    
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    
    // If we have a plan, try to get its interval to set the end date
    if (planId) {
      console.log(`[JOIN-REQUEST] 🔍 Looking up plan interval for plan ID: ${planId}`);
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', planId)
        .single();

      if (planError) {
        console.error(`[JOIN-REQUEST] ❌ Error fetching plan data:`, planError);
      }

      console.log(`[JOIN-REQUEST] Plan data:`, plan);

      if (plan) {
        console.log(`[JOIN-REQUEST] Setting subscription end date based on interval: ${plan.interval}`);
        if (plan.interval === 'monthly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        } else if (plan.interval === 'yearly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
        } else if (plan.interval === 'half-yearly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 180);
        } else if (plan.interval === 'quarterly') {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 90);
        } else {
          // Default to 30 days if interval is unknown
          console.log(`[JOIN-REQUEST] Unknown interval ${plan.interval}, defaulting to 30 days`);
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
      } else {
        // Default to 30 days if no plan is found
        console.log(`[JOIN-REQUEST] No plan found, defaulting to 30 days`);
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      }
    } else {
      // Default to 30 days if no plan is specified
      console.log(`[JOIN-REQUEST] No plan ID provided, defaulting to 30 days`);
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    }

    console.log(`[JOIN-REQUEST] Subscription period: ${subscriptionStartDate.toISOString()} to ${subscriptionEndDate.toISOString()}`);

    // Create member record object
    const memberRecord = {
      telegram_user_id: userId,
      telegram_username: username,
      community_id: communityId,
      is_active: true,
      subscription_status: true,
      subscription_plan_id: planId,
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
      last_active: new Date().toISOString()
    };
    
    console.log(`[JOIN-REQUEST] Upserting member record:`, memberRecord);

    // Create or update member record
    const { data: memberData, error: memberError } = await supabase
      .from('telegram_chat_members')
      .upsert(memberRecord, {
        onConflict: 'telegram_user_id,community_id'
      })
      .select();

    if (memberError) {
      console.error('[JOIN-REQUEST] ❌ Error creating/updating member record:', memberError);
      throw memberError;
    }
    
    console.log(`[JOIN-REQUEST] ✅ Successfully created/updated member record:`, memberData);
    return memberData;
  } catch (error) {
    console.error('[JOIN-REQUEST] ❌ Error in createMemberRecord:', error);
    throw error;
  }
}
