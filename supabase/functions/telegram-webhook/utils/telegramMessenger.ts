
/**
 * Utility for sending messages via Telegram Bot API
 */

// Define the response type
interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: any;
}

/**
 * Send a message to Telegram user
 * Handles both text messages and image messages with captions
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup?: any,
  imageUrl?: string | null
): Promise<TelegramResponse> {
  try {
    console.log(`[TELEGRAM-MESSENGER] 📩 Sending message to chat ${chatId}${imageUrl ? ' with image' : ''}`);
    
    // Validate required parameters
    if (!botToken) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing bot token`);
      return { ok: false, description: "Bot token is required" };
    }
    
    if (!chatId) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing chat ID`);
      return { ok: false, description: "Chat ID is required" };
    }
    
    if (!text || text.trim() === '') {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing message text`);
      return { ok: false, description: "Message text is required" };
    }
    
    // Choose the API endpoint based on whether we're sending an image or just text
    const endpoint = imageUrl 
      ? 'sendPhoto'  // For messages with images
      : 'sendMessage'; // For text-only messages
    
    // Prepare the API URL
    const apiUrl = `https://api.telegram.org/bot${botToken}/${endpoint}`;
    
    // Prepare the payload based on message type
    const payload: any = {
      chat_id: chatId,
      parse_mode: 'HTML'
    };
    
    // Add reply markup if provided
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    // Set content based on message type
    if (imageUrl) {
      payload.photo = imageUrl;
      payload.caption = text;
    } else {
      payload.text = text;
    }
    
    console.log(`[TELEGRAM-MESSENGER] 🔄 Calling Telegram API: ${endpoint}`);
    
    // Send the request to Telegram
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!data.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, data);
      return {
        ok: false,
        description: data.description || "Unknown error from Telegram API"
      };
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Message sent successfully`);
    return {
      ok: true,
      result: data.result
    };
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Exception:`, error);
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
