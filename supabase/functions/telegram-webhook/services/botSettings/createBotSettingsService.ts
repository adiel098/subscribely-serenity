
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LoggerService } from '../loggingService.ts';

interface CreateBotSettingsParams {
  communityId: string;
  chatId: string;
  communityName: string;
  description?: string;
  verificationCode?: string;
}

export async function createBotSettings(
  supabase: SupabaseClient,
  logger: LoggerService,
  params: CreateBotSettingsParams
) {
  const { communityId, chatId, communityName, description, verificationCode } = params;

  // Check if settings already exist
  const { data: existingSettings } = await supabase
    .from('telegram_bot_settings')
    .select('id')
    .eq('project_id', communityId) // Using project_id consistently
    .single();

  if (existingSettings) {
    await logger.info(`Bot settings already exist for project ${communityId}`);
    return { success: true, data: existingSettings };
  }

  // Create default bot settings
  const { data: settings, error: settingsError } = await supabase
    .from('telegram_bot_settings')
    .insert({
      project_id: communityId, // Using project_id consistently
      chat_id: chatId,
      is_admin: false, // Will be updated after checking bot permissions
      welcome_message: `Welcome to ${communityName}! 🎉\n\n${description ? description + '\n\n' : ''}To join and access exclusive content, please subscribe using the button below:`,
      welcome_image: null, // Will be updated by photo handler
      verification_code: verificationCode || null,
      verified_at: new Date().toISOString(),
      subscription_reminder_days: 3,
      subscription_reminder_message: `Your subscription to ${communityName} will expire soon. Don't miss out - renew now to maintain access! 🔄`,
      first_reminder_days: 7,
      second_reminder_days: 3,
      first_reminder_message: `Your subscription to ${communityName} will expire in 7 days. Renew now to ensure uninterrupted access! ⏳`,
      second_reminder_message: `Final reminder: Your subscription to ${communityName} expires in 3 days. Don't forget to renew! ⚠️`,
      first_reminder_image: null,
      second_reminder_image: null,
      expired_subscription_message: `Your subscription to ${communityName} has expired. Renew now to regain access! 🔒`,
      auto_remove_expired: true,
      renewal_discount_enabled: true,
      renewal_discount_percentage: 10,
      auto_welcome_message: true,
      bot_signature: '🤖 Powered by Membify',
      language: 'en',
      max_messages_per_day: 10
    })
    .select()
    .single();

  if (settingsError) {
    await logger.error(`❌ Failed to create bot settings:`, settingsError);
    return { success: false, error: settingsError };
  }

  await logger.success(`✅ Successfully created bot settings for project ${communityId}`);
  return { success: true, data: settings };
}
