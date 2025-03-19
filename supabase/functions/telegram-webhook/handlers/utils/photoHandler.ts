
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger } from '../../services/loggerService.ts';

const logger = getLogger('photo-handler');

export async function fetchAndUpdateCommunityPhoto(
  supabase: ReturnType<typeof createClient>,
  botToken: string,
  communityId: string,
  chatId: string
): Promise<string | null> {
  try {
    logger.info(`Fetching photo for chat ID: ${chatId}, community ID: ${communityId}`);
    
    // Get chat info including photo
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logger.error(`Telegram API error: ${JSON.stringify(errorData)}`);
      return null;
    }
    
    const chatData = await response.json();
    logger.info(`Chat data received: ${JSON.stringify(chatData, null, 2)}`);
    
    if (!chatData.ok || !chatData.result.photo) {
      logger.info(`No photo available for chat ID: ${chatId}`);
      return null;
    }
    
    // Get the photo file path
    const photoId = chatData.result.photo.big_file_id || chatData.result.photo.small_file_id;
    if (!photoId) {
      logger.error(`No photo file ID found in response`);
      return null;
    }
    
    logger.info(`Photo file ID: ${photoId}`);
    
    // Get file info
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: photoId })
    });
    
    if (!fileResponse.ok) {
      const errorData = await fileResponse.json();
      logger.error(`Error getting file info: ${JSON.stringify(errorData)}`);
      return null;
    }
    
    const fileData = await fileResponse.json();
    if (!fileData.ok || !fileData.result.file_path) {
      logger.error(`No file path in response: ${JSON.stringify(fileData)}`);
      return null;
    }
    
    // Construct the photo URL
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    logger.info(`Photo URL: ${photoUrl}`);
    
    // Update the community with the photo URL
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_photo_url: photoUrl })
      .eq('id', communityId);
      
    if (updateError) {
      logger.error(`Error updating community with photo URL: ${updateError.message}`);
      return null;
    }
    
    logger.info(`Successfully updated photo for community ID: ${communityId}`);
    return photoUrl;
  } catch (error) {
    logger.error(`Error fetching and updating community photo: ${error.message}`);
    return null;
  }
}
