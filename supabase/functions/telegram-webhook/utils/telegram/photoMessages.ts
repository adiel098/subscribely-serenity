
/**
 * Functions for sending photo messages via Telegram Bot API
 */

/**
 * Sends a photo with an optional caption to a Telegram user
 */
export async function sendPhotoWithCaption(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption: string | null = null,
  replyMarkup: any = null
): Promise<{ ok: boolean; description?: string; result?: any }> {
  try {
    console.log(`[TELEGRAM-PHOTO] Sending photo to ${chatId}`);
    console.log(`[TELEGRAM-PHOTO] Photo URL: ${photoUrl?.substring(0, 50)}...`);
    
    const messageData: any = {
      chat_id: chatId,
      photo: photoUrl,
      parse_mode: 'HTML'
    };
    
    if (caption) {
      messageData.caption = caption;
    }
    
    if (replyMarkup) {
      messageData.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[TELEGRAM-PHOTO] ❌ Failed to send photo: ${data.description}`);
      return { ok: false, description: data.description };
    }
    
    console.log(`[TELEGRAM-PHOTO] ✅ Photo sent successfully`);
    return { ok: true, result: data.result };
  } catch (error) {
    console.error(`[TELEGRAM-PHOTO] ❌ Error sending photo:`, error);
    
    // Try to send as text message if photo fails
    try {
      console.log(`[TELEGRAM-PHOTO] Falling back to text message`);
      
      const textData: any = {
        chat_id: chatId,
        text: caption || "Message from the community",
        parse_mode: 'HTML'
      };
      
      if (replyMarkup) {
        textData.reply_markup = typeof replyMarkup === 'string' 
          ? replyMarkup 
          : JSON.stringify(replyMarkup);
      }
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(textData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`[TELEGRAM-PHOTO] ❌ Fallback message also failed: ${data.description}`);
        return { ok: false, description: `Failed to send photo and fallback message: ${error.message}` };
      }
      
      console.log(`[TELEGRAM-PHOTO] ✅ Fallback message sent successfully`);
      return { ok: true, result: data.result };
    } catch (fallbackError) {
      console.error(`[TELEGRAM-PHOTO] ❌ Fallback also failed:`, fallbackError);
      return { ok: false, description: `Failed to send photo and fallback: ${error.message}, ${fallbackError.message}` };
    }
  }
}
