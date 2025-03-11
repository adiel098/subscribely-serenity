
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
    
    // Message validation - Ensure message is not empty and is a valid string
    if (!message || typeof message !== 'string') {
      console.error("Error: Invalid message format", message);
      return false;
    }
    
    // Sanitize message to avoid HTML/Markdown parsing issues
    let sanitizedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Append signature if provided
    const formattedMessage = signature 
      ? `${sanitizedMessage}\n\n${signature}` 
      : sanitizedMessage;
    
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
          parse_mode: "HTML"  // Using HTML instead of Markdown for better compatibility
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from Telegram API: ${errorText}`);
      return false;
    }

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`Error sending Telegram message: ${responseData.description}`);
      
      // If error is related to parsing, retry without parse_mode
      if (responseData.description && responseData.description.includes("parse")) {
        console.log("Retrying without parse_mode...");
        const retryResponse = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramUserId,
              text: formattedMessage,
              // No parse_mode here
            }),
          }
        );
        
        const retryData = await retryResponse.json();
        if (retryData.ok) {
          console.log(`Successfully sent Telegram message to user ${telegramUserId} (fallback mode)`);
          return true;
        } else {
          console.error(`Fallback also failed: ${retryData.description}`);
          return false;
        }
      }
      
      return false;
    }

    console.log(`Successfully sent Telegram message to user ${telegramUserId}`);
    return true;
  } catch (error) {
    console.error(`Error in sendTelegramMessage: ${error.message}`);
    return false;
  }
}
