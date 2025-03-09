
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../cors.ts';

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
  
  if (!update.chat_join_request) {
    console.error('Invalid chat join request data');
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
    
    console.log(`Processing join request: User ${userId} (${username || 'no username'}) requested to join chat ${chatId}`);
    
    // Get bot token from settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error("Error fetching bot token:", settingsError);
      throw new Error('Bot token not found in settings');
    }

    const botToken = settings.bot_token;
    
    // Get community ID from the chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (communityError || !community) {
      console.error('Error finding community:', communityError);
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const communityId = community.id;
    console.log(`Found community ID: ${communityId} for chat ID: ${chatId}`);

    // Check if user has an active subscription for this community
    const { data: memberData, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select('id, subscription_status, subscription_end_date')
      .eq('community_id', communityId)
      .eq('telegram_user_id', userId)
      .single();

    // If no subscription record, check if there's a payment without a user ID
    if (memberError || !memberData) {
      console.log(`No member record found, checking for unlinked payments for user ${userId}`);
      
      // Check if there's a recent payment for this username/user_id
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('community_id', communityId)
        .eq('status', 'successful')
        .or(`telegram_user_id.eq.${userId},telegram_username.eq.${username || ''}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (paymentError || !paymentData || paymentData.length === 0) {
        console.log(`No payment found for user ${userId}, rejecting join request`);
        // No payment found, reject the join request
        return await rejectJoinRequest(botToken, chatId, userId);
      }

      // Payment found, approve the join request
      console.log(`Payment found for user ${userId}, approving join request`);
      await approveJoinRequest(botToken, chatId, userId);
      
      // Create member record if it doesn't exist
      await createMemberRecord(supabase, userId, username, communityId, paymentData[0].plan_id);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request approved based on payment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Member record exists, check if subscription is active
    if (memberData.subscription_status && 
        memberData.subscription_end_date && 
        new Date(memberData.subscription_end_date) > new Date()) {
      // Active subscription, approve the join request
      console.log(`Active subscription found for user ${userId}, approving join request`);
      await approveJoinRequest(botToken, chatId, userId);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request approved based on subscription' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // No active subscription, reject the join request
      console.log(`No active subscription for user ${userId}, rejecting join request`);
      await rejectJoinRequest(botToken, chatId, userId);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error handling chat join request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Helper function to approve join request
async function approveJoinRequest(botToken: string, chatId: string, userId: string) {
  try {
    console.log(`Approving join request for user ${userId} in chat ${chatId}`);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    const result = await response.json();
    console.log('Approve join request response:', result);
    return result;
  } catch (error) {
    console.error('Error approving join request:', error);
    throw error;
  }
}

// Helper function to reject join request
async function rejectJoinRequest(botToken: string, chatId: string, userId: string) {
  try {
    console.log(`Rejecting join request for user ${userId} in chat ${chatId}`);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/declineChatJoinRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    const result = await response.json();
    console.log('Reject join request response:', result);
    
    return new Response(JSON.stringify({ success: true, message: 'Join request rejected' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error rejecting join request:', error);
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
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    
    // If we have a plan, try to get its interval to set the end date
    if (planId) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', planId)
        .single();

      if (plan) {
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
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
      }
    } else {
      // Default to 30 days if no plan is specified
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    }

    // Create or update member record
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .upsert({
        telegram_user_id: userId,
        telegram_username: username,
        community_id: communityId,
        is_active: true,
        subscription_status: true,
        subscription_plan_id: planId,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        last_active: new Date().toISOString()
      }, {
        onConflict: 'telegram_user_id,community_id'
      });

    if (memberError) {
      console.error('Error creating/updating member record:', memberError);
      throw memberError;
    }
    
    console.log(`Successfully created/updated member record for user ${userId} in community ${communityId}`);
  } catch (error) {
    console.error('Error in createMemberRecord:', error);
    throw error;
  }
}
