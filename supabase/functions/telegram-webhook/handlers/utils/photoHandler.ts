
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramApiClient } from './telegramApiClient.ts';

/**
 * Fetches and updates the community photo from Telegram
 * @param supabase Supabase client instance
 * @param botToken Telegram bot token
 * @param communityId Community ID in the database
 * @param telegramChatId The Telegram chat ID
 * @returns The photo URL if successful, null otherwise
 */
export async function fetchAndUpdateCommunityPhoto(
  supabase: ReturnType<typeof createClient>,
  botToken: string,
  communityId: string,
  telegramChatId: string
): Promise<string | null> {
  try {
    console.log(`[PHOTO-HANDLER] 🖼️ Fetching photo for community ID ${communityId}, chat ID ${telegramChatId}`);
    
    // Invoke the get-telegram-chat-photo function to fetch the photo
    const { data, error } = await supabase.functions.invoke("get-telegram-chat-photo", {
      body: {
        communityId,
        telegramChatId,
        forceFetch: true // Always fetch the latest photo
      }
    });
    
    if (error) {
      console.error(`[PHOTO-HANDLER] ❌ Error invoking get-telegram-chat-photo:`, error);
      return null;
    }
    
    if (!data?.photoUrl) {
      console.log(`[PHOTO-HANDLER] ℹ️ No photo available for chat ${telegramChatId}`);
      return null;
    }
    
    console.log(`[PHOTO-HANDLER] ✅ Successfully fetched photo URL: ${data.photoUrl.substring(0, 50)}...`);
    
    // Update the community record with the photo URL
    const { error: updateError } = await supabase
      .from('communities')
      .update({ 
        telegram_photo_url: data.photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error(`[PHOTO-HANDLER] ❌ Error updating community record:`, updateError);
      // Still return the photo URL even if we couldn't update the database
      return data.photoUrl;
    }
    
    console.log(`[PHOTO-HANDLER] ✅ Successfully updated community ${communityId} with photo URL`);
    return data.photoUrl;
  } catch (error) {
    console.error(`[PHOTO-HANDLER] ❌ Error fetching and updating community photo:`, error);
    return null;
  }
}

/**
 * Direct implementation to fetch a chat photo from Telegram API
 * This can be used as a fallback if the edge function approach doesn't work
 */
export async function directFetchChatPhoto(
  telegramApiClient: TelegramApiClient,
  chatId: string
): Promise<string | null> {
  try {
    console.log(`[PHOTO-HANDLER] 🔄 Direct fetching photo for chat ${chatId} using Telegram API`);
    
    // Get chat info to check if it has a photo
    const chatResponse = await telegramApiClient.getChat(chatId);
    
    if (!chatResponse.result?.photo) {
      console.log(`[PHOTO-HANDLER] ℹ️ Chat ${chatId} does not have a photo`);
      return null;
    }
    
    const fileId = chatResponse.result.photo.big_file_id || 
                   chatResponse.result.photo.small_file_id;
    
    if (!fileId) {
      console.log(`[PHOTO-HANDLER] ❌ No file ID found in chat photo object`);
      return null;
    }
    
    // Get file path from Telegram
    const fileResponse = await fetch(`https://api.telegram.org/bot${telegramApiClient.getBotToken()}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId })
    }).then(res => res.json());
    
    if (!fileResponse.ok || !fileResponse.result?.file_path) {
      console.error(`[PHOTO-HANDLER] ❌ Error getting file path:`, fileResponse);
      return null;
    }
    
    // Construct the direct photo URL
    const photoUrl = `https://api.telegram.org/file/bot${telegramApiClient.getBotToken()}/${fileResponse.result.file_path}`;
    console.log(`[PHOTO-HANDLER] ✅ Successfully got direct photo URL`);
    
    return photoUrl;
  } catch (error) {
    console.error(`[PHOTO-HANDLER] ❌ Error direct fetching chat photo:`, error);
    return null;
  }
}
