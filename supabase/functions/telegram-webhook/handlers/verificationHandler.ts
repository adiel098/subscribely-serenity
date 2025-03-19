
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleVerificationMessage(supabase: ReturnType<typeof createClient>, message: any) {
  try {
    // בדיקה אם ההודעה מתחילה ב-MBF_
    if (!message?.text?.startsWith('MBF_')) {
      return false;
    }

    const verificationCode = message.text.trim();
    const chatId = String(message.chat.id);

    console.log('[Verification] Processing code:', verificationCode);
    console.log('[Verification] Chat ID:', chatId);

    // בדיקה האם קוד האימות קיים במסד הנתונים
    // 1. קודם בודקים בטבלת telegram_bot_settings
    const { data: botSettings, error: findError } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('verification_code', verificationCode)
      .maybeSingle();

    // 2. אם לא נמצא, בודקים בטבלת profiles (לתמיכה בשיטת האימות הישנה)
    if (!botSettings) {
      console.log('[Verification] Code not found in bot_settings, checking profiles');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, current_telegram_code')
        .eq('current_telegram_code', verificationCode)
        .maybeSingle();

      if (profile) {
        console.log('[Verification] Found matching profile:', profile.id);
        
        // יצירת קהילה חדשה למשתמש
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .insert({
            name: message.chat.title || 'Telegram Community',
            owner_id: profile.id,
            platform: 'telegram',
            telegram_chat_id: chatId,
            platform_id: chatId
          })
          .select()
          .single();

        if (communityError) {
          console.error('[Verification] Error creating community:', communityError);
          return false;
        }

        console.log('[Verification] Created new community:', community.id);

        // עדכון הגדרות הבוט לקהילה החדשה
        await supabase
          .from('telegram_bot_settings')
          .update({
            chat_id: chatId,
            verified_at: new Date().toISOString()
          })
          .eq('community_id', community.id);

        // לא צריך לעדכן את הקוד בפרופיל, זה יקרה בצד הלקוח
        
        const { data: settings } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();

        if (settings?.bot_token) {
          // ניסיון למחוק את הודעת האימות
          await fetch(`https://api.telegram.org/bot${settings.bot_token}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: message.message_id
            }),
          });
          
          // שליחת הודעת אישור בקבוצה
          await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ Successfully connected to Membify platform!"
            }),
          });
        }

        return true;
      }
    } else {
      console.log('[Verification] Found bot settings:', botSettings.id);

      // עדכון הגדרות הבוט
      await supabase
        .from('telegram_bot_settings')
        .update({
          chat_id: chatId,
          verified_at: new Date().toISOString()
        })
        .eq('id', botSettings.id);

      // עדכון קהילה
      await supabase
        .from('communities')
        .update({ telegram_chat_id: chatId })
        .eq('id', botSettings.community_id);

      const { data: settings } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (settings?.bot_token) {
        try {
          // ניסיון למחוק את הודעת האימות
          await fetch(`https://api.telegram.org/bot${settings.bot_token}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: message.message_id
            }),
          });
          
          // שליחת הודעת אישור בקבוצה
          await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ Successfully connected to Membify platform!"
            }),
          });
        } catch (error) {
          console.error('[Verification] Error with Telegram API:', error);
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('[Verification] Error:', error);
    return false;
  }
}
