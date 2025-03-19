
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { handleCommand } from '../commandHandler.ts';
import { handleVerificationMessage } from '../verification/verificationHandler.ts';
import { createLogger } from '../../services/loggingService.ts';

export async function handleMessageRoute(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MESSAGE-ROUTE');
  
  try {
    await logger.info(`🔄 Processing message from ${message.from?.id || 'unknown'}`);
    
    // Enhanced logging for message content
    if (message.text) {
      await logger.info(`📨 Message content: "${message.text}"`);
    }
    
    // First check if it's a verification message (starting with MBF_)
    if (message.text?.startsWith('MBF_')) {
      await logger.info(`🔑 Detected verification code message: ${message.text}`);
      const handled = await handleVerificationMessage(supabase, message);
      
      await logger.info(`Verification ${handled ? 'succeeded' : 'failed'}`);
      return {
        handled: true,
        response: null
      };
    }
    
    // If not a verification message, check if it's a command
    if (message.text && message.text.startsWith('/')) {
      await logger.info(`💬 Detected command: ${message.text}`);
      
      // Special logging for start command
      if (message.text.startsWith('/start')) {
        await logger.info(`🚀🚀🚀 START COMMAND DETECTED from user ${message.from?.id}, chat ${message.chat?.id}`);
        // Log the full message object for debugging
        await logger.info(`Start command full message: ${JSON.stringify(message)}`);
      }
      
      const handled = await handleCommand(supabase, message, botToken);
      
      await logger.info(`Command ${handled ? 'handled successfully' : 'not handled'}`);
      return {
        handled: true,
        response: null
      };
    }
    
    // Handle regular messages (not verification code or command)
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
