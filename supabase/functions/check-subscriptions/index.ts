
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
    // Initialize Supabase client
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

    console.log('Fetching inactive members...');

    // Get members that need to be checked
    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select(`
        id,
        telegram_user_id,
        community_id,
        subscription_status,
        subscription_end_date,
        is_active,
        telegram_bot_settings!inner (
          auto_remove_expired,
          chat_id
        )
      `)
      .eq('is_active', true)
      .eq('subscription_status', false);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    console.log(`Found ${members?.length || 0} inactive members to process`);

    for (const member of members) {
      console.log(`Processing member ${member.telegram_user_id} for community ${member.community_id}`);
      
      try {
        if (member.telegram_bot_settings.auto_remove_expired) {
          console.log('Auto-remove is enabled, checking member status in channel...');
          
          // Check if member is still in the channel
          try {
            const getChatMemberResponse = await fetch(
              `https://api.telegram.org/bot${globalSettings.bot_token}/getChatMember`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: member.telegram_bot_settings.chat_id,
                  user_id: parseInt(member.telegram_user_id)
                })
              }
            );

            const chatMemberData = await getChatMemberResponse.json();
            console.log('GetChatMember response:', chatMemberData);

            if (chatMemberData.ok && ['member', 'administrator', 'creator'].includes(chatMemberData.result.status)) {
              console.log(`Member ${member.telegram_user_id} is still in the channel, attempting removal...`);
              
              // Remove member from channel
              const kickResponse = await fetch(
                `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: member.telegram_bot_settings.chat_id,
                    user_id: parseInt(member.telegram_user_id),
                    until_date: Math.floor(Date.now() / 1000) + 35 // Ban for 35 seconds
                  })
                }
              );

              const kickData = await kickResponse.json();
              console.log('Kick response:', kickData);

              if (kickData.ok) {
                console.log(`Successfully removed member ${member.telegram_user_id}`);
                
                // Update member status in database
                const { error: updateError } = await supabase
                  .from('telegram_chat_members')
                  .update({ 
                    is_active: false,
                    last_checked: new Date().toISOString()
                  })
                  .eq('id', member.id);

                if (updateError) {
                  console.error('Error updating member status:', updateError);
                  throw updateError;
                }

                // Unban after 32 seconds to allow future joins
                setTimeout(async () => {
                  try {
                    const unbanResponse = await fetch(
                      `https://api.telegram.org/bot${globalSettings.bot_token}/unbanChatMember`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          chat_id: member.telegram_bot_settings.chat_id,
                          user_id: parseInt(member.telegram_user_id),
                          only_if_banned: true
                        })
                      }
                    );

                    const unbanData = await unbanResponse.json();
                    console.log('Unban response:', unbanData);
                  } catch (error) {
                    console.error('Error unbanning member:', error);
                  }
                }, 32000);

                // Log the removal
                await supabase
                  .from('subscription_notifications')
                  .insert({
                    member_id: member.id,
                    community_id: member.community_id,
                    notification_type: 'removal',
                    status: 'completed'
                  });
              } else {
                console.error(`Failed to remove member ${member.telegram_user_id}:`, kickData);
                throw new Error(`Failed to remove member: ${JSON.stringify(kickData)}`);
              }
            } else {
              console.log(`Member ${member.telegram_user_id} is not in the channel or already left`);
              
              // Update member status as inactive
              await supabase
                .from('telegram_chat_members')
                .update({ 
                  is_active: false,
                  last_checked: new Date().toISOString()
                })
                .eq('id', member.id);
            }
          } catch (error) {
            console.error('Error checking/removing member:', error);
            
            // Log the error
            await supabase
              .from('subscription_notifications')
              .insert({
                member_id: member.id,
                community_id: member.community_id,
                notification_type: 'removal',
                status: 'failed',
                error: error.message
              });
          }
        } else {
          console.log('Auto-remove is disabled for this community');
        }

      } catch (error) {
        console.error('Error processing member:', error);
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
