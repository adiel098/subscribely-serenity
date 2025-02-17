
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

    // Get all communities with their bot settings
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select(`
        id,
        telegram_chat_id,
        telegram_bot_settings (
          auto_remove_expired,
          expired_subscription_message
        )
      `);

    if (communitiesError) {
      throw communitiesError;
    }

    const processedMembers = [];

    for (const community of communities) {
      if (!community.telegram_chat_id) continue;

      // בדיקת משתמשים לא פעילים באמצעות הפונקציה החדשה
      const { data: inactiveMembers, error: membersError } = await supabase
        .rpc('check_inactive_members', {
          community_id_param: community.id
        });

      if (membersError) {
        console.error('Error checking inactive members:', membersError);
        continue;
      }

      for (const member of inactiveMembers) {
        try {
          // Get bot settings for this community
          const botSettings = community.telegram_bot_settings?.[0];
          
          // Only proceed if auto_remove_expired is enabled
          if (botSettings?.auto_remove_expired) {
            // Send expiration message
            if (botSettings.expired_subscription_message) {
              await sendTelegramMessage(
                globalSettings.bot_token,
                member.telegram_user_id,
                botSettings.expired_subscription_message
              );
            }

            // Kick member from channel
            try {
              await fetch(
                `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: community.telegram_chat_id,
                    user_id: member.telegram_user_id,
                    until_date: Math.floor(Date.now() / 1000) + 32, // Minimal ban time
                  }),
                }
              );

              // Update member status
              await supabase
                .from('telegram_chat_members')
                .update({
                  is_active: false,
                  subscription_status: false
                })
                .eq('telegram_user_id', member.telegram_user_id)
                .eq('community_id', community.id);

              // Log the event
              await supabase.from('analytics_events').insert({
                community_id: community.id,
                event_type: 'member_kicked',
                user_id: member.telegram_user_id,
                metadata: {
                  reason: 'subscription_expired',
                  was_trial: member.is_trial
                }
              });
            } catch (error) {
              console.error('Error kicking member:', error);
              processedMembers.push({
                telegram_user_id: member.telegram_user_id,
                status: 'error',
                error: error.message
              });
              continue;
            }
          }

          processedMembers.push({
            telegram_user_id: member.telegram_user_id,
            status: 'success'
          });
        } catch (error) {
          console.error('Error processing member:', member.telegram_user_id, error);
          processedMembers.push({
            telegram_user_id: member.telegram_user_id,
            status: 'error',
            error: error.message
          });
        }
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
