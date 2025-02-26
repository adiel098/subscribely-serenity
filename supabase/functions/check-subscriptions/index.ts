
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../telegram-webhook/telegramClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get global bot settings (for bot token)
    const { data: globalSettings, error: globalSettingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (globalSettingsError || !globalSettings?.bot_token) {
      throw new Error('Bot token not found');
    }

    // Get members that need to be checked
    const { data: membersToCheck, error: membersError } = await supabase
      .rpc('get_members_to_check');

    if (membersError) {
      throw membersError;
    }

    console.log('Members to check:', membersToCheck.length);

    for (const member of membersToCheck) {
      try {
        // Get community settings for this member
        const { data: botSettings } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('community_id', member.community_id)
          .single();

        if (!botSettings) continue;

        // Calculate days until subscription ends
        const daysUntilEnd = Math.ceil(
          (new Date(member.subscription_end_date).getTime() - Date.now()) / 
          (1000 * 60 * 60 * 24)
        );

        // If subscription has ended
        if (daysUntilEnd <= 0) {
          if (botSettings.auto_remove_expired) {
            // Update member status
            await supabase
              .from('telegram_chat_members')
              .update({
                subscription_status: false,
                is_active: false
              })
              .eq('id', member.member_id);

            // Send expiration message
            if (botSettings.expired_subscription_message) {
              await sendTelegramMessage(
                globalSettings.bot_token,
                member.telegram_user_id,
                botSettings.expired_subscription_message
              );
            }

            // Log notification
            await supabase
              .from('subscription_notifications')
              .insert({
                member_id: member.member_id,
                community_id: member.community_id,
                notification_type: 'expiration',
                status: 'sent'
              });

            // Kick member from channel
            const kickResponse = await fetch(
              `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: botSettings.chat_id,
                  user_id: member.telegram_user_id,
                  until_date: Math.floor(Date.now() / 1000) + 32
                })
              }
            );

            if (!kickResponse.ok) {
              throw new Error('Failed to remove member from channel');
            }
          }
        }
        // If subscription is about to end
        else if (daysUntilEnd <= botSettings.subscription_reminder_days) {
          // Check if we haven't already sent a reminder recently
          const { data: recentNotification } = await supabase
            .from('subscription_notifications')
            .select()
            .eq('member_id', member.member_id)
            .eq('notification_type', 'reminder')
            .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!recentNotification && botSettings.subscription_reminder_message) {
            // Send reminder message
            await sendTelegramMessage(
              globalSettings.bot_token,
              member.telegram_user_id,
              botSettings.subscription_reminder_message
            );

            // Log notification
            await supabase
              .from('subscription_notifications')
              .insert({
                member_id: member.member_id,
                community_id: member.community_id,
                notification_type: 'reminder',
                status: 'sent'
              });
          }
        }
      } catch (error) {
        console.error('Error processing member:', member.member_id, error);
        
        // Log failed notification
        await supabase
          .from('subscription_notifications')
          .insert({
            member_id: member.member_id,
            community_id: member.community_id,
            notification_type: 'error',
            status: 'failed',
            error: error.message
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: membersToCheck.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in check-subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

