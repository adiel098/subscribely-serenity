
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../cors.ts';
import { getLogger, logToDatabase } from '../services/loggerService.ts';
import { handleChannelPost } from '../handlers/channelPost.ts';
import { sendBroadcast } from '../handlers/broadcastHandler.ts';
import { handleMessageRoute } from '../handlers/routeHandlers/messageRouteHandler.ts';
import { handleJoinRequestRoute } from '../handlers/routeHandlers/joinRequestRouteHandler.ts';
import { handleCustomActionsRoute } from '../handlers/routeHandlers/customActionsRouteHandler.ts';
import { handleMemberRoute, handleMyChatMemberRoute } from '../handlers/routeHandlers/memberRouteHandler.ts';

const logger = getLogger('webhook-router');

export async function routeTelegramWebhook(req: Request, supabase: ReturnType<typeof createClient>, botToken: string) {
  try {
    // Get request body
    const update = await req.json();
    
    // Enhanced logging: Log the entire update for debugging
    logger.info(`📩 RECEIVED WEBHOOK: ${JSON.stringify(update)}`);
    
    // Check if this is a broadcast action (handled separately)
    if (update.action === 'broadcast') {
      logger.info(`📢 Processing broadcast action for community ${update.community_id}`);
      
      try {
        // Validate required parameters
        if (!update.community_id && !update.group_id) {
          throw new Error('Either community_id or group_id is required for broadcast');
        }
        
        if (!update.message) {
          throw new Error('Message content is required for broadcast');
        }
        
        const broadcastResult = await sendBroadcast(
          supabase,
          update.community_id || null,
          update.group_id || null,
          update.message || '',
          update.filter_type || 'all',
          update.subscription_plan_id,
          update.include_button || false,
          update.image || null
        );
        
        logger.info(`📊 Broadcast completed with results: ${JSON.stringify(broadcastResult)}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            successCount: broadcastResult.successCount,
            failureCount: broadcastResult.failureCount,
            totalRecipients: broadcastResult.totalRecipients
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (broadcastError) {
        logger.error(`❌ Error in broadcast operation: ${broadcastError.message}`, broadcastError);
        
        return new Response(
          JSON.stringify({ 
            error: broadcastError.message, 
            success: false
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    }
    
    // Log basic information about the update
    logger.info(`Processing webhook update: ${JSON.stringify(update).substring(0, 200)}...`);
    
    const chatId = update.message?.chat?.id || 
                  update.edited_message?.chat?.id || 
                  update.channel_post?.chat?.id || 
                  update.callback_query?.message?.chat?.id ||
                  update.chat_join_request?.chat?.id ||
                  update.chat_member?.chat?.id ||
                  update.my_chat_member?.chat?.id ||
                  'Not provided';
                  
    logger.info(`📝 Group/Chat ID: ${chatId}`);
    
    // Use dedicated handlers based on update type
    let result = null;
    
    // Process different types of updates using specialized handlers
    if (update.message) {
      logger.info(`💬 Routing message update to message handler`);
      // Enhanced logging for message content
      if (update.message.text) {
        logger.info(`📨 Message text: "${update.message.text}"`);
        if (update.message.text.startsWith('/')) {
          logger.info(`🤖 COMMAND DETECTED: ${update.message.text}`);
        }
      }
      const { handled, response } = await handleMessageRoute(supabase, update.message, botToken);
      logger.info(`Message handler result: handled=${handled}, has response=${!!response}`);
      if (response) return response;
      if (handled) result = { success: true };
    } 
    else if (update.callback_query) {
      logger.info(`🎮 Routing callback query to custom actions handler`);
      const { handled, response } = await handleCustomActionsRoute(supabase, update.callback_query, botToken);
      if (response) return response;
      if (handled) result = { success: true };
    } 
    else if (update.chat_join_request) {
      logger.info(`🔑 Routing chat join request to join request handler`);
      const { handled, response } = await handleJoinRequestRoute(supabase, update.chat_join_request, botToken);
      if (response) return response;
      if (handled) result = { success: true };
    } 
    else if (update.chat_member) {
      logger.info(`👥 Routing chat member update to member handler`);
      const { handled, response } = await handleMemberRoute(supabase, update.chat_member, botToken);
      if (response) return response;
      if (handled) result = { success: true };
    } 
    else if (update.my_chat_member) {
      logger.info(`🤖 Routing my chat member update to my member handler`);
      const { handled, response } = await handleMyChatMemberRoute(supabase, update.my_chat_member, botToken);
      if (response) return response;
      if (handled) result = { success: true };
    } 
    else if (update.channel_post) {
      logger.info(`📢 Processing channel post update for chat ${update.channel_post.chat.id}`);
      await handleChannelPost(supabase, update);
      result = { success: true };
    }
    
    // If we haven't handled the update with a specialized handler
    if (!result) {
      logger.warn(`⚠️ Unhandled update type: ${Object.keys(update).join(', ')}`);
      
      // Log unhandled update
      await logToDatabase(supabase, 'WEBHOOK', 'INFO', 'Unhandled update type', { 
        update_types: Object.keys(update).join(', '),
        chat_id: chatId
      });
      
      result = { success: true, message: 'Unhandled update type' };
    }
    
    // Log the outgoing response
    logger.info(`✅ Webhook handled successfully: ${JSON.stringify(result)}`);
    
    // Return success response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error(`Error in routeTelegramWebhook: ${error.message}`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
