
/**
 * Photo message sender for Telegram
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotToken } from "../../../botSettingsHandler.ts";
import { getValidatedMiniAppUrl } from "./senderCore.ts";

/**
 * Send a photo message to a Telegram chat
 * @param supabase Supabase client
 * @param defaultBotToken Fallback bot token
 * @param communityId Community ID
 * @param chatId Target chat ID
 * @param photoUrl URL of the photo to send
 * @param caption Optional caption for the photo
 * @param miniAppUrl Optional mini app URL for button
 * @returns Success status
 */
export async function sendPhotoMessage(
  supabase: ReturnType<typeof createClient>,
  defaultBotToken: string,
  communityId: string,
  chatId: string | number,
  photoUrl: string,
  caption: string,
  miniAppUrl: string
): Promise<boolean> {
  try {
    console.log(`[TelegramSender] 🖼️ Sending photo message to chat ${chatId}`);
    
    // Get the appropriate bot token for this community
    const botToken = await getBotToken(supabase, communityId, defaultBotToken);
    
    // Ensure we have all required parameters
    if (!botToken || !chatId || !photoUrl) {
      console.error('[TelegramSender] ❌ Missing required parameters:', { 
        hasBotToken: !!botToken, 
        hasChatId: !!chatId,
        hasPhotoUrl: !!photoUrl
      });
      return false;
    }
    
    // Validate the mini app URL
    const validatedUrl = getValidatedMiniAppUrl(miniAppUrl);
    
    // Send photo without button if URL is invalid
    if (!validatedUrl) {
      const photoOnlyPayload = {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML'
      };
      
      const photoOnlyResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoOnlyPayload)
      });
      
      const photoOnlyData = await photoOnlyResponse.json();
      return photoOnlyData.ok;
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
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(inlineKeyboard)
    };
    
    console.log('[TelegramSender] 📦 Photo message payload:', JSON.stringify(payload, null, 2));
    
    // Send the message
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Parse and check the response
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Failed to send photo message:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Photo message sent successfully:', data.result?.message_id);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Error sending photo message:', error);
    return false;
  }
}
