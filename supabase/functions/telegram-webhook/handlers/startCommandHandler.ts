
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { findCommunityByIdOrLink } from '../communityHandler.ts';
import { sendTelegramMessage, isValidTelegramUrl, isValidPhotoSource } from '../utils/telegramMessenger.ts';
import { createLogger } from '../services/loggingService.ts';

// Constant for the mini app URL
export const MINI_APP_WEB_URL = 'https://preview--subscribely-serenity.lovable.app/telegram-mini-app';
export const TELEGRAM_MINI_APP_URL = 'https://t.me/YourBotUsername/app';

/**
 * Handle the /start command from a Telegram user
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<{ success: boolean; error?: string }> {
  const logger = createLogger(supabase, 'START-COMMAND');
  
  try {
    await logger.info("🚀 Handling /start command");
    
    // Check if this is a response to the start command
    if (!message?.text || !message.text.startsWith('/start')) {
      await logger.info("⏭️ Not a start command, skipping");
      return { success: false, error: "Not a start command" };
    }
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    await logger.info(`👤 User ID: ${userId}, Username: ${username || 'none'}`);
    
    // Parse start parameters if any
    const startParams = message.text.split(' ');
    const startParam = startParams.length > 1 ? startParams[1] : null;
    
    await logger.info(`🔍 Start parameter: ${startParam || 'none'}`);
    
    // Route to the appropriate handler based on the parameter
    if (startParam) {
      if (startParam.startsWith('group_')) {
        // This is a group code
        const groupId = startParam.substring(6);
        await logger.info(`👥👥👥 Group parameter detected: ${groupId}`);
        return await handleGroupStartCommand(supabase, message, botToken, groupId);
      } else {
        // This is a community code
        await logger.info(`🏢 Community parameter detected: ${startParam}`);
        return await handleCommunityStartCommand(supabase, message, botToken, startParam);
      }
    } else {
      // No parameter provided, send welcome message with Mini App button
      await logger.info("👋 No parameter, sending discovery welcome message");
      
      // Get the mini app URL - this needs to be the web_app URL that starts with https://
      const miniAppUrl = MINI_APP_WEB_URL;
      await logger.info(`Using Mini App Web URL: ${miniAppUrl}`);
      
      const welcomeMessage = `
👋 <b>Welcome to Membify!</b>

Discover and join premium Telegram communities, manage your subscriptions, and track your membership payments - all in one place!

Press the button below to explore communities:
      `;
      
      // Make sure the URL is valid for Telegram web_app buttons
      if (!isValidTelegramUrl(miniAppUrl)) {
        await logger.error(`❌ Invalid mini app URL format: ${miniAppUrl}`);
        
        // Send message without button if URL is invalid
        const simpleResult = await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
        return { success: simpleResult.ok, error: simpleResult.description };
      }
      
      // Create inline keyboard with web_app button
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🔍 Discover Communities",
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      };
      
      await logger.info(`Sending welcome message with button URL: ${miniAppUrl}`);
      
      const result = await sendTelegramMessage(
        botToken, 
        message.chat.id, 
        welcomeMessage, 
        inlineKeyboard
      );
      
      if (!result.ok) {
        await logger.error(`❌ Failed to send welcome message: ${result.description}`);
        
        // Try sending message without button as fallback
        const fallbackResult = await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
        return { success: fallbackResult.ok, error: fallbackResult.description };
      } else {
        await logger.info(`✅ Welcome message sent successfully`);
      }
      
      return { success: true };
    }
  } catch (error) {
    await logger.error("❌ Error handling start command:", error);
    
    // Log the error
    await supabase.from('telegram_errors').insert({
      error_type: 'start_command_error',
      error_message: error.message,
      stack_trace: error.stack,
      raw_data: message
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Handle /start command with a group parameter
 */
async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any, 
  botToken: string,
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  const logger = createLogger(supabase, 'GROUP-START-COMMAND');
  
  try {
    await logger.info(`Processing group start command for ID: ${groupId}`);
    
    // Send a generic response for now - you can implement this fully later
    const response = await sendTelegramMessage(
      botToken,
      message.chat.id,
      `<b>Welcome to Group!</b>\n\nThis feature is coming soon. Stay tuned!`
    );
    
    return { success: response.ok, error: response.description };
  } catch (error) {
    await logger.error(`Error processing group start command:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle /start command with a community parameter
 */
async function handleCommunityStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any, 
  botToken: string,
  communityIdOrLink: string
): Promise<{ success: boolean; error?: string }> {
  const logger = createLogger(supabase, 'COMMUNITY-START-COMMAND');
  
  try {
    await logger.info(`🏢 Processing community start command for identifier: ${communityIdOrLink}`);
    
    // Find the community
    const community = await findCommunityByIdOrLink(supabase, communityIdOrLink);
    
    if (!community) {
      await logger.error(`❌ Community not found for identifier: ${communityIdOrLink}`);
      
      const errorResult = await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      
      return { success: false, error: "Community not found" };
    }
    
    await logger.success(`✅ Found community: ${community.name} (ID: ${community.id})`);
    
    // Fetch welcome message from bot settings
    const { data: botSettings, error: botSettingsError } = await supabase
      .from('telegram_bot_settings')
      .select('welcome_message, welcome_image, auto_welcome_message')
      .eq('community_id', community.id)
      .single();
      
    // Default welcome message if not found
    let welcomeMessage = `
<b>Welcome to ${community.name}!</b> 🎉

To join this community and access exclusive content, please subscribe using the button below:
    `;
    
    let welcomeImage = null;
    
    // Use custom welcome message if available
    if (!botSettingsError && botSettings) {
      if (botSettings.welcome_message) {
        welcomeMessage = botSettings.welcome_message;
        await logger.info(`Using custom welcome message from bot settings`);
      }
      
      if (botSettings.welcome_image) {
        welcomeImage = botSettings.welcome_image;
        await logger.info(`Using custom welcome image from bot settings`);
        
        // Log a preview of the image data to help debug
        const imageSample = typeof welcomeImage === 'string' ? 
          welcomeImage.substring(0, 50) + '...' : 'null';
        await logger.info(`Image data sample: ${imageSample}`);
        
        // Validate image data
        if (welcomeImage && !isValidPhotoSource(welcomeImage)) {
          await logger.warn(`⚠️ Welcome image appears to be invalid, will fallback to text-only message`);
          welcomeImage = null;
        }
      }
    } else {
      await logger.warn(`No bot settings found for community ${community.id}, using default message`);
    }
    
    // Generate mini app URL with the community ID or custom link
    const communityParam = community.custom_link || community.id;
    const miniAppUrl = `${MINI_APP_WEB_URL}?community=${encodeURIComponent(communityParam)}`;
    
    await logger.info(`Mini App URL: ${miniAppUrl}`);
    
    // Create inline keyboard with web_app button
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "💳 Subscribe Now",
            web_app: { url: miniAppUrl }
          }
        ]
      ]
    };
    
    // Send welcome message with image if available
    const result = await sendTelegramMessage(
      botToken,
      message.chat.id,
      welcomeMessage,
      inlineKeyboard,
      welcomeImage
    );
    
    if (!result.ok) {
      await logger.error(`❌ Failed to send community welcome message: ${result.description}`);
      return { success: false, error: result.description };
    }
    
    await logger.info(`✅ Community welcome message sent successfully`);
    return { success: true };
  } catch (error) {
    await logger.error(`Error in community start command:`, error);
    return { success: false, error: error.message };
  }
}
