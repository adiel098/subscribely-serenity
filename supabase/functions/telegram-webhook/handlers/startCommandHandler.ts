
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchStartCommandData } from './utils/dataSources.ts';
import { logUserInteraction } from './utils/logHelper.ts';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';

/**
 * Handle /start command with optional parameters
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log('🚀 [START-COMMAND] Starting command handler with message:', JSON.stringify(message, null, 2));

    // Extract the parameter from /start command
    // Format: /start OR /start param1_param2
    const text = message.text || '';
    const parts = text.split(' ');
    
    console.log(`[START-COMMAND] 📝 Command parts: ${JSON.stringify(parts)}`);
    
    // If no parameters, just send a welcome message
    if (parts.length === 1 || !parts[1]) {
      console.log('[START-COMMAND] ℹ️ No parameters provided in start command');
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        'Welcome to MembershipBot! 🚀\n\nTo get started, visit our website and connect your community.',
        null  // No photo
      );
      
      // Log the interaction
      await logUserInteraction(
        supabase,
        'start_command_basic',
        message.from.id.toString(),
        message.from.username,
        text,
        message
      );
      
      return true;
    }
    
    // Handle parameterized start command
    const startParam = parts[1];
    console.log(`[START-COMMAND] 🔍 Processing start parameter: ${startParam}`);
    
    // Check if it's a community ID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(startParam)) {
      console.log(`[START-COMMAND] ✅ Valid community ID format: ${startParam}`);
      
      // Fetch community data 
      const dataResult = await fetchStartCommandData(supabase, startParam);
      console.log(`[START-COMMAND] Data fetch result:`, JSON.stringify(dataResult, null, 2));
      
      if (!dataResult.success) {
        console.error(`[START-COMMAND] ❌ Error fetching data: ${dataResult.error}`);
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Sorry, I couldn't find that community. 😕\n\nPlease check the link and try again.`,
          null  // No photo
        );
        
        await logUserInteraction(
          supabase,
          'start_command_invalid_community',
          message.from.id.toString(),
          message.from.username,
          text,
          {message, error: dataResult.error}
        );
        
        return true;
      }
      
      const { community, botSettings } = dataResult;
      console.log(`[START-COMMAND] 📋 Community found: ${community.name}`);
      
      // Construct welcome message
      let welcomeMessage = botSettings.welcome_message || 
        `Welcome to ${community.name}! 🎉\n\nTo access this community, you need to purchase a subscription.`;
      
      const miniAppUrl = community.miniapp_url || "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
      const welcomeImage = botSettings.welcome_image || null;
      
      // Add call-to-action button
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "הצטרף לקהילה 🚀",
              web_app: {
                url: `${miniAppUrl}?start=${community.id}`
              }
            }
          ]
        ]
      };
      
      console.log(`[START-COMMAND] 📤 Sending welcome message with image: ${!!welcomeImage}`);
      console.log(`[START-COMMAND] 🔗 Mini app URL: ${miniAppUrl}?start=${community.id}`);
      
      // Send welcome message with photo if available
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        welcomeMessage,
        welcomeImage,
        inlineKeyboard
      );
      
      // Log the interaction
      await logUserInteraction(
        supabase,
        'start_command_community',
        message.from.id.toString(),
        message.from.username,
        text,
        {message, community_id: community.id}
      );
      
      return true;
    }
    
    // It's not a valid community ID
    console.log(`[START-COMMAND] ⚠️ Invalid community ID format: ${startParam}`);
    
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      `Sorry, that doesn't look like a valid community link. 😕\n\nPlease check the link and try again.`,
      null  // No photo
    );
    
    await logUserInteraction(
      supabase,
      'start_command_invalid_format',
      message.from.id.toString(),
      message.from.username,
      text,
      message
    );
    
    return true;
    
  } catch (error) {
    console.error('[START-COMMAND] ❌ Error in handleStartCommand:', error);
    
    try {
      // Log the error
      await supabase.from('telegram_errors').insert({
        error_type: 'start_command_error',
        error_message: error.message,
        stack_trace: error.stack,
        raw_data: message
      });
      
      // Try to send an error message to the user
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Sorry, something went wrong processing your request. 😕\n\nPlease try again later.`,
        null  // No photo
      );
    } catch (logError) {
      console.error('[START-COMMAND] ❌ Error logging the original error:', logError);
    }
    
    return false;
  }
}
