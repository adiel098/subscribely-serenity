
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

/**
 * Send a message to a Telegram user
 */
export async function sendTelegramMessage(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  message: string,
  signature?: string
): Promise<boolean> {
  try {
    console.log(`Sending Telegram message to user ${telegramUserId}`);
    
    // Append signature if provided
    const formattedMessage = signature 
      ? `${message}\n\n${signature}` 
      : message;
    
    // Get the bot token from global settings
    const { data: tokenData, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !tokenData?.bot_token) {
      console.error("Error fetching bot token:", tokenError);
      return false;
    }

    const botToken = tokenData.bot_token;
    
    // Send the message using Telegram API
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramUserId,
          text: formattedMessage,
          parse_mode: "Markdown"
        }),
      }
    );

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`Error sending Telegram message: ${responseData.description}`);
      return false;
    }

    console.log(`Successfully sent Telegram message to user ${telegramUserId}`);
    return true;
  } catch (error) {
    console.error(`Error in sendTelegramMessage: ${error.message}`);
    return false;
  }
}
