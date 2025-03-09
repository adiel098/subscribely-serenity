
import { corsHeaders } from "./cors.ts";

/**
 * Send a text message to a Telegram chat
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  replyMarkup: any = null
) {
  console.log(`[Telegram Client] Sending message to chat ${chatId}`);
  
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify(body)
    });
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`[Telegram Client] API Error: ${responseData.description}`);
      throw new Error(responseData.description);
    }
    
    console.log(`[Telegram Client] Message sent successfully to ${chatId}`);
    return responseData.result;
  } catch (error) {
    console.error(`[Telegram Client] Error sending message: ${error.message}`);
    throw error;
  }
}

/**
 * Send a photo message to a Telegram chat
 */
export async function sendTelegramPhotoMessage(
  botToken: string,
  chatId: string,
  photo: string,
  caption: string = "",
  replyMarkup: any = null
) {
  console.log(`[Telegram Client] Sending photo to chat ${chatId}`);
  
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  const body: any = {
    chat_id: chatId,
    photo: photo,
    parse_mode: "HTML"
  };
  
  if (caption) {
    body.caption = caption;
  }
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify(body)
    });
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`[Telegram Client] API Error: ${responseData.description}`);
      throw new Error(responseData.description);
    }
    
    console.log(`[Telegram Client] Photo sent successfully to ${chatId}`);
    return responseData.result;
  } catch (error) {
    console.error(`[Telegram Client] Error sending photo: ${error.message}`);
    throw error;
  }
}
