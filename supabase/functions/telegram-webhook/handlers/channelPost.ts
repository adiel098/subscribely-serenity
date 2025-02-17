
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleChannelPost(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    const channelPost = update.channel_post;
    console.log('Processing channel post:', channelPost);

    if (!channelPost?.text) {
      console.log('No text in channel post, ignoring');
      return;
    }

    // בדיקה אם ההודעה מתחילה ב-MBF_ (קוד אימות)
    if (channelPost.text.startsWith('MBF_')) {
      const verificationCode = channelPost.text.trim();
      const chatId = String(channelPost.chat.id);

      console.log('Verification attempt:', {
        code: verificationCode,
        chatId: chatId
      });

      // בדיקה האם קיים קוד אימות תקף
      const { data: botSettings, error: findError } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('verification_code', verificationCode)
        .single();

      if (findError) {
        console.error('Error finding verification code:', findError);
        return;
      }

      if (!botSettings) {
        console.log('No matching verification code found');
        return;
      }

      console.log('Found bot settings:', botSettings);

      // עדכון הגדרות הבוט עם מזהה הצ'אט
      const { error: updateError } = await supabase
        .from('telegram_bot_settings')
        .update({
          chat_id: chatId,
          verified_at: new Date().toISOString()
        })
        .eq('id', botSettings.id);

      if (updateError) {
        console.error('Error updating bot settings:', updateError);
        throw updateError;
      }

      console.log('Updated bot settings with chat ID');

      // עדכון ה-community עם מזהה הצ'אט
      const { error: communityError } = await supabase
        .from('communities')
        .update({
          telegram_chat_id: chatId
        })
        .eq('id', botSettings.community_id);

      if (communityError) {
        console.error('Error updating community:', communityError);
        throw communityError;
      }

      console.log('Updated community with chat ID');

      // קבלת טוקן הבוט
      const { data: globalSettings } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();

      if (globalSettings?.bot_token) {
        // מחיקת הודעת האימות
        try {
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
          console.log('Delete message response:', deleteResult);
        } catch (deleteError) {
          console.error('Error deleting verification message:', deleteError);
        }
      }

      console.log('Channel verification completed successfully');
    }
  } catch (error) {
    console.error('Error in handleChannelPost:', error);
    throw error;
  }
}
