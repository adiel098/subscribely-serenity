
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAndUpdateCommunityPhoto } from './utils/photoHandler.ts';
import { getLogger, logToDatabase } from '../services/loggerService.ts';

const logger = getLogger('verification-handler');

export async function handleVerificationMessage(supabase: ReturnType<typeof createClient>, message: any) {
  try {
    // בדיקה אם ההודעה מתחילה ב-MBF_
    if (!message?.text?.startsWith('MBF_')) {
      logger.debug('Message does not start with MBF_ prefix, skipping verification');
      return false;
    }

    const verificationCode = message.text.trim();
    const chatId = String(message.chat.id);

    logger.info(`[Verification] Processing code: ${verificationCode}`);
    logger.info(`[Verification] Chat ID: ${chatId}`);
    logger.info(`[Verification] Chat type: ${message.chat.type}`);
    logger.info(`[Verification] Message from: ${message.from?.id || 'unknown'}`);
    
    // Log full message for debugging
    await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Full verification message', message);

    // בדיקה האם קוד האימות קיים במסד הנתונים
    // 1. קודם בודקים בטבלת telegram_bot_settings
    const { data: botSettings, error: findError } = await supabase
      .from('telegram_bot_settings')
      .select('id, community_id, verification_code')
      .eq('verification_code', verificationCode)
      .maybeSingle();

    if (findError) {
      logger.error(`Error checking bot settings: ${findError.message}`, findError);
      await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error checking bot settings', { error: findError, code: verificationCode });
      return false;
    }

    logger.info(`Bot settings query result: ${JSON.stringify(botSettings)}`);

    // 2. אם לא נמצא, בודקים בטבלת profiles (לתמיכה בשיטת האימות הישנה)
    if (!botSettings) {
      logger.info('[Verification] Code not found in bot_settings, checking profiles');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, current_telegram_code')
        .eq('current_telegram_code', verificationCode)
        .maybeSingle();

      if (profileError) {
        logger.error(`Error checking profiles: ${profileError.message}`, profileError);
        await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error checking profiles', { error: profileError, code: verificationCode });
        return false;
      }

      logger.info(`Profile query result: ${JSON.stringify(profile)}`);

      if (profile) {
        logger.info(`[Verification] Found matching profile: ${profile.id}`);
        
        // יצירת קהילה חדשה למשתמש
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .insert({
            name: message.chat.title || 'Telegram Community',
            owner_id: profile.id,
            telegram_chat_id: chatId
          })
          .select()
          .single();

        if (communityError) {
          logger.error(`[Verification] Error creating community: ${communityError.message}`, communityError);
          await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error creating community', { error: communityError, profile_id: profile.id });
          return false;
        }

        logger.info(`[Verification] Created new community: ${community.id}`);

        // עדכון הגדרות הבוט לקהילה החדשה
        const { error: botSettingsError } = await supabase
          .from('telegram_bot_settings')
          .insert({
            community_id: community.id,
            chat_id: chatId,
            verification_code: verificationCode,
            verified_at: new Date().toISOString()
          });

        if (botSettingsError) {
          logger.error(`[Verification] Error creating bot settings: ${botSettingsError.message}`, botSettingsError);
          await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error creating bot settings', { error: botSettingsError, community_id: community.id });
        } else {
          logger.info(`[Verification] Created bot settings for community: ${community.id}`);
        }

        // Try to update community photo
        try {
          const { data: settings } = await supabase
            .from('telegram_global_settings')
            .select('bot_token')
            .single();

          if (settings?.bot_token) {
            // Fetch and update community photo
            const photoUrl = await fetchAndUpdateCommunityPhoto(
              supabase,
              settings.bot_token,
              community.id,
              chatId
            );
            
            logger.info(`[Verification] Updated community photo: ${photoUrl || 'No photo available'}`);

            // Try to delete the verification message
            try {
              await fetch(`https://api.telegram.org/bot${settings.bot_token}/deleteMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  message_id: message.message_id
                }),
              });
              
              logger.info(`[Verification] Deleted verification message`);
            } catch (deleteError) {
              logger.warn(`[Verification] Could not delete verification message: ${deleteError.message}`);
            }
            
            // Send success message
            try {
              await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "✅ Successfully connected to Membify platform!"
                }),
              });
              
              logger.info(`[Verification] Sent success message`);
            } catch (sendError) {
              logger.warn(`[Verification] Could not send success message: ${sendError.message}`);
            }
          }
        } catch (apiError) {
          logger.error(`[Verification] Error with Telegram API: ${apiError.message}`, apiError);
          await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error with Telegram API', { error: apiError });
        }

        await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Verification completed successfully (profile method)', {
          profile_id: profile.id,
          community_id: community.id,
          chat_id: chatId
        });
        
        return true;
      } else {
        logger.warn(`[Verification] No matching profile or bot settings found for code: ${verificationCode}`);
        await logToDatabase(supabase, 'VERIFICATION', 'WARN', 'No matching profile or bot settings found', { code: verificationCode });
        return false;
      }
    } else {
      logger.info(`[Verification] Found bot settings: ${botSettings.id} for community: ${botSettings.community_id}`);

      // עדכון הגדרות הבוט
      const { error: updateError } = await supabase
        .from('telegram_bot_settings')
        .update({
          chat_id: chatId,
          verified_at: new Date().toISOString()
        })
        .eq('id', botSettings.id);

      if (updateError) {
        logger.error(`[Verification] Error updating bot settings: ${updateError.message}`, updateError);
        await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error updating bot settings', { error: updateError, bot_settings_id: botSettings.id });
        return false;
      }

      // עדכון קהילה
      const { error: communityError } = await supabase
        .from('communities')
        .update({ telegram_chat_id: chatId })
        .eq('id', botSettings.community_id);

      if (communityError) {
        logger.error(`[Verification] Error updating community: ${communityError.message}`, communityError);
        await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error updating community', { error: communityError, community_id: botSettings.community_id });
        return false;
      }

      try {
        const { data: settings } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();

        if (settings?.bot_token) {
          // Fetch and update community photo
          const photoUrl = await fetchAndUpdateCommunityPhoto(
            supabase,
            settings.bot_token,
            botSettings.community_id,
            chatId
          );
          
          logger.info(`[Verification] Updated community photo: ${photoUrl || 'No photo available'}`);
          
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
            
            logger.info(`[Verification] Deleted verification message`);
            
            // שליחת הודעת אישור בקבוצה
            await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: "✅ Successfully connected to Membify platform!"
              }),
            });
            
            logger.info(`[Verification] Sent success message`);
          } catch (error) {
            logger.error(`[Verification] Error with Telegram API: ${error.message}`, error);
            await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error with Telegram API', { error: error });
          }
        }
      } catch (error) {
        logger.error(`[Verification] Error retrieving bot token: ${error.message}`, error);
        await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error retrieving bot token', { error: error });
      }

      await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Verification completed successfully (bot settings method)', {
        bot_settings_id: botSettings.id,
        community_id: botSettings.community_id,
        chat_id: chatId
      });
      
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`[Verification] Unhandled error: ${error.message}`, error);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Unhandled error in verification process', { error: error.message, stack: error.stack });
    return false;
  }
}
