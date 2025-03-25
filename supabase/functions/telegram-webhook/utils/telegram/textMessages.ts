/**
 * Utilities for sending text messages via Telegram Bot API
 */
import { validateInlineKeyboard } from './coreClient.ts';
import { sendPhotoWithCaption } from './photoMessages.ts';

/**
 * Send a text message to a Telegram user with optional inline keyboard
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  inlineKeyboard: any = null,
  image: string | null = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    console.log(`[TELEGRAM-MESSENGER] Sending message to ${chatId}`);
    console.log(`[TELEGRAM-MESSENGER] Message: ${text ? text.substring(0, 50) + '...' : 'No text'}`);
    console.log(`[TELEGRAM-MESSENGER] Has image: ${!!image}`);
    console.log(`[TELEGRAM-MESSENGER] Has inline keyboard: ${!!inlineKeyboard}`);
    
    // Validate inline keyboard if provided
    if (inlineKeyboard) {
      // Check for web_app URLs and validate them
      const validated = validateInlineKeyboard(inlineKeyboard);
      if (!validated.valid) {
        console.warn(`[TELEGRAM-MESSENGER] ⚠️ Invalid keyboard detected: ${validated.reason}`);
        // Continue without the keyboard if it's invalid
        inlineKeyboard = null;
      }
    }
    
    if (image) {
      // If we have an image, send as photo with caption
      return await sendPhotoWithCaption(botToken, chatId, image, text, inlineKeyboard);
    } else {
      // Otherwise send as text message
      return await sendTextOnlyMessage(botToken, chatId, text, inlineKeyboard);
    }
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] Error sending message:`, error);
    return { ok: false, description: error.message || 'Unknown error' };
  }
}

/**
 * Send a text-only message to a Telegram user with optional inline keyboard
 */
async function sendTextOnlyMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  inlineKeyboard: any = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    console.log(`[TELEGRAM-MESSENGER] Sending text message to ${chatId}`);
    
    // Create the request payload
    const payload: any = {
      chat_id: chatId,
      text: text || "📢 Message from community owner",
      parse_mode: "HTML"
    };

    // Add reply markup if provided
    if (inlineKeyboard) {
      if (typeof inlineKeyboard === 'string') {
        try {
          // If it's a string, parse it to ensure it's valid JSON
          payload.reply_markup = JSON.parse(inlineKeyboard);
          console.log(`[TELEGRAM-MESSENGER] Using parsed inline keyboard`);
        } catch (e) {
          console.error(`[TELEGRAM-MESSENGER] Failed to parse inline keyboard:`, e);
          // If parsing fails, don't add the keyboard
        }
      } else {
        // If it's already an object, use it directly
        payload.reply_markup = inlineKeyboard;
        console.log(`[TELEGRAM-MESSENGER] Using object inline keyboard`);
      }
      
      console.log(`[TELEGRAM-MESSENGER] Inline keyboard:`, JSON.stringify(payload.reply_markup));
    }

    // Make the API request
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    // Parse the response
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, result);
      return { ok: false, description: result.description || 'Unknown Telegram API error' };
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Message sent successfully`);
    return { ok: true };
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending text message:`, error);
    return { ok: false, description: error.message || 'Unknown error sending text message' };
  }
}

// Re-export the function for direct import
export { sendTextOnlyMessage };
