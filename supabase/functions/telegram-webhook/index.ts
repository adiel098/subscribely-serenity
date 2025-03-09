import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChannelVerification } from "./handlers/channelVerificationHandler.ts";
import { handleMyChatMember } from "./handlers/botStatusHandler.ts";
import { corsHeaders } from "./cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Now we want to use this information to decide what type of event we're dealing with
    const update = await req.json()
    console.log('Full update object:', JSON.stringify(update, null, 2));

    // New channel verification flow
    if (update.message && update.message.text && update.message.text.startsWith('MBF_')) {
      console.log('Detected channel verification message:', update.message.text);
      await handleChannelVerification(supabase, update.message, botToken);
    }

    // Handle updates to the bot's status in a chat
    if (update.my_chat_member) {
      console.log('Detected my_chat_member update:', JSON.stringify(update.my_chat_member, null, 2));
      await handleMyChatMember(supabase, update.my_chat_member, botToken);
    }

    return new Response(JSON.stringify({ message: 'Processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
