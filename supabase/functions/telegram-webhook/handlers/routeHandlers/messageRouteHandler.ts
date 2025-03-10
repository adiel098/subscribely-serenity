
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { updateMemberActivity } from '../../handlers/utils/activityUtils.ts';
import { logUserInteraction } from '../../handlers/utils/logHelper.ts';
import { handleStartCommand } from '../../handlers/startCommandHandler.ts';
import { handleChannelVerification } from '../../handlers/channelVerificationHandler.ts';
import { handleVerificationMessage } from '../../handlers/verificationHandler.ts';
import { corsHeaders } from '../../cors.ts';

/**
 * Handler for regular message events from Telegram webhook
 */
export async function handleMessageRoute(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<{ handled: boolean, response?: Response }> {
  console.log('[MESSAGE-ROUTE] 🗨️ Processing message:', JSON.stringify(message, null, 2));

  // Update user activity if we have a user ID
  if (message.from?.id) {
    await updateMemberActivity(supabase, message.from.id.toString());
  }

  let handled = false;

  // Route: Start Command - IMPORTANT: Check this first before other content tests
  if (message.text && message.text.startsWith('/start')) {
    console.log("[MESSAGE-ROUTE] 🚀 ROUTING TO START COMMAND with params:", message.text);
    
    // Parse the start parameter if any
    const startParams = message.text.split(' ');
    const startParam = startParams.length > 1 ? startParams[1] : null;
    
    if (startParam) {
      console.log(`[MESSAGE-ROUTE] 📎 Start command includes parameter: "${startParam}"`);
      
      // Check if it might be a custom link
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(startParam);
      if (!isUUID) {
        console.log(`[MESSAGE-ROUTE] 🔗 Parameter appears to be a custom link: ${startParam}`);
      }
    }
    
    try {
      handled = await handleStartCommand(supabase, message, botToken);
      console.log(`[MESSAGE-ROUTE] ${handled ? '✅' : '❌'} Start command ${handled ? 'handled successfully' : 'not handled'}`);
    } catch (startError) {
      console.error('[MESSAGE-ROUTE] ❌ Error in start command handler:', startError);
      await supabase.from('telegram_errors').insert({
        error_type: 'start_command_handler_error',
        error_message: startError.message,
        stack_trace: startError.stack,
        raw_data: message
      });
      handled = false;
    }
  }
  // Route: Channel Verification
  else if (['group', 'supergroup', 'channel'].includes(message.chat?.type) && message.text?.includes('MBF_')) {
    console.log("[MESSAGE-ROUTE] 🔄 Routing to channel verification handler");
    handled = await handleChannelVerification(supabase, message, botToken);
    console.log(`[MESSAGE-ROUTE] ${handled ? '✅' : '❌'} Channel verification ${handled ? 'handled successfully' : 'not handled'}`);
  }
  // Route: Verification Message
  else if (message.text?.startsWith('MBF_')) {
    console.log("[MESSAGE-ROUTE] 🔄 Routing to verification message handler");
    handled = await handleVerificationMessage(supabase, message);
    console.log(`[MESSAGE-ROUTE] ${handled ? '✅' : '❌'} Verification ${handled ? 'handled successfully' : 'not handled'}`);
  }

  return { handled };
}
