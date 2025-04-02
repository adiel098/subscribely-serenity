
import { createLogger } from '../../_shared/logger.ts';
import { BroadcastResult, Member, InlineKeyboard } from '../types/types.ts';
import { validateInlineKeyboard } from '../utils/validators.ts';
import { createJoinButton } from '../utils/urlUtils.ts';

const logger = createLogger('broadcast-service');

export async function broadcastToMembers(
  supabase: any,
  members: Member[],
  message: string,
  botToken: string,
  includeButton = false,
  buttonText = 'Join Community 🚀',
  buttonUrl?: string,
  image?: string | null,
  communityId?: string
): Promise<BroadcastResult> {
  let successCount = 0;
  let failedCount = 0;
  
  logger.log(`Broadcasting to ${members.length} members`);
  
  // Create inline keyboard if includeButton is true
  let replyMarkup: InlineKeyboard | null = null;
  
  if (includeButton && communityId) {
    replyMarkup = createJoinButton(communityId, buttonText);
    
    // Validate the inline keyboard
    const keyboardValidation = validateInlineKeyboard(replyMarkup);
    if (!keyboardValidation.valid) {
      logger.error(`Invalid inline keyboard: ${keyboardValidation.error}`);
      replyMarkup = null;
    }
  }
  
  // Process members in batches of 10 to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(async (member) => {
        try {
          const result = await sendTelegramMessage(
            botToken,
            member.telegram_user_id,
            message,
            replyMarkup,
            image
          );
          
          if (result.ok) {
            return { success: true, userId: member.telegram_user_id };
          } else {
            logger.error(`Failed to send message to user ${member.telegram_user_id}: ${result.description}`);
            return { success: false, userId: member.telegram_user_id, error: result.description };
          }
        } catch (error) {
          logger.error(`Exception sending message to user ${member.telegram_user_id}: ${error.message}`);
          return { success: false, userId: member.telegram_user_id, error: error.message };
        }
      })
    );
    
    // Count successes and failures
    for (const result of results) {
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }
    
    // Throttle to avoid Telegram rate limits
    if (i + batchSize < members.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  logger.log(`Broadcast complete. Success: ${successCount}, Failed: ${failedCount}`);
  return { successCount, failedCount };
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup: InlineKeyboard | null,
  image?: string | null
): Promise<{ ok: boolean, description?: string }> {
  try {
    logger.log(`Sending message to user ${chatId}`);
    
    // If image is provided, send a photo message
    if (image) {
      return await sendPhotoWithCaption(botToken, chatId, image, text, replyMarkup);
    }
    
    // Construct the API URL
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Prepare the request data
    const requestData: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    
    // Add reply markup if provided
    if (replyMarkup) {
      requestData.reply_markup = JSON.stringify(replyMarkup);
    }
    
    // Send the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Parse the response
    const result = await response.json();
    
    if (!result.ok) {
      logger.error(`Telegram API error: ${JSON.stringify(result)}`);
      return { ok: false, description: result.description || 'Unknown Telegram API error' };
    }
    
    return { ok: true };
  } catch (error) {
    logger.error(`Exception in sendTelegramMessage: ${error.message}`);
    return { ok: false, description: error.message };
  }
}

export async function sendPhotoWithCaption(
  botToken: string,
  chatId: string | number,
  photoUrl: string | null,
  caption: string = '',
  inlineKeyboard: InlineKeyboard | null = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    if (!photoUrl) {
      logger.error(`No photo URL provided for sendPhotoWithCaption`);
      return { ok: false, description: 'No photo URL provided' };
    }
    
    logger.log(`Sending photo to ${chatId}`);
    logger.log(`Caption: ${caption ? caption.substring(0, 50) + '...' : 'No caption'}`);
    logger.log(`Has inline keyboard: ${!!inlineKeyboard}`);
    
    // Create the request payload
    const payload: any = {
      chat_id: chatId,
      caption: caption || '',
      parse_mode: "HTML"
    };
    
    // Handle base64 data URLs differently than regular URLs
    let requestOptions: RequestInit;
    let endpoint: string;
    
    if (photoUrl.startsWith('data:image')) {
      logger.log(`Processing base64 image`);
      
      // Extract content type and data
      const matches = photoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        logger.error(`Invalid base64 image format`);
        return { ok: false, description: 'Invalid base64 image format' };
      }
      
      const contentType = matches[1];
      let imageData = matches[2];
      
      // Ensure padding is correct
      const paddingNeeded = (4 - (imageData.length % 4)) % 4;
      if (paddingNeeded > 0) {
        imageData += '='.repeat(paddingNeeded);
      }
      
      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
      }
      
      // Add reply markup if present
      if (inlineKeyboard) {
        formData.append('reply_markup', 
          typeof inlineKeyboard === 'string' 
            ? inlineKeyboard 
            : JSON.stringify(inlineKeyboard));
      }
      
      // Convert base64 to binary
      const binaryStr = atob(imageData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // Extract file extension
      const extension = contentType.split('/')[1] || 'jpg';
      
      // Create blob and append it
      const blob = new Blob([bytes], { type: contentType });
      formData.append('photo', blob, `photo.${extension}`);
      
      // Set up multipart request
      endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      requestOptions = {
        method: 'POST',
        body: formData
      };
    } else {
      // For regular URLs
      endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      payload.photo = photoUrl;
      
      // Add reply markup if present
      if (inlineKeyboard) {
        payload.reply_markup = typeof inlineKeyboard === 'string' 
          ? inlineKeyboard 
          : JSON.stringify(inlineKeyboard);
      }
      
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      };
    }
    
    // Make the API request
    const response = await fetch(endpoint, requestOptions);
    
    // Parse the response
    const result = await response.json();
    
    if (!result.ok) {
      logger.error(`Telegram API error when sending photo:`, result);
      return { ok: false, description: result.description || 'Unknown Telegram API error' };
    }
    
    logger.log(`Photo sent successfully`);
    return { ok: true };
  } catch (error) {
    logger.error(`Error sending photo message:`, error);
    return { ok: false, description: error.message || 'Unknown error sending photo' };
  }
}
