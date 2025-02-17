
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleVerificationMessage(supabase: ReturnType<typeof createClient>, message: any) {
  try {
    if (!message?.text?.startsWith('MBF_')) {
      return false;
    }

    const verificationCode = message.text.trim();
    const chatId = String(message.chat.id);

    console.log('[Verification] Processing code:', verificationCode);

    const { data: botSettings, error: findError } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('verification_code', verificationCode)
      .maybeSingle();

    if (findError || !botSettings) {
      console.log('[Verification] Invalid code:', verificationCode);
      return false;
    }

    await supabase
      .from('telegram_bot_settings')
      .update({
        chat_id: chatId,
        verified_at: new Date().toISOString()
      })
      .eq('id', botSettings.id);

    await supabase
      .from('communities')
      .update({ telegram_chat_id: chatId })
      .eq('id', botSettings.community_id);

    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settings?.bot_token) {
      await fetch(`https://api.telegram.org/bot${settings.bot_token}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: message.message_id
        }),
      });
    }

    return true;
  } catch (error) {
    console.error('[Verification] Error:', error);
    return false;
  }
}
