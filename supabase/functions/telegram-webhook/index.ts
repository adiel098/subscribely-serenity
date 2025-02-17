
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { 
  handleChatMemberUpdate,
  handleChatJoinRequest,
  handleNewMessage,
  handleEditedMessage,
  handleMyChatMember,
  updateMemberActivity
} from './membershipHandler.ts';
import { sendBroadcastMessage } from './broadcastHandler.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Check if this is a direct webhook update from Telegram
    if (body.message || body.edited_message || body.channel_post || body.chat_member || body.my_chat_member || body.chat_join_request) {
      console.log('Received direct Telegram webhook update:', body);
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (body.message) {
        await handleNewMessage(supabase, body);
      } else if (body.edited_message) {
        await handleEditedMessage(supabase, body);
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
        status: 200,
      });
    }

    // Handle other API endpoints
    const { path, communityId } = body;
    console.log('Received API request:', { path, communityId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let response;

    switch (path) {
      case '/update-activity':
        await updateMemberActivity(supabase, communityId);
        response = { ok: true };
        break;

      case '/broadcast':
        if (!communityId || !body.message) {
          throw new Error('Missing required parameters');
        }

        response = await sendBroadcastMessage(
          supabase,
          communityId,
          body.message,
          body.filterType || 'all',
          body.subscriptionPlanId,
          body.includeButton
        );
        break;

      default:
        throw new Error(`Unknown path: ${path}`);
    }

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
