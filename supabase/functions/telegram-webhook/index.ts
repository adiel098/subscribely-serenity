
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
import { sendBroadcastMessage } from './broadcastHandler.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const body = await req.json();
    const { path, communityId } = body;
    console.log('Received request:', { path, communityId });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let response;

    switch (path) {
      case '/webhook':
        const update = body;
        console.log('Received webhook update:', update);

        if (update.chat_member) {
          await handleChatMemberUpdate(supabase, update);
        } else if (update.chat_join_request) {
          await handleChatJoinRequest(supabase, update);
        } else if (update.message) {
          await handleNewMessage(supabase, update, { BOT_TOKEN: Deno.env.get('BOT_TOKEN') ?? '' });
        } else if (update.edited_message) {
          await handleEditedMessage(supabase, update);
        } else if (update.channel_post) {
          await handleChannelPost(supabase, update);
        } else if (update.my_chat_member) {
          await handleMyChatMember(supabase, update);
        }

        response = { ok: true };
        break;

      case '/update-activity':
        await updateMemberActivity(supabase, communityId);
        response = { ok: true };
        break;

      case '/broadcast':
        if (!communityId || !body.message) {
          throw new Error('Missing required parameters');
        }

        const status = await sendBroadcastMessage(
          supabase,
          communityId,
          body.message,
          body.filterType || 'all',
          body.subscriptionPlanId
        );

        response = status;
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
