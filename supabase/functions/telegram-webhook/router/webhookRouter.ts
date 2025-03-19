
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../cors.ts';
import { getLogger, logToDatabase } from '../services/loggerService.ts';
import { handleVerificationMessage } from '../handlers/verificationHandler.ts';
import { handleChannelPost } from '../handlers/channelPost.ts';

const logger = getLogger('webhook-router');

export async function routeTelegramWebhook(req: Request, supabase: ReturnType<typeof createClient>, botToken: string) {
  try {
    // Get request body
    const update = await req.json();
    logger.info(`Processing webhook update: ${JSON.stringify(update).substring(0, 200)}...`);
    
    // Log basic information about the update
    const chatId = update.message?.chat?.id || 
                  update.edited_message?.chat?.id || 
                  update.channel_post?.chat?.id || 
                  update.callback_query?.message?.chat?.id || 
                  'Not provided';
                  
    logger.info(`📝 Group ID: ${chatId}`);
    
    // Process different types of updates
    if (update.channel_post) {
      logger.info(`📢 Processing channel post update for chat ${update.channel_post.chat.id}`);
      await handleChannelPost(supabase, update);
    } else if (update.message) {
      logger.info(`💬 Processing message update for chat ${update.message.chat.id}`);
      
      // Check if this is a verification message
      if (update.message.text?.startsWith('MBF_')) {
        logger.info(`🔑 Detected verification code message: ${update.message.text}`);
        await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Received verification message', {
          code: update.message.text,
          chat_id: update.message.chat.id,
          from_id: update.message.from?.id,
          chat_type: update.message.chat.type
        });
        
        const handled = await handleVerificationMessage(supabase, update.message);
        logger.info(`Verification ${handled ? 'succeeded' : 'failed'}`);
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
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
