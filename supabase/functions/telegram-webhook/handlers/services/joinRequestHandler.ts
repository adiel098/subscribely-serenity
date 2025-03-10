
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { logJoinRequestEvent } from '../utils/logHelper.ts';
import { createOrUpdateMember } from '../utils/dbLogger.ts';
import { updateCommunityMemberCount } from '../utils/communityCountUtils.ts';
import { JoinRequestService } from './joinRequestService.ts';

/**
 * Handles chat join requests from Telegram
 * @param supabase Supabase client
 * @param update Telegram update object
 * @returns Response object
 */
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
    
    // Log the join request
    await logJoinRequestEvent(
      supabase,
      chatId,
      userId,
      username,
      'received',
      'User requested to join community',
      update.chat_join_request
    );
    
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
    
    // Initialize join request service
    const joinRequestService = new JoinRequestService(supabase, botToken);
    
    // Get community ID from the chat ID
    console.log(`[JOIN-REQUEST] 🔍 Finding community for chat ID: ${chatId}`);
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
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
    console.log(`[JOIN-REQUEST] ✅ Found community ID: ${communityId} (${community.name}) for chat ID: ${chatId}`);

    // Check if user has a subscription
    console.log(`[JOIN-REQUEST] 🔍 Checking if user ${userId} has an active subscription`);
    const { hasActiveSub, memberData } = await joinRequestService.checkSubscription(userId, username, communityId);

    // If they have an active subscription, approve them
    if (memberData && hasActiveSub) {
      console.log(`[JOIN-REQUEST] ✅ User ${userId} has an active subscription, approving join request`);
      await joinRequestService.approveJoinRequest(chatId, userId, username, 'Active subscription found');
      
      // Update the member record to ensure it's marked as active
      await createOrUpdateMember(supabase, {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: communityId,
        is_active: true
      });
      
      // Update community member count
      await updateCommunityMemberCount(supabase, communityId);
      
      return new Response(JSON.stringify({ success: true, message: 'Join request approved based on subscription' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // No active subscription record, check if there's a payment
    console.log(`[JOIN-REQUEST] 💰 No active subscription found, checking for payments for user ${userId}`);
    const payment = await joinRequestService.findPayment(userId, username, communityId);
    
    if (!payment) {
      console.log(`[JOIN-REQUEST] ❌ No payment found for user ${userId}, rejecting join request`);
      // No payment found, reject
      await joinRequestService.rejectJoinRequest(chatId, userId, username, 'No payment found');
      
      // Get Telegram bot settings
      const { data: botSettings } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('community_id', communityId)
        .single();
        
      if (botSettings) {
        console.log(`[JOIN-REQUEST] 📩 Sending payment instruction message to user ${userId}`);
        // Send a message to the user with payment instructions
        try {
          // Import the TelegramApiClient
          const { TelegramApiClient } = await import('../utils/telegramApiClient.ts');
          const telegramApi = new TelegramApiClient(botToken);
          
          // Get the community miniapp URL
          const { data: communityData } = await supabase
            .from('communities')
            .select('miniapp_url, name')
            .eq('id', communityId)
            .single();
            
          let paymentMessage = `To join *${communityData?.name || 'this community'}*, you need an active subscription.`;
          
          if (communityData?.miniapp_url) {
            paymentMessage += `\n\nYou can subscribe here: ${communityData.miniapp_url}`;
          }
          
          // Send message using the telegram API
          await telegramApi.sendMessage(userId, paymentMessage, 'Markdown');
          console.log(`[JOIN-REQUEST] ✅ Payment instructions sent to user ${userId}`);
        } catch (msgError) {
          console.error(`[JOIN-REQUEST] ❌ Error sending payment instructions to user:`, msgError);
        }
      }
      
      return new Response(JSON.stringify({ success: true, message: 'Join request rejected - no payment found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[JOIN-REQUEST] ✅ Found payment for user ${userId}, approving join request`);
    
    // Payment found, approve the join request
    await joinRequestService.approveJoinRequest(chatId, userId, username, 'Payment found');
      
    // Create member record based on payment
    const memberResult = await joinRequestService.createMemberFromPayment(userId, username, communityId, payment);
    console.log(`[JOIN-REQUEST] Member record creation result:`, memberResult);
    
    // Also update the payment record with the telegram_user_id if it's not set
    if (!payment.telegram_user_id && payment.telegram_user_id !== userId) {
      await joinRequestService.updatePaymentWithUserId(payment.id, userId);
    }
    
    // Update community member count
    await updateCommunityMemberCount(supabase, communityId);
    
    return new Response(JSON.stringify({ success: true, message: 'Join request approved based on payment' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[JOIN-REQUEST] ❌ Error handling chat join request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
