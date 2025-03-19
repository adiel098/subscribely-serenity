
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { createLogger } from '../../services/loggingService.ts';

export async function handleJoinRequestRoute(
  supabase: ReturnType<typeof createClient>,
  joinRequest: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'JOIN-REQUEST-ROUTER');
  
  try {
    await logger.info(`🔄 Processing join request from ${joinRequest.from?.id || 'unknown'}`);
    
    // Process the join request
    // 1. Check if user has an active subscription
    const userId = joinRequest.from.id.toString();
    const chatId = joinRequest.chat.id.toString();
    
    await logger.info(`🔍 Checking subscription for user ${userId} in chat ${chatId}`);
    
    // Get community information based on chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (communityError || !community) {
      await logger.error(`❌ Community not found for chat ${chatId}`);
      return {
        handled: true,
        response: null
      };
    }
    
    // Check if user has an active subscription for this community
    const { data: subscription, error: subscriptionError } = await supabase
      .from('community_subscribers')
      .select('subscription_status')
      .eq('telegram_user_id', userId)
      .eq('community_id', community.id)
      .single();
      
    // If user has an active subscription, approve the join request
    if (subscription && subscription.subscription_status === 'active') {
      await logger.info(`✅ User ${userId} has active subscription, approving join request`);
      
      // Approve join request
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: userId
          })
        });
        
        const result = await response.json();
        
        if (result.ok) {
          await logger.success(`✅ Successfully approved join request for user ${userId}`);
        } else {
          await logger.error(`❌ Failed to approve join request: ${result.description}`);
        }
      } catch (error) {
        await logger.error(`❌ Error approving join request:`, error);
      }
    } else {
      await logger.info(`⚠️ User ${userId} does not have an active subscription`);
      // Optionally: Send user a message about subscription requirements
    }
    
    await logger.info(`✅ Join request processed`);
    
    return {
      handled: true,
      response: null
    };
  } catch (error) {
    await logger.error(`❌ Error handling join request:`, error);
    
    return {
      handled: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error in join request handler"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    };
  }
}
