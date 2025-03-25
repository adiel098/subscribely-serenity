
/**
 * Text message sender for Telegram
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotToken } from "../../../botSettingsHandler.ts";
import { getValidatedMiniAppUrl } from "./senderCore.ts";

/**
 * Send a text message to a Telegram chat
 * @param supabase Supabase client
 * @param defaultBotToken Fallback bot token
 * @param communityId Community ID
 * @param chatId Target chat ID
 * @param text Message text
 * @param miniAppUrl Optional mini app URL for button
 * @returns Success status
 */
export async function sendTextMessage(
  supabase: ReturnType<typeof createClient>,
  defaultBotToken: string,
  communityId: string,
  chatId: string | number,
  text: string,
  miniAppUrl: string
): Promise<boolean> {
  try {
    console.log(`[TelegramSender] 📤 Sending text message to chat ${chatId}`);
    
    // Get the appropriate bot token for this community
    const botToken = await getBotToken(supabase, communityId, defaultBotToken);
    
    // Ensure we have a valid bot token and chat ID
    if (!botToken || !chatId) {
      console.error('[TelegramSender] ❌ Missing required parameters:', { 
        hasBotToken: !!botToken, 
        hasChatId: !!chatId 
      });
      return false;
    }
    
    // Validate the mini app URL
    const validatedUrl = getValidatedMiniAppUrl(miniAppUrl);
    
    // Send message without button if URL is invalid
    if (!validatedUrl) {
      const textOnlyPayload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      };
      
      const textOnlyResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textOnlyPayload)
      });
      
      const textOnlyData = await textOnlyResponse.json();
      return textOnlyData.ok;
    }
    
    // Prepare the inline keyboard with validated URL
    const inlineKeyboard = {
      inline_keyboard: [[
        {
          text: "Join Community🚀",
          web_app: { url: validatedUrl }
        }
      ]]
    };
    
    // Prepare the message payload
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(inlineKeyboard)
    };
    
    console.log('[TelegramSender] 📦 Message payload:', JSON.stringify(payload, null, 2));
    
    // Send the message
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Parse and check the response
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Failed to send text message:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Text message sent successfully:', data.result?.message_id);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Error sending text message:', error);
    return false;
  }
}
