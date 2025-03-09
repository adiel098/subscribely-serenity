
import { corsHeaders } from "../cors.ts";

/**
 * Utility for sending Telegram messages
 */
export class TelegramMessenger {
  /**
   * Send a text message to a Telegram user
   * 
   * @param botToken The Telegram bot token
   * @param chatId The chat ID to send the message to
   * @param text The text message to send
   * @param replyMarkup Optional reply markup for buttons
   * @returns Promise<boolean> True if the message was sent successfully
   */
  static async sendTextMessage(
    botToken: string,
    chatId: string,
    text: string,
    replyMarkup: any = null
  ): Promise<boolean> {
    try {
      console.log(`📤 Sending text message to ${chatId}`);
      
      const body: any = {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      };
      
      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }
      
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          },
          body: JSON.stringify(body)
        }
      );
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error("Error sending message:", result.description);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  /**
   * Send a photo message to a Telegram user
   * 
   * @param botToken The Telegram bot token
   * @param chatId The chat ID to send the message to
   * @param photoUrl The URL or base64 data of the photo
   * @param caption Optional caption for the photo
   * @param replyMarkup Optional reply markup for buttons
   * @returns Promise<boolean> True if the message was sent successfully
   */
  static async sendPhotoMessage(
    botToken: string,
    chatId: string,
    photoUrl: string,
    caption: string = "",
    replyMarkup: any = null
  ): Promise<boolean> {
    try {
      console.log(`📤 Sending photo message to ${chatId}`);
      
      // Check if the image is a base64 data URL
      if (photoUrl.startsWith('data:image')) {
        console.log(`Base64 image detected, processing as form data...`);
        
        try {
          // Extract the Base64 data (remove the data:image/xxx;base64, prefix)
          const matches = photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          
          if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image format');
          }
          
          const imageFormat = matches[1]; // e.g., 'jpeg', 'png'
          const base64Data = matches[2];
          
          // Convert Base64 to binary
          const binaryData = atob(base64Data);
          const byteArray = new Uint8Array(binaryData.length);
          
          for (let i = 0; i < binaryData.length; i++) {
            byteArray[i] = binaryData.charCodeAt(i);
          }
          
          // Create form data and blob
          const form = new FormData();
          form.append('chat_id', chatId);
          
          // Create file from binary data
          const blob = new Blob([byteArray], { type: `image/${imageFormat}` });
          form.append('photo', blob, `image.${imageFormat}`);
          
          if (caption) {
            form.append('caption', caption);
            form.append('parse_mode', 'HTML');
          }
          
          if (replyMarkup) {
            form.append('reply_markup', JSON.stringify(replyMarkup));
          }
          
          // Send the request
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: form
          });
          
          const result = await response.json();
          
          if (!result.ok) {
            console.error('Error sending photo message with form data:', result.description);
            return false;
          }
          
          console.log('Successfully sent base64 image!');
          return true;
          
        } catch (base64Error) {
          console.error('Error processing base64 image:', base64Error);
          // Fall back to text message on base64 processing error
          return await this.sendTextMessage(botToken, chatId, caption, replyMarkup);
        }
      } else {
        // For regular URL images
        console.log(`Standard URL image detected, sending directly...`);
        
        const body: any = {
          chat_id: chatId,
          photo: photoUrl,
          parse_mode: "HTML"
        };
        
        if (caption) {
          body.caption = caption;
        }
        
        if (replyMarkup) {
          body.reply_markup = replyMarkup;
        }
        
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            },
            body: JSON.stringify(body)
          }
        );
        
        const result = await response.json();
        
        if (!result.ok) {
          console.error("Error sending photo message:", result.description);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error sending photo message:", error);
      return false;
    }
  }
}
