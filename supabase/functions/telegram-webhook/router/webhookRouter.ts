
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger } from '../services/loggerService.ts';
import { corsHeaders } from '../cors.ts';
import { handleMemberRemoval } from '../services/memberRemovalService.ts';

// Create a logger for this module
const logger = getLogger('webhook-router');

export async function routeTelegramWebhook(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  botToken: string
): Promise<Response> {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Handle webhook path routing for custom endpoints 
    const url = new URL(req.url);
    const path = body.path || url.searchParams.get('path');
    
    if (path) {
      logger.info(`Routing to custom path: ${path}`);
      
      // Handle different path-based actions
      switch (path) {
        case '/update-activity':
          // Handle activity update endpoint
          logger.info('Processing activity update request');
          // We would implement activity update logic here
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        case '/remove-member':
          // Handle member removal endpoint
          logger.info('Processing member removal request');
          
          // Extract the chat_id, user_id and reason from the request body
          const { chat_id, user_id, reason = 'removed' } = body;
          
          if (!chat_id || !user_id) {
            logger.error('Missing required parameters: chat_id or user_id');
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Missing required parameters: chat_id and user_id are required' 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
              }
            );
          }
          
          // Call the member removal service
          return await handleMemberRemoval(supabase, chat_id, user_id, botToken, body.community_id, reason);
          
        // Add other custom endpoints as needed
        default:
          logger.warn(`Unknown path: ${path}`);
          return new Response(
            JSON.stringify({ success: false, error: `Unknown path: ${path}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404
            }
          );
      }
    }
    
    // Handle standard Telegram webhook update
    if (body.update_id) {
      logger.info(`Processing webhook update: ${JSON.stringify(body).substring(0, 100)}...`);
      
      // Process different update types
      if (body.message) {
        logger.info(`Routing message to message handler`);
        // We would implement message handling logic here
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (body.callback_query) {
        logger.info(`Routing callback query to callback handler`);
        // We would implement callback query handling logic here
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (body.chat_member) {
        logger.info(`Routing chat member update to member handler`);
        // We would implement chat member handling logic here
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log unknown update types
      logger.warn(`Unhandled update type`);
      return new Response(
        JSON.stringify({ success: true, message: 'Update received but not processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle case where the request doesn't match any known format
    logger.error(`Unrecognized request format`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unrecognized request format' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
