
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface TelegramMessage {
  chat: {
    id: number;
    title?: string;
    type: string;
  };
  text?: string;
  from?: {
    id: number;
    username?: string;
  };
}

export async function handleChannelVerification(
  supabase: ReturnType<typeof createClient>,
  message: TelegramMessage,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Channel] Processing message:', JSON.stringify(message, null, 2));

    // וידוא שזו הודעה מערוץ או קבוצה
    if (!message.chat || !['group', 'supergroup', 'channel'].includes(message.chat.type)) {
      console.log('[Channel] Not a channel/group message');
      return false;
    }

    // חיפוש קוד אימות בהודעה
    const verificationCodeMatch = message.text?.match(/MBF_([A-Za-z0-9]+)/);
    if (!verificationCodeMatch) {
      console.log('[Channel] No verification code found in message');
      return false;
    }

    const verificationCode = verificationCodeMatch[1];
    console.log('[Channel] Found verification code:', verificationCode);

    // חיפוש הפרופיל המתאים
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('current_telegram_code', verificationCodeMatch[0])
      .single();

    if (profileError || !profile) {
      console.error('[Channel] No matching profile found:', profileError);
      return false;
    }

    console.log('[Channel] Found matching profile:', profile.id);

    // בדיקה האם הקהילה כבר קיימת
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('*')
      .eq('telegram_chat_id', String(message.chat.id))
      .single();

    if (existingCommunity) {
      console.log('[Channel] Community already exists:', existingCommunity.id);
      return false;
    }

    // יצירת קהילה חדשה
    const { data: newCommunity, error: communityError } = await supabase
      .from('communities')
      .insert({
        name: message.chat.title || 'Telegram Community',
        owner_id: profile.id,
        platform: 'telegram',
        telegram_chat_id: String(message.chat.id),
        platform_id: String(message.chat.id)
      })
      .select()
      .single();

    if (communityError) {
      console.error('[Channel] Error creating community:', communityError);
      return false;
    }

    console.log('[Channel] Created new community:', newCommunity.id);

    // שליחת הודעת אישור
    try {
      const confirmationMessage = `✅ Channel/Group successfully connected!\nCommunity ID: ${newCommunity.id}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: confirmationMessage
        })
      });
    } catch (sendError) {
      console.error('[Channel] Error sending confirmation:', sendError);
      // לא מחזירים false כי הקהילה כבר נוצרה בהצלחה
    }

    return true;
  } catch (error) {
    console.error('[Channel] Error processing channel verification:', error);
    return false;
  }
}
