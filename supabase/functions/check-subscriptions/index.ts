
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

    // Get all active members with subscriptions
    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select(`
        *,
        community:communities(*),
        bot_settings:telegram_bot_settings(*)
      `)
      .eq('is_active', true)
      .not('subscription_end_date', 'is', null);

    if (membersError) {
      throw membersError;
    }

    const now = new Date();
    const processedMembers = [];

    for (const member of members) {
      try {
        const subscriptionEndDate = new Date(member.subscription_end_date);
        const reminderDays = member.bot_settings?.subscription_reminder_days || 3;
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysUntilExpiration = Math.floor((subscriptionEndDate.getTime() - now.getTime()) / msPerDay);

        // Check if subscription has expired
        if (now > subscriptionEndDate) {
          // Send expiration message
          if (member.subscription_status) {
            await sendTelegramMessage(
              globalSettings.bot_token,
              member.telegram_user_id,
              member.bot_settings?.expired_subscription_message || 'Your subscription has expired.'
            );

            // Log notification
            await supabase.from('subscription_notifications').insert({
              member_id: member.id,
              community_id: member.community_id,
              notification_type: 'expiration',
              status: 'success'
            });

            // Update member status
            await supabase
              .from('telegram_chat_members')
              .update({
                is_active: false,
                subscription_status: false
              })
              .eq('id', member.id);

            // Kick member from channel
            try {
              await fetch(
                `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: member.community.telegram_chat_id,
                    user_id: member.telegram_user_id,
                    until_date: Math.floor(Date.now() / 1000) + 32, // Minimal ban time
                  }),
                }
              );
            } catch (error) {
              console.error('Error kicking member:', error);
            }
          }
        }
        // Check if we need to send a reminder
        else if (daysUntilExpiration === reminderDays && member.subscription_status) {
          await sendTelegramMessage(
            globalSettings.bot_token,
            member.telegram_user_id,
            member.bot_settings?.subscription_reminder_message || 'Your subscription will expire soon.'
          );

          // Log notification
          await supabase.from('subscription_notifications').insert({
            member_id: member.id,
            community_id: member.community_id,
            notification_type: 'reminder',
            status: 'success'
          });
        }

        processedMembers.push({
          id: member.id,
          status: 'success'
        });
      } catch (error) {
        console.error('Error processing member:', member.id, error);
        processedMembers.push({
          id: member.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedMembers.length,
        results: processedMembers 
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
