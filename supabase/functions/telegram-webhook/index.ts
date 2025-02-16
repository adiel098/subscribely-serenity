
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
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get request data
    const { path, communityId } = await req.json();
    console.log('Received request:', { path, communityId });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (path) {
      case '/webhook':
        const update = await req.json();
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

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });

      case '/update-activity':
        await updateMemberActivity(supabase, communityId);
        break;

      case '/broadcast':
        if (!communityId || !req.body?.message) {
          throw new Error('Missing required parameters');
        }

        const status = await sendBroadcastMessage(
          supabase,
          communityId,
          req.body.message,
          req.body.filterType || 'all'
        );

        return new Response(JSON.stringify(status), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });

      default:
        throw new Error(`Unknown path: ${path}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
