
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

    const { memberId } = await req.json();

    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Get member and community info
    const { data: member, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select(`
        *,
        community:communities(
          telegram_chat_id
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
        }),
      }
    );

    const kickResult = await kickResponse.json();
    console.log('Kick response:', kickResult);

    if (!kickResult.ok) {
      throw new Error(`Failed to kick member: ${kickResult.description}`);
    }

    // Update member status in database
    const { error: updateError } = await supabase
      .from('telegram_chat_members')
      .update({
        is_active: false,
        subscription_status: false,
        subscription_end_date: new Date().toISOString(),
        subscription_plan_id: null,
      })
      .eq('id', memberId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
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
