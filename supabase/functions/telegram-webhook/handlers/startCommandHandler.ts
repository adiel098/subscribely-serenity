
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchStartCommandData } from './utils/dataSources.ts';
import { logUserInteraction } from './utils/logHelper.ts';
import { 
  sendTextMessage, 
  sendPhotoMessage, 
  verifyBotToken 
} from './utils/telegramMessageSender.ts';

export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Start] Processing start command:', { 
      message,
      hasBotToken: !!botToken,
      botTokenLength: botToken?.length
    });
    
    if (!botToken) {
      console.error('[Start] Bot token is missing!');
      return false;
    }

    // Extract required data from message
    const communityId = message.text.split(' ')[1];
    if (!communityId || !message.from) {
      console.log('[Start] Missing required data:', { communityId, from: message.from });
      return false;
    }

    // Fetch community and bot settings
    const data = await fetchStartCommandData(supabase, communityId);
    if (!data.success) {
      console.error('[Start] Failed to fetch data:', data.error);
      return false;
    }
    
    const { community, botSettings } = data;

    // Verify bot token
    if (!await verifyBotToken(botToken)) {
      return false;
    }

    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    console.log('[Start] Sending welcome message to:', message.from.id);
    console.log('[Start] Message content:', welcomeMessage);

    let messageSuccess = false;

    // Try to send image with welcome message if available
    if (botSettings.welcome_image) {
      console.log('[Start] Welcome image found, sending as photo with caption');
      messageSuccess = await sendPhotoMessage(
        botToken,
        message.from.id,
        botSettings.welcome_image,
        welcomeMessage,
        miniAppUrl,
        communityId
      );
      
      // If photo sending fails, fall back to text-only message
      if (!messageSuccess) {
        console.log('[Start] Falling back to text-only message');
        messageSuccess = await sendTextMessage(
          botToken, 
          message.from.id, 
          welcomeMessage, 
          miniAppUrl, 
          communityId
        );
      }
    } else {
      // No image, send text-only message
      console.log('[Start] No welcome image, sending text-only message');
      messageSuccess = await sendTextMessage(
        botToken, 
        message.from.id, 
        welcomeMessage, 
        miniAppUrl, 
        communityId
      );
    }

    if (messageSuccess) {
      // Log user interaction in database
      await logUserInteraction(
        supabase,
        'start_command',
        String(message.from.id),
        message.from.username,
        message.text,
        message
      );
      
      return true;
    } else {
      console.error('[Start] Failed to send welcome message');
      return false;
    }
  } catch (error) {
    console.error('[Start] Critical error:', error);
    return false;
  }
}
