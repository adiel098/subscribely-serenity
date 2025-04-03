import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger } from '../../services/loggerService.ts';

const logger = getLogger('photo-handler');

/**
 * Fetches the group/channel photo from Telegram and updates the community record
 */
export async function fetchAndUpdateCommunityPhoto(
  supabase: ReturnType<typeof createClient>,
  botToken: string,
  communityId: string,
  chatId: string
): Promise<string | null> {
  try {
    logger.info(`Fetching photo for community ${communityId} (chat: ${chatId})`);

    // Get chat photo file_id from Telegram
    const chatResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      logger.error(`Telegram API error: ${errorText}`);
      return null;
    }

    const chatData = await chatResponse.json();
    logger.info(`Chat response: ${JSON.stringify(chatData)}`);

    if (!chatData.ok || !chatData.result.photo) {
      logger.info(`No photo available for chat ${chatId}`);
      return null;
    }

    // Get the file path from the file_id
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: chatData.result.photo.small_file_id })
      }
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      logger.error(`Telegram API error (getFile): ${errorText}`);
      return null;
    }

    const fileData = await fileResponse.json();
    logger.info(`File data: ${JSON.stringify(fileData)}`);

    if (!fileData.ok || !fileData.result.file_path) {
      logger.error(`File path not found in response: ${JSON.stringify(fileData)}`);
      return null;
    }

    // Download the file from Telegram
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    logger.info(`Photo URL: ${photoUrl}`);

    // Update the community with the photo URL
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_photo_url: photoUrl })
      .eq('id', communityId);

    if (updateError) {
      logger.error(`Failed to update community with photo: ${updateError.message}`);
      return null;
    }

    logger.info(`Successfully updated photo for community ${communityId}`);
    return photoUrl;
  } catch (error) {
    logger.error(`Error in fetchAndUpdateCommunityPhoto: ${error.message}`, error);
    return null;
  }
}
