
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAndUpdateCommunityPhoto } from './utils/photoHandler.ts';

export async function handleChannelPost(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    const channelPost = update.channel_post;
    console.log('[CHANNEL] Processing channel post:', JSON.stringify(channelPost, null, 2));

    if (!channelPost?.text) {
      console.log('[CHANNEL] No text in channel post, ignoring');
      return;
    }

    // בדיקה אם ההודעה מתחילה ב-MBF_ (קוד אימות)
    if (channelPost.text.startsWith('MBF_')) {
      const verificationCode = channelPost.text.trim();
      const chatId = String(channelPost.chat.id);

      console.log('[CHANNEL] Verification attempt:', {
        code: verificationCode,
        chatId: chatId
      });

      // בדיקה האם קיים קוד אימות תקף בטבלת telegram_bot_settings
      console.log('[CHANNEL] Checking verification code in telegram_bot_settings...');
      const { data: botSettings, error: findError } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('verification_code', verificationCode)
        .maybeSingle();

      if (findError) {
        console.error('[CHANNEL] Error finding verification code in bot_settings:', findError);
      }

      // אם לא נמצא בטבלת telegram_bot_settings, בדוק בטבלת profiles
      if (!botSettings) {
        console.log('[CHANNEL] Checking verification code in profiles...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, current_telegram_code')
          .eq('current_telegram_code', verificationCode)
          .maybeSingle();

        if (profileError) {
          console.error('[CHANNEL] Error finding verification code in profiles:', profileError);
          return;
        }

        if (!profile) {
          console.log('[CHANNEL] No matching verification code found:', verificationCode);
          return;
        }

        console.log('[CHANNEL] Found matching profile:', profile.id);

        // בדיקה האם יש כבר קהילה עם chatId זה
        const { data: existingCommunity } = await supabase
          .from('communities')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .maybeSingle();

        if (existingCommunity) {
          console.log('[CHANNEL] Community already exists with this chat ID:', existingCommunity.id);
          
          // עדכון verified_at
          const { error: updateError } = await supabase
            .from('telegram_bot_settings')
            .update({
              verified_at: new Date().toISOString(),
              chat_id: chatId
            })
            .eq('community_id', existingCommunity.id);
            
          if (updateError) {
            console.error('[CHANNEL] Error updating bot settings for existing community:', updateError);
          }
        } else {
          // יצירת קהילה חדשה
          const { data: newCommunity, error: communityError } = await supabase
            .from('communities')
            .insert({
              name: channelPost.chat.title || 'Telegram Community',
              owner_id: profile.id,
              platform: 'telegram',
              telegram_chat_id: chatId,
              platform_id: chatId
            })
            .select()
            .single();

          if (communityError) {
            console.error('[CHANNEL] Error creating community:', communityError);
            return;
          }

          console.log('[CHANNEL] Created new community:', newCommunity.id);

          // עדכון הגדרות הבוט או יצירת חדשות לקהילה
          const { error: botError } = await supabase
            .from('telegram_bot_settings')
            .update({
              chat_id: chatId,
              verified_at: new Date().toISOString()
            })
            .eq('community_id', newCommunity.id);

          if (botError) {
            console.error('[CHANNEL] Error updating bot settings:', botError);
          }

          // נסה לעדכן תמונת קהילה
          try {
            const { data: settings } = await supabase
              .from('telegram_global_settings')
              .select('bot_token')
              .single();
              
            if (settings?.bot_token) {
              await fetchAndUpdateCommunityPhoto(
                supabase,
                settings.bot_token,
                newCommunity.id,
                chatId
              );
            }
          } catch (photoError) {
            console.error('[CHANNEL] Error updating community photo:', photoError);
          }
        }
      } else {
        // נמצא בטבלת telegram_bot_settings
        console.log('[CHANNEL] Found bot settings:', botSettings);

        // עדכון הגדרות הבוט עם מזהה הצ'אט
        console.log('[CHANNEL] Updating bot settings with chat ID...');
        const { error: updateError } = await supabase
          .from('telegram_bot_settings')
          .update({
            chat_id: chatId,
            verified_at: new Date().toISOString()
          })
          .eq('id', botSettings.id);

        if (updateError) {
          console.error('[CHANNEL] Error updating bot settings:', updateError);
          throw updateError;
        }

        console.log('[CHANNEL] Successfully updated bot settings');

        // עדכון ה-community עם מזהה הצ'אט
        console.log('[CHANNEL] Updating community with chat ID...');
        const { error: communityError } = await supabase
          .from('communities')
          .update({
            telegram_chat_id: chatId
          })
          .eq('id', botSettings.community_id);

        if (communityError) {
          console.error('[CHANNEL] Error updating community:', communityError);
          throw communityError;
        }

        console.log('[CHANNEL] Successfully updated community');
      }

      // קבלת טוקן הבוט
      console.log('[CHANNEL] Getting bot token...');
      const { data: globalSettings } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (globalSettings?.bot_token) {
        // מחיקת הודעת האימות
        try {
          console.log('[CHANNEL] Attempting to delete verification message...');
          const deleteResponse = await fetch(`https://api.telegram.org/bot${globalSettings.bot_token}/deleteMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: channelPost.message_id
            }),
          });
          
          const deleteResult = await deleteResponse.json();
          console.log('[CHANNEL] Delete message response:', deleteResult);
          
          // שליחת הודעת אישור
          const confirmResponse = await fetch(`https://api.telegram.org/bot${globalSettings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ Successfully connected to Membify platform!"
            }),
          });
          
          const confirmResult = await confirmResponse.json();
          console.log('[CHANNEL] Confirmation message response:', confirmResult);
        } catch (deleteError) {
          console.error('[CHANNEL] Error with Telegram API:', deleteError);
        }
      }

      console.log('[CHANNEL] Channel verification completed successfully');
    } else {
      console.log('[CHANNEL] Message does not start with MBF_, ignoring');
    }
  } catch (error) {
    console.error('[CHANNEL] Error in handleChannelPost:', error);
    throw error;
  }
}
