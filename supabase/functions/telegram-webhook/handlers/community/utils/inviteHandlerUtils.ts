
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';

/**
 * Handle a community join request from a user
 */
export async function handleCommunityJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  community: any,
  userId: string,
  username: string | undefined
): Promise<boolean> {
  try {
    // Fetch bot settings to get welcome message configuration
    const { data: botSettings, error: botError } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', community.id)
      .single();

    if (botError) {
      console.error('❌ Error fetching bot settings:', botError);
      return false;
    }

    // Create the Mini App URL for this community
    const miniAppUrl = `https://membify.app/mini-app?start=${community.id}`;

    // If auto welcome message is enabled, send the configured welcome message
    if (botSettings.auto_welcome_message) {
      const welcomeMessage = botSettings.welcome_message || 
        'Welcome to our community! 👋\nWe\'re excited to have you here.';

      if (botSettings.welcome_image) {
        // Send welcome message with image if configured
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          welcomeMessage,
          botSettings.welcome_image,
          {
            inline_keyboard: [[
              {
                text: "Join Community 🚀",
                web_app: { url: miniAppUrl }
              }
            ]]
          }
        );
      } else {
        // Send text-only welcome message
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          welcomeMessage,
          null,
          {
            inline_keyboard: [[
              {
                text: "Join Community 🚀",
                web_app: { url: miniAppUrl }
              }
            ]]
          }
        );
      }
      
      console.log('✅ Sent welcome message to user:', userId);
    }

    return true;
  } catch (error) {
    console.error('❌ Error handling community join request:', error);
    return false;
  }
}
