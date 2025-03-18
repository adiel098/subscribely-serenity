
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { handleCommand } from '../commandHandler.ts';
import { createLogger } from '../../services/loggingService.ts';

export async function handleMessageRoute(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MESSAGE-ROUTE');
  
  try {
    await logger.info(`🔄 Processing message from ${message.from?.id || 'unknown'}`);
    
    // Check if it's a command
    if (message.text && message.text.startsWith('/')) {
      await logger.info(`💬 Detected command: ${message.text}`);
      const handled = await handleCommand(supabase, message, botToken);
      
      await logger.info(`Command ${handled ? 'handled successfully' : 'not handled'}`);
      return {
        handled: true,
        response: null
      };
    }
    
    // Handle regular messages
    await logger.info(`💬 Regular message processed`);
    
    return {
      handled: true,
      response: null
    };
  } catch (error) {
    await logger.error(`❌ Error handling message:`, error);
    
    return {
      handled: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error in message handler"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    };
  }
}
