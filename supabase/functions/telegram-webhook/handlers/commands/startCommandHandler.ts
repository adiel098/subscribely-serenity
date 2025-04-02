
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { findCommunityByIdOrLink } from '../../communityHandler.ts';
import { getBotToken } from '../../botSettingsHandler.ts';
import { createLogger } from '../../services/loggingService.ts';
import { getMiniAppUrl } from '../../utils/botUtils.ts';

/**
 * Handle /start command which is used to join a community
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  params: string,
  defaultBotToken: string
) {
  // Create logger specifically for this command
  const logger = createLogger(supabase, 'COMMUNITY-START-COMMAND');
  
  try {
    const chatId = message.chat.id.toString();
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    await logger.info(`Processing /start command from user ${userId} (${username || 'no username'}) in chat ${chatId}`);
    await logger.info(`Command parameters: "${params}"`);
    
    if (!params) {
      // If no community ID provided, just send a welcome message
      await logger.info(`No community ID provided, sending generic welcome message`);
      await sendTelegramMessage(
        `Welcome to our community platform bot! 👋\n\nTo join a specific community, you need to use a start link provided by the community owner.`,
        chatId,
        defaultBotToken
      );
      return { success: true };
    }
    
    // Find the community by ID or custom link
    await logger.info(`Looking up community with identifier: ${params}`);
    const community = await findCommunityByIdOrLink(supabase, params);
    
    if (!community) {
      await logger.error(`❌ Community not found for identifier: ${params}`);
      await sendTelegramMessage(
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`,
        chatId,
        defaultBotToken
      );
      return { success: false, error: 'Community not found' };
    }
    
    await logger.success(`✅ Found community: ${community.name} (ID: ${community.id})`);
    
    // Get the bot token for this community (could be custom or default)
    const botToken = await getBotToken(supabase, community.id, defaultBotToken);
    
    // Generate mini app URL using the utility function for consistency
    const miniAppUrl = getMiniAppUrl(community.custom_link || community.id);
    
    await logger.info(`Mini app URL generated: ${miniAppUrl}`);
    
    // Send a welcome message with the mini app button
    const message = `Welcome to *${community.name}*! 🎉\n\nTo join this community and access exclusive content, please subscribe using the button below:`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: { url: miniAppUrl }
          }
        ]
      ]
    };
    
    await sendTelegramMessage(message, chatId, botToken, inlineKeyboard);
    await logger.info(`Welcome message sent to user ${userId} for community ${community.name}`);
    
    return { success: true };
  } catch (error) {
    await logger.error(`Error in handleStartCommand:`, error);
    
    try {
      // Send generic error message to the user
      await sendTelegramMessage(
        `Sorry, there was an error processing your request. Please try again later.`,
        message.chat.id.toString(),
        defaultBotToken
      );
    } catch (sendError) {
      await logger.error(`Error sending error message:`, sendError);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(
  text: string, 
  chatId: string, 
  botToken: string,
  replyMarkup: any = null
) {
  console.log(`Sending message to chat ${chatId}`);
  
  const messageData: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };
  
  if (replyMarkup) {
    messageData.reply_markup = JSON.stringify(replyMarkup);
  }
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send Telegram message: ${errorText}`);
  }
  
  return await response.json();
}
