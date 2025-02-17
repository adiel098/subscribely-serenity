
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { 
  handleChatMemberUpdate,
  handleChatJoinRequest,
  handleNewMessage,
  handleEditedMessage,
  handleChannelPost,
  handleMyChatMember,
  updateMemberActivity
} from './membershipHandler.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[WEBHOOK] Received webhook request:', JSON.stringify(body, null, 2));
    
    if (body.message || body.edited_message || body.channel_post || body.chat_member || body.my_chat_member || body.chat_join_request) {
      console.log('[WEBHOOK] Creating Supabase client...');
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (body.message) {
        await handleNewMessage(supabase, body, { BOT_TOKEN: Deno.env.get('BOT_TOKEN') ?? '' });
      } else if (body.edited_message) {
        await handleEditedMessage(supabase, body);
      } else if (body.channel_post) {
        console.log('[WEBHOOK] Detected channel post, text:', body.channel_post.text);
        await handleChannelPost(supabase, body);
        console.log('[WEBHOOK] Finished handling channel post');
      } else if (body.chat_member) {
        await handleChatMemberUpdate(supabase, body);
      } else if (body.my_chat_member) {
        await handleMyChatMember(supabase, body);
      } else if (body.chat_join_request) {
        await handleChatJoinRequest(supabase, body);
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: 'No handler found for this type of request',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  } catch (error) {
    console.error('[WEBHOOK] Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
