
/**
 * Photo message sender for Telegram
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotToken } from "../../../botSettingsHandler.ts";
import { getValidatedMiniAppUrl } from "./senderCore.ts";
import { isValidPhotoSource } from "../../../utils/telegram/photoMessages.ts";

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
    if (!botToken || !chatId) {
      console.error('[TelegramSender] ❌ Missing required parameters:', { 
        hasBotToken: !!botToken, 
        hasChatId: !!chatId
      });
      return false;
    }
    
    // Validate the photo URL
    const validPhotoUrl = photoUrl && isValidPhotoSource(photoUrl) ? photoUrl : null;
    
    // Validate the mini app URL
    const validatedUrl = getValidatedMiniAppUrl(miniAppUrl);
    
    // Prepare the inline keyboard with validated URL
    const inlineKeyboard = validatedUrl ? {
      inline_keyboard: [[
        {
          text: "Join Community🚀",
          web_app: { url: validatedUrl }
        }
      ]]
    } : null;
    
    // If photo is invalid, send text-only message
    if (!validPhotoUrl) {
      console.log('[TelegramSender] ⚠️ Invalid photo URL, sending text-only message');
      const textOnlyPayload = {
        chat_id: chatId,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };
      
      if (inlineKeyboard) {
        textOnlyPayload.reply_markup = JSON.stringify(inlineKeyboard);
      }
      
      const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textOnlyPayload)
      });
      
      const textData = await textResponse.json();
      
      if (!textData.ok) {
        console.error('[TelegramSender] ❌ Failed to send text message:', textData.description);
      }
      
      return textData.ok;
    }
    
    // Prepare the photo message payload
    const payload = {
      chat_id: chatId,
      photo: validPhotoUrl,
      caption: caption,
      parse_mode: 'HTML'
    };
    
    // Add reply markup if available
    if (inlineKeyboard) {
      payload.reply_markup = JSON.stringify(inlineKeyboard);
    }
    
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
      console.error('[TelegramSender] ❌ Failed to send photo message:', data.description);
      
      // Fallback to text message
      console.log('[TelegramSender] Attempting fallback to text message');
      const textPayload = {
        chat_id: chatId,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };
      
      if (inlineKeyboard) {
        textPayload.reply_markup = JSON.stringify(inlineKeyboard);
      }
      
      const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textPayload)
      });
      
      const textData = await textResponse.json();
      return textData.ok;
    }
    
    console.log('[TelegramSender] ✅ Photo message sent successfully:', data.result?.message_id);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Error sending photo message:', error);
    return false;
  }
}
