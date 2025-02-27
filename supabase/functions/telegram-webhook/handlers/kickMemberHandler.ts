
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function kickMember(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
) {
  try {
    console.log('[Kick] Attempting to kick user:', { chatId, userId });

    // קודם מסירים את המשתמש מהקבוצה
    const kickResponse = await fetch(`https://api.telegram.org/bot${botToken}/kickChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });

    const kickResult = await kickResponse.json();
    console.log('[Kick] Kick result:', kickResult);

    if (!kickResult.ok) {
      console.error('[Kick] Failed to kick member:', kickResult.description);
      return false;
    }

    // מיד אחרי זה מסירים את ה-ban כדי שהמשתמש יוכל להצטרף שוב בעתיד
    const unbanResponse = await fetch(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        only_if_banned: true
      })
    });

    const unbanResult = await unbanResponse.json();
    console.log('[Kick] Unban result:', unbanResult);

    // עדכון הסטטוס במסד הנתונים
    const { error: dbError } = await supabase
      .from('telegram_chat_members')
      .update({
        is_active: false,
        subscription_status: false
      })
      .eq('telegram_user_id', userId)
      .eq('community_id', chatId);

    if (dbError) {
      console.error('[Kick] Error updating database:', dbError);
      return false;
    }

    return kickResult.ok;
  } catch (error) {
    console.error('[Kick] Error:', error);
    return false;
  }
}
