
// Utility function to send Telegram messages
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  replyMarkup?: any,
  imageUrl?: string | null
): Promise<{ ok: boolean; description?: string }> {
  try {
    // Determine if we should send a photo or text message
    if (imageUrl) {
      // Send a photo message
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: message,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        }),
      });
      
      const result = await response.json();
      return { 
        ok: result.ok, 
        description: result.ok ? undefined : result.description 
      };
    } else {
      // Send a text message
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        }),
      });
      
      const result = await response.json();
      return { 
        ok: result.ok, 
        description: result.ok ? undefined : result.description 
      };
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { ok: false, description: error.message };
  }
}
