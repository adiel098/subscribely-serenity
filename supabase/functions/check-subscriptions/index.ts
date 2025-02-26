
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../telegram-webhook/telegramClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log('Starting check-subscriptions function');
  
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
      console.error('Bot token not found:', globalSettingsError);
      throw new Error('Bot token not found');
    }

    console.log('Fetching expired and expiring memberships...');

    // Get members that need to be checked - both expired and about to expire
    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select(`
        id,
        telegram_user_id,
        community_id,
        subscription_status,
        subscription_end_date,
        is_active,
        is_trial,
        trial_end_date,
        telegram_bot_settings!inner (
          auto_remove_expired,
          subscription_reminder_days,
          subscription_reminder_message,
          expired_subscription_message,
          chat_id
        )
      `)
      .eq('subscription_status', true)
      .eq('is_active', true)
      .or(`subscription_end_date.lt.${new Date().toISOString()},and(subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.lt.${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()})`);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    console.log(`Found ${members?.length || 0} members to process`);

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No members to process' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }

    for (const member of members) {
      console.log(`Processing member ${member.telegram_user_id} for community ${member.community_id}`);
      
      try {
        const now = new Date();
        const endDate = new Date(member.subscription_end_date);
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Handle expired subscriptions
        if (daysUntilEnd <= 0) {
          console.log(`Subscription expired for member ${member.telegram_user_id}`);
          
          if (member.telegram_bot_settings.auto_remove_expired) {
            console.log('Auto-remove is enabled, updating member status...');
            
            // Update member status
            const { error: updateError } = await supabase
              .from('telegram_chat_members')
              .update({
                subscription_status: false,
                is_active: false,
                last_checked: new Date().toISOString()
              })
              .eq('id', member.id);

            if (updateError) {
              console.error('Error updating member status:', updateError);
              throw updateError;
            }

            // Send expiration message
            if (member.telegram_bot_settings.expired_subscription_message) {
              await sendTelegramMessage(
                globalSettings.bot_token,
                member.telegram_user_id,
                member.telegram_bot_settings.expired_subscription_message
              );
            }

            // Log notification
            await supabase
              .from('subscription_notifications')
              .insert({
                member_id: member.id,
                community_id: member.community_id,
                notification_type: 'expiration',
                status: 'sent'
              });

            // Kick member from channel
            if (member.telegram_bot_settings.chat_id) {
              console.log(`Attempting to remove member ${member.telegram_user_id} from chat ${member.telegram_bot_settings.chat_id}`);
              
              const kickResponse = await fetch(
                `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: member.telegram_bot_settings.chat_id,
                    user_id: member.telegram_user_id,
                    until_date: Math.floor(Date.now() / 1000) + 32
                  })
                }
              );

              if (!kickResponse.ok) {
                const errorData = await kickResponse.json();
                console.error('Failed to remove member from channel:', errorData);
                throw new Error(`Failed to remove member: ${JSON.stringify(errorData)}`);
              }
            }
          }
        }
        // Handle subscriptions about to expire
        else if (daysUntilEnd <= member.telegram_bot_settings.subscription_reminder_days) {
          console.log(`Subscription expiring soon for member ${member.telegram_user_id} (${daysUntilEnd} days left)`);
          
          // Check if we haven't already sent a reminder recently
          const { data: recentNotification } = await supabase
            .from('subscription_notifications')
            .select()
            .eq('member_id', member.id)
            .eq('notification_type', 'reminder')
            .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!recentNotification && member.telegram_bot_settings.subscription_reminder_message) {
            console.log('Sending reminder message...');
            
            // Send reminder message
            await sendTelegramMessage(
              globalSettings.bot_token,
              member.telegram_user_id,
              member.telegram_bot_settings.subscription_reminder_message
            );

            // Log notification
            await supabase
              .from('subscription_notifications')
              .insert({
                member_id: member.id,
                community_id: member.community_id,
                notification_type: 'reminder',
                status: 'sent'
              });
          }
        }

        // Update last checked timestamp
        await supabase
          .from('telegram_chat_members')
          .update({ last_checked: new Date().toISOString() })
          .eq('id', member.id);

      } catch (error) {
        console.error('Error processing member:', member.id, error);
        
        // Log failed notification
        await supabase
          .from('subscription_notifications')
          .insert({
            member_id: member.id,
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
        processed: members.length 
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
