import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { logJoinRequestEvent } from '../../utils/logHelper.ts';

// Define a type for our join request decision actions
type JoinRequestAction = 'approve' | 'decline';

/**
 * Handle a chat join request from a user
 * 
 * @param supabase The Supabase client
 * @param update The Telegram update containing the chat join request
 * @returns A Response object with the result
 */
export async function handleChatJoinRequest(
  supabase: ReturnType<typeof createClient>,
  update: any
): Promise<Response> {
  console.log("[JOIN-REQUEST-HANDLER] 👋 Processing chat join request");
  
  const request = update.chat_join_request;
  
  if (!request || !request.chat || !request.from) {
    console.error("[JOIN-REQUEST-HANDLER] ❌ Invalid chat join request format");
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Invalid chat join request format" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Extract request details
  const chatId = String(request.chat.id);
  const userId = String(request.from.id);
  const firstName = request.from.first_name || '';
  const lastName = request.from.last_name || '';
  const username = request.from.username;
  
  console.log(`[JOIN-REQUEST-HANDLER] 🔍 Join request details - Chat ID: ${chatId}, User ID: ${userId}, Username: ${username || 'not provided'}`);
  
  try {
    // Log the join request event
    await logJoinRequestEvent(
      supabase,
      chatId,
      userId,
      username,
      'join_request_received',
      `Join request from user ID ${userId} (${username || 'No username'})`,
      request
    );
    
    // Get community ID for this chat
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
      .eq('telegram_chat_id', chatId)
      .single();
    
    if (communityError || !community) {
      console.error(`[JOIN-REQUEST-HANDLER] ❌ Community not found for chat ID ${chatId}:`, communityError);
      return await handleJoinRequestDecision(supabase, 'decline', update, 'Community not found');
    }
    
    console.log(`[JOIN-REQUEST-HANDLER] ✅ Found community: ${community.name} (${community.id})`);
    
    // Check if user has an active subscription or an expired one that could be renewed
    const { data: memberData, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select('id, is_active, subscription_status, subscription_end_date')
      .eq('telegram_user_id', userId)
      .eq('community_id', community.id)
      .order('joined_at', { ascending: false })
      .limit(1);
    
    const member = memberData && memberData.length > 0 ? memberData[0] : null;
    
    if (memberError) {
      console.error(`[JOIN-REQUEST-HANDLER] ❌ Error checking member: ${memberError.message}`);
      // Continue with caution
    }
    
    // Decision logic for the join request
    let decision: JoinRequestAction = 'decline';
    let reason = 'No active subscription';
    
    if (member) {
      console.log(`[JOIN-REQUEST-HANDLER] 🔍 Found existing member record - Active: ${member.is_active}, Status: ${member.subscription_status}`);
      
      if (member.is_active && member.subscription_status === 'active') {
        // Member has active subscription, approve the request
        decision = 'approve';
        reason = 'Active subscription found';
      } else if (member.subscription_status === 'expired') {
        // Special case for expired subscriptions - we'll allow them to join and they'll see renewal options
        console.log(`[JOIN-REQUEST-HANDLER] ⚠️ Member has expired subscription, allowing join for renewal opportunity`);
        decision = 'approve';
        reason = 'Expired subscription - renewal opportunity';
        
        // Update member status to indicate they're back
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update({ 
            is_active: true,  // They're active again (in the chat)
            // Keep subscription_status as 'expired' to indicate they need to renew
          })
          .eq('id', member.id);
        
        if (updateError) {
          console.error(`[JOIN-REQUEST-HANDLER] ❌ Failed to update member status: ${updateError.message}`);
        } else {
          console.log(`[JOIN-REQUEST-HANDLER] ✅ Updated member to active status for renewal opportunity`);
        }
      }
    } else {
      // No existing member record - check if we have a payment for this user
      const { data: payments, error: paymentError } = await supabase
        .from('subscription_payments')
        .select('id, status, plan_id')
        .eq('telegram_user_id', userId)
        .eq('community_id', community.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (paymentError) {
        console.error(`[JOIN-REQUEST-HANDLER] ❌ Error checking payments: ${paymentError.message}`);
      } else if (payments && payments.length > 0) {
        // Found a completed payment, create new member record and approve
        console.log(`[JOIN-REQUEST-HANDLER] 💰 Found payment record for user ${userId}`);
        decision = 'approve';
        reason = 'Payment record found';
        
        // Create new member record
        const { error: createError } = await supabase
          .from('telegram_chat_members')
          .insert({
            telegram_user_id: userId,
            telegram_username: username,
            community_id: community.id,
            is_active: true,
            subscription_status: 'active',
            subscription_plan_id: payments[0].plan_id
          });
        
        if (createError) {
          console.error(`[JOIN-REQUEST-HANDLER] ❌ Failed to create member record: ${createError.message}`);
        } else {
          console.log(`[JOIN-REQUEST-HANDLER] ✅ Created new member record based on payment`);
        }
      } else {
        console.log(`[JOIN-REQUEST-HANDLER] ℹ️ No payment found for user ${userId}, declining request`);
      }
    }
    
    // Process the decision
    return await handleJoinRequestDecision(supabase, decision, update, reason);
    
  } catch (error) {
    console.error("[JOIN-REQUEST-HANDLER] ❌ Error processing join request:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error processing join request: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle the final decision for a join request
 */
async function handleJoinRequestDecision(
  supabase: ReturnType<typeof createClient>,
  decision: JoinRequestAction,
  update: any,
  reason: string
): Promise<Response> {
  const request = update.chat_join_request;
  const chatId = String(request.chat.id);
  const userId = String(request.from.id);
  const username = request.from.username;
  
  console.log(`[JOIN-REQUEST-HANDLER] 🔄 Decision for user ${userId}: ${decision.toUpperCase()} - Reason: ${reason}`);
  
  try {
    // Get bot token to make API call
    const { data: settings, error: tokenError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();
    
    if (tokenError || !settings?.bot_token) {
      console.error(`[JOIN-REQUEST-HANDLER] ❌ Failed to get bot token: ${tokenError?.message || 'Not found'}`);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get bot token" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare API endpoint based on decision
    const endpoint = decision === 'approve' 
      ? 'approveChatJoinRequest' 
      : 'declineChatJoinRequest';
    
    // Make API call to approve or decline
    const response = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      }
    );
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`[JOIN-REQUEST-HANDLER] ❌ Telegram API error: ${result.description}`);
      
      // Log the error
      await logJoinRequestEvent(
        supabase,
        chatId,
        userId,
        username,
        `join_request_${decision}_failed`,
        `Failed to ${decision} join request: ${result.description}`,
        { apiResponse: result }
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          telegram_error: result.description
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log the success
    await logJoinRequestEvent(
      supabase,
      chatId,
      userId,
      username,
      `join_request_${decision}d`,
      `${decision === 'approve' ? 'Approved' : 'Declined'} join request - Reason: ${reason}`
    );
    
    console.log(`[JOIN-REQUEST-HANDLER] ✅ Successfully ${decision}d join request for user ${userId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        action: decision,
        reason: reason
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`[JOIN-REQUEST-HANDLER] ❌ Error in ${decision} process:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error in ${decision} process: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
