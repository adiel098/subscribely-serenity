
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    console.log('Fetching members to check...');

    // Get members that need to be checked using our new function
    const { data: membersToCheck, error: membersError } = await supabase
      .rpc('get_members_to_check');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    console.log(`Found ${membersToCheck?.length || 0} members to process`);

    // Get bot token from global settings
    const { data: globalSettings, error: globalSettingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (globalSettingsError || !globalSettings?.bot_token) {
      console.error('Error fetching bot token:', globalSettingsError);
      throw new Error('Bot token not found');
    }

    // Process each member
    for (const member of membersToCheck) {
      try {
        console.log('Processing member:', {
          memberId: member.member_id,
          telegramUserId: member.telegram_user_id,
          communityId: member.community_id
        });

        // Get bot settings for the community
        const { data: botSettings, error: botSettingsError } = await supabase
          .from('telegram_bot_settings')
          .select('*')
          .eq('community_id', member.community_id)
          .single();

        if (botSettingsError || !botSettings) {
          console.error('Error fetching bot settings:', botSettingsError);
          console.log('Community ID used for query:', member.community_id);
          continue;
        }

        console.log('Bot settings found:', {
          communityId: botSettings.community_id,
          chatId: botSettings.chat_id
        });

        // Only proceed if auto_remove_expired is enabled
        if (!botSettings.auto_remove_expired) {
          console.log('Auto-remove is disabled for this community, skipping...');
          continue;
        }

        // Make sure chat_id exists and format it correctly
        if (!botSettings.chat_id) {
          console.error('Chat ID is missing for community:', member.community_id);
          continue;
        }

        // Format chat ID - ensure it starts with -100 for supergroups/channels
        const formattedChatId = botSettings.chat_id.startsWith('-100') 
          ? botSettings.chat_id 
          : `-100${botSettings.chat_id.replace('-', '')}`;

        console.log('Chat ID details:', {
          originalChatId: botSettings.chat_id,
          formattedChatId: formattedChatId,
          communityId: member.community_id
        });

        // Check if member is still in the channel
        const getChatMemberResponse = await fetch(
          `https://api.telegram.org/bot${globalSettings.bot_token}/getChatMember`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: formattedChatId,
              user_id: parseInt(member.telegram_user_id)
            })
          }
        );

        const chatMemberData = await getChatMemberResponse.json();
        console.log('GetChatMember response:', chatMemberData);

        if (chatMemberData.ok && ['member', 'administrator', 'creator'].includes(chatMemberData.result.status)) {
          console.log(`Member ${member.telegram_user_id} is still in the channel, checking subscription...`);
          
          // If subscription has expired, remove member
          if (!member.subscription_status || (member.subscription_end_date && new Date(member.subscription_end_date) < new Date())) {
            console.log(`Removing member ${member.telegram_user_id} due to expired subscription`);
            
            // Remove member from channel
            const kickResponse = await fetch(
              `https://api.telegram.org/bot${globalSettings.bot_token}/banChatMember`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: formattedChatId,
                  user_id: parseInt(member.telegram_user_id),
                  until_date: Math.floor(Date.now() / 1000) + 35 // Ban for 35 seconds
                })
              }
            );

            const kickData = await kickResponse.json();
            console.log('Kick response:', kickData);

            if (kickData.ok) {
              // Update member status
              const { error: updateError } = await supabase
                .from('telegram_chat_members')
                .update({ 
                  is_active: false,
                  last_checked: new Date().toISOString()
                })
                .eq('id', member.member_id);

              if (updateError) {
                console.error('Error updating member status:', updateError);
                continue;
              }

              // Log the removal
              await supabase
                .from('subscription_notifications')
                .insert({
                  member_id: member.member_id,
                  community_id: member.community_id,
                  notification_type: 'removal',
                  status: 'completed'
                });

              // Unban after 32 seconds to allow future joins
              setTimeout(async () => {
                try {
                  const unbanResponse = await fetch(
                    `https://api.telegram.org/bot${globalSettings.bot_token}/unbanChatMember`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        chat_id: formattedChatId,
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
            }
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
            .eq('id', member.member_id);
        }
      } catch (error) {
        console.error('Error processing member:', error);
        
        // Log the error
        await supabase
          .from('subscription_notifications')
          .insert({
            member_id: member.member_id,
            community_id: member.community_id,
            notification_type: 'removal',
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

