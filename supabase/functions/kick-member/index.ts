
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { memberId, reason = 'removed' } = await req.json();

    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Validate reason is valid
    if (reason !== 'removed' && reason !== 'expired') {
      console.warn(`Invalid reason "${reason}" provided, defaulting to "removed"`);
    }

    const validReason = ['removed', 'expired'].includes(reason) ? reason : 'removed';
    console.log(`Processing kick with reason: ${validReason}`);

    // Get member and community info
    const { data: member, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select(`
        *,
        community:communities(
          telegram_chat_id,
          id
        )
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      throw new Error('Member not found');
    }

    // Get bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      throw new Error('Bot settings not found');
    }

    console.log('Removing member:', {
      memberId,
      telegramUserId: member.telegram_user_id,
      communityId: member.community.id,
      telegramChatId: member.community.telegram_chat_id,
      reason: validReason
    });

    // Kick member from channel
    const kickResponse = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: member.community.telegram_chat_id,
          user_id: member.telegram_user_id,
          until_date: Math.floor(Date.now() / 1000) + 32, // Minimal ban time (32 seconds)
          revoke_messages: false // Don't delete user's messages
        }),
      }
    );

    const kickResult = await kickResponse.json();
    console.log('Kick response:', kickResult);

    if (!kickResult.ok) {
      throw new Error(`Failed to kick member: ${kickResult.description}`);
    }

    // Unban the user after a short delay so they can rejoin in the future
    setTimeout(async () => {
      try {
        console.log('Unbanning member to allow future rejoins:', member.telegram_user_id);
        const unbanResponse = await fetch(
          `https://api.telegram.org/bot${settings.bot_token}/unbanChatMember`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: member.community.telegram_chat_id,
              user_id: member.telegram_user_id,
              only_if_banned: true
            }),
          }
        );

        const unbanResult = await unbanResponse.json();
        console.log('Unban response:', unbanResult);
        
        if (unbanResult.ok) {
          console.log('Successfully unbanned member:', member.telegram_user_id);
        } else {
          console.error('Failed to unban member:', unbanResult.description);
        }
      } catch (unbanError) {
        console.error('Error unbanning member:', unbanError);
        // Continue despite unban error as the kick was successful
      }
    }, 2000); // Wait 2 seconds before unbanning

    // Invalidate invite links to prevent rejoining
    console.log('Invalidating invite links...');
    const { error: inviteError } = await supabase
      .from('subscription_payments')
      .update({ invite_link: null })
      .eq('telegram_user_id', member.telegram_user_id)
      .eq('community_id', member.community.id);

    if (inviteError) {
      console.log('Error invalidating invite links:', inviteError);
      // Continue despite error as the main operation succeeded
    }

    // Update member status in database with correct reason
    const { error: updateError } = await supabase
      .from('telegram_chat_members')
      .update({
        is_active: false,
        subscription_status: validReason,
        subscription_end_date: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (updateError) {
      throw updateError;
    }

    // Log removal in activity logs with correct activity type
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: member.telegram_user_id,
        community_id: member.community.id,
        activity_type: validReason === 'expired' ? 'subscription_expired' : 'member_removed',
        details: validReason === 'expired'
          ? 'Member expired and removed from community'
          : 'Member manually removed from community via kick-member function',
        status: validReason
      })
      .catch(error => {
        console.error('Error logging removal activity:', error);
        // Continue despite error as the main operation succeeded
      });

    return new Response(
      JSON.stringify({ success: true, reason: validReason }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
