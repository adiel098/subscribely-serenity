import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { sendPhotoMessage, sendTextMessage } from './utils/telegramMessageSender';

interface StartCommandParams {
  supabase: SupabaseClient<Database>;
  chatId: number | string;
  userId: number;
  username: string | undefined;
  communityId: string | null;
  botToken: string;
}

export async function handleStartCommand({
  supabase,
  chatId,
  userId,
  username,
  communityId,
  botToken
}: StartCommandParams): Promise<boolean> {
  console.log(`[Start] Handling start command for user ${userId}, community: ${communityId}`);
  
  try {
    // If communityId is provided, we're dealing with a deep link
    if (communityId) {
      // Fetch community information
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, name, telegram_chat_id')
        .eq('id', communityId)
        .maybeSingle();

      if (communityError || !community) {
        console.error('[Start] Error fetching community:', communityError);
        await sendTextMessage(
          botToken,
          chatId,
          "Sorry, I couldn't find that community. Please try again or contact support.",
          '',
          ''
        );
        return false;
      }

      // Fetch bot settings for welcome message
      const { data: botSettings, error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .select('welcome_message, welcome_image, bot_signature')
        .eq('community_id', communityId)
        .maybeSingle();

      if (settingsError) {
        console.error('[Start] Error fetching bot settings:', settingsError);
        return false;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('telegram_chat_members')
        .select('id, is_active, subscription_status')
        .eq('community_id', communityId)
        .eq('telegram_user_id', userId.toString())
        .maybeSingle();

      const welcomeMessage = (botSettings?.welcome_message || 'Welcome to our community!') + 
        '\n\n' + (botSettings?.bot_signature || '🤖 Community Bot');

      // Get mini app URL from environment or settings
      const { data: globalSettings } = await supabase
        .from('telegram_global_settings')
        .select('*')
        .limit(1)
        .single();

      const miniAppUrl = Deno.env.get('MINI_APP_URL') || globalSettings?.mini_app_url || 'https://mini.membify.app';
      
      console.log(`[Start] Sending welcome message to: ${chatId}\n`);
      console.log(`[Start] Welcome message: ${welcomeMessage.substring(0, 50)}...`);
      console.log(`[Start] Welcome image exists: ${!!botSettings?.welcome_image}`);
      
      // If we have a welcome image, use it
      if (botSettings?.welcome_image) {
        return await sendPhotoMessage(
          botToken,
          chatId,
          botSettings.welcome_image,
          welcomeMessage,
          miniAppUrl,
          communityId
        );
      } else {
        // Otherwise just send the text
        return await sendTextMessage(
          botToken,
          chatId,
          welcomeMessage,
          miniAppUrl,
          communityId
        );
      }
    } else {
      // Generic start command without deep link
      await sendTextMessage(
        botToken,
        chatId,
        "Welcome to Membify Bot! 👋\n\nPlease use a specific community link to get started.",
        '',
        ''
      );
      return true;
    }
  } catch (error) {
    console.error('[Start] Error in handleStartCommand:', error);
    // Try to send a fallback message
    await sendTextMessage(
      botToken, 
      chatId, 
      "Sorry, something went wrong. Please try again later.",
      '',
      ''
    );
    return false;
  }
}
