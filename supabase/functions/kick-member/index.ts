
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TelegramClient } from "../_utils/telegramClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KickMemberRequest {
  memberId: string;
  telegram_user_id: string;
  community_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const telegramClient = new TelegramClient(Deno.env.get('TELEGRAM_BOT_TOKEN') || '');
    const { memberId, telegram_user_id, community_id } = await req.json() as KickMemberRequest;

    console.log('Received request to kick member:', { memberId, telegram_user_id, community_id });

    // Get the community's chat ID
    const { data: community, error: communityError } = await supabaseClient
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', community_id)
      .single();

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      throw new Error('Community not found');
    }

    console.log('Found community:', community);

    // Kick member from the chat
    try {
      await telegramClient.banChatMember(community.telegram_chat_id, telegram_user_id);
      console.log('Successfully kicked member from chat');

      // Update member status in database
      const { error: updateError } = await supabaseClient
        .from('telegram_chat_members')
        .update({ 
          is_active: false,
          subscription_status: false,
          subscription_end_date: new Date().toISOString()
        })
        .eq('id', memberId);

      if (updateError) {
        console.error('Error updating member status:', updateError);
        throw updateError;
      }

      // Log the event
      await supabaseClient
        .from('community_logs')
        .insert({
          community_id: community_id,
          event_type: 'member_left',
          user_id: telegram_user_id,
          metadata: {
            reason: 'subscription_cancelled',
            member_id: memberId
          }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error in kicking member:', error);
      throw error;
    }
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
