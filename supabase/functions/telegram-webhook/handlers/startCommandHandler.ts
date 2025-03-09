
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
    console.log('[Start] 🚀 Processing start command:', { 
      messageText: message.text,
      hasBotToken: !!botToken,
      botTokenLength: botToken?.length,
      from: message.from,
      chat: message.chat
    });
    
    if (!botToken) {
      console.error('[Start] ❌ Bot token is missing!');
      return false;
    }

    // Extract required data from message
    const parts = message.text.split(' ');
    console.log('[Start] 📝 Command parts:', parts);
    
    const communityId = parts.length > 1 ? parts[1].trim() : null;
    if (!communityId || !message.from) {
      console.log('[Start] ❌ Missing required data:', { communityId, from: message.from });
      return false;
    }

    console.log('[Start] 🔍 Found community ID in start command:', communityId);

    // Fetch community and bot settings
    const data = await fetchStartCommandData(supabase, communityId);
    if (!data.success) {
      console.error('[Start] ❌ Failed to fetch data:', data.error);
      return false;
    }
    
    const { community, botSettings } = data;
    console.log('[Start] ✅ Successfully fetched community and bot settings');
    console.log('[Start] 📌 Community:', { name: community.name, id: community.id });
    console.log('[Start] 📌 Bot settings:', { 
      hasWelcomeMessage: !!botSettings.welcome_message,
      hasWelcomeImage: !!botSettings.welcome_image 
    });

    // Verify bot token
    if (!await verifyBotToken(botToken)) {
      console.error('[Start] ❌ Bot token verification failed');
      return false;
    }

    // Use consistent miniapp URL
    const miniAppUrl = `https://t.me/membifybot/startapp?startapp=${communityId}`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    console.log('[Start] 📤 Sending welcome message to:', message.from.id);
    console.log('[Start] 📝 Message content:', welcomeMessage);
    console.log('[Start] 🖼️ Welcome image:', botSettings.welcome_image ? 'Present' : 'Not present');
    console.log('[Start] 🔗 Mini app URL:', miniAppUrl);

    let messageSuccess = false;

    // Try to send image with welcome message if available
    if (botSettings.welcome_image) {
      console.log('[Start] 🖼️ Welcome image found, sending as photo with caption');
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
        console.log('[Start] ❌ Photo sending failed, falling back to text-only message');
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
      console.log('[Start] 📝 No welcome image, sending text-only message');
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
      
      console.log('[Start] ✅ Start command completed successfully');
      return true;
    } else {
      console.error('[Start] ❌ Failed to send welcome message');
      return false;
    }
  } catch (error) {
    console.error('[Start] ❌ Critical error:', error);
    return false;
  }
}
