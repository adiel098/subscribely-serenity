
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function kickMember(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
) {
  try {
    console.log('[Kick] Attempting to kick user:', { chatId, userId });

    // קודם כל מעדכנים את המסד נתונים
    await supabase
      .from('telegram_chat_members')
      .update({
        is_active: false,
        subscription_status: false
      })
      .eq('telegram_user_id', userId);

    // מנסים להסיר את המשתמש מהקבוצה
    const response = await fetch(`https://api.telegram.org/bot${botToken}/banChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        revoke_messages: false
      })
    });

    const result = await response.json();
    console.log('[Kick] Kick result:', result);
    
    return result.ok;
  } catch (error) {
    console.error('[Kick] Error:', error);
    return false;
  }
}
